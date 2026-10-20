import { useCallback, useEffect, useRef, useState } from 'react';
import {
  encode,
  parseMessage,
  type CameraState,
  type GlobeCommand,
} from '../map-contract/protocol';
import type { MapViewportProps } from '../map-contract/viewport';
import { getModernCity } from '../places/modern';
import { placesRepository } from '../places/runtime';
import type { PlaceLayerState } from './globe/modern-city-markers';
import { invalidatesPlaceSelection } from './selection-requests';

let sessions = 0;
export function useGlobeHost(options: MapViewportProps = {}) {
  const noteCallback = useRef(options.onNoteSelected);
  const currentNotes = useRef(options.notes);
  useEffect(() => {
    noteCallback.current = options.onNoteSelected;
    currentNotes.current = options.notes;
  }, [options.onNoteSelected, options.notes]);
  const roadsCallback = useRef(options.onRoadsStatus);
  useEffect(() => {
    roadsCallback.current = options.onRoadsStatus;
  }, [options.onRoadsStatus]);
  const selectedCallback = useRef(options.onDemoSelected);
  const cameraCallback = useRef(options.onCameraChange);
  const restoreCamera = useRef(options.initialCamera);
  const wasReady = useRef(false);
  useEffect(() => {
    cameraCallback.current = options.onCameraChange;
  }, [options.onCameraChange, options.initialCamera]);
  const appliedCallback = useRef(options.onTimelineApplied);
  useEffect(() => {
    appliedCallback.current = options.onTimelineApplied;
  }, [options.onTimelineApplied]);
  const historicalCallback = useRef(options.onHistoricalSelected);
  const articleCallback = useRef(options.onArticleRequested);
  useEffect(() => {
    articleCallback.current = options.onArticleRequested;
  }, [options.onArticleRequested]);
  const pageCallback = useRef(options.onSelectionPage);
  const cityCallback = useRef(options.onModernCitySelected);
  const citiesEnabled = useRef(options.showModernCities ?? true);
  const cityRequest = useRef<AbortController | null>(null);
  const [placesStatus, setPlacesStatus] = useState<PlaceLayerState>('not-installed');
  const [cityError, setCityError] = useState(false);
  useEffect(() => () => cityRequest.current?.abort(), []);
  useEffect(() => {
    cityCallback.current = options.onModernCitySelected;
    citiesEnabled.current = options.showModernCities ?? true;
    if (!citiesEnabled.current) cityRequest.current?.abort();
  }, [options.onModernCitySelected, options.showModernCities]);
  useEffect(() => {
    pageCallback.current = options.onSelectionPage;
  }, [options.onSelectionPage]);
  useEffect(() => {
    historicalCallback.current = options.onHistoricalSelected;
  }, [options.onHistoricalSelected]);
  useEffect(() => {
    selectedCallback.current = options.onDemoSelected;
  }, [options.onDemoSelected]);
  const [sessionId] = useState(() => `globe-${Date.now()}-${++sessions}`);
  const [command, setCommand] = useState<string | null>(null);
  const [dataError, setDataError] = useState(false);
  const [dataRetry, setDataRetry] = useState(0);
  const desiredRevision = useRef(options.timelineRevision ?? 0);
  useEffect(() => {
    desiredRevision.current = options.timelineRevision ?? 0;
    cityRequest.current?.abort();
  }, [options.timelineRevision]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(false);
  const [historicalSelected, setHistoricalSelected] = useState(false);
  const [camera, setCamera] = useState<CameraState | null>(null);
  const sequence = useRef(0);
  const lastEvent = useRef(0);
  const onEvent = useCallback(
    async (raw: string): Promise<void> => {
      const event = parseMessage(raw, 'event', sessionId);
      if (!event || !/^event-[1-9]\d{0,8}$/.test(event.requestId)) return;
      const ordinal = Number(event.requestId.slice(6));
      if (ordinal <= lastEvent.current) return;
      lastEvent.current = ordinal;
      if (invalidatesPlaceSelection(event.type)) cityRequest.current?.abort();
      switch (event.type) {
        case 'note.selected':
          if (currentNotes.current?.some((n) => n.id === event.payload.id))
            noteCallback.current?.(event.payload.id);
          break;
        case 'roads.status':
          roadsCallback.current?.(event.payload.state);
          break;
        case 'city.selected':
          cityRequest.current?.abort();
          if (citiesEnabled.current) {
            const city = getModernCity(event.payload.cityId);
            if (city) {
              setCityError(false);
              cityCallback.current?.(city);
            }
          }
          break;
        case 'place.selected': {
          cityRequest.current?.abort();
          if (!citiesEnabled.current) break;
          const request = new AbortController();
          cityRequest.current = request;
          setCityError(false);
          try {
            const { cityId, packIndex, catalogVersion } = event.payload;
            const city = await placesRepository.get(
              cityId,
              packIndex,
              catalogVersion,
              request.signal,
            );
            if (city && !request.signal.aborted && citiesEnabled.current)
              cityCallback.current?.(city);
            else if (!request.signal.aborted) setCityError(true);
          } catch {
            if (!request.signal.aborted) setCityError(true);
          }
          break;
        }
        case 'places.status':
          setPlacesStatus(event.payload.state);
          break;
        case 'selection.changed':
          setSelected(false);
          setHistoricalSelected(true);
          pageCallback.current?.(event.payload);
          break;
        case 'renderer.ready':
          setReady(true);
          setSelected(false);
          setHistoricalSelected(false);
          setCamera(null);
          break;
        case 'renderer.error':
          cityRequest.current?.abort();
          setReady(false);
          setSelected(false);
          setHistoricalSelected(false);
          setCamera(null);
          break;
        case 'catalog.error':
          if (event.payload.revision === desiredRevision.current) setDataError(true);
          break;
        case 'catalog.applied':
          if (event.payload.revision !== desiredRevision.current) break;
          setDataError(false);
          appliedCallback.current?.(event.payload);
          break;
        case 'camera.changed':
          if (!wasReady.current && restoreCamera.current) return;
          restoreCamera.current = event.payload;
          setCamera(event.payload);
          cameraCallback.current?.(event.payload);
          break;
        case 'demo.selected':
          setSelected(true);
          setHistoricalSelected(false);
          selectedCallback.current?.();
          break;
        case 'entity.article':
          if (event.payload.revision === desiredRevision.current)
            articleCallback.current?.(event.payload.recordId, event.payload.revision);
          break;
        case 'entity.selected':
          setSelected(false);
          setHistoricalSelected(true);
          historicalCallback.current?.(
            event.payload.recordId,
            event.payload.candidateIds ?? [event.payload.recordId],
            event.payload.revision ?? 0,
          );
          break;
      }
    },
    [sessionId],
  );
  const reset = () => {
    const message: GlobeCommand = {
      version: 1,
      type: 'camera.reset',
      sessionId,
      requestId: `command-${++sequence.current}`,
      payload: {},
    };
    setCommand(encode(message));
  };
  const previousReset = useRef(options.resetRequest);
  const lastCameraRequest = useRef(options.cameraRequest?.sequence);
  const previousFocus = useRef(options.pilotFocusRequest);
  const clearingHistory = useRef(false);
  const lastDataRetry = useRef(0);
  useEffect(() => {
    if (!ready) {
      clearingHistory.current = false;
      wasReady.current = false;
      return;
    }
    // A scrub burst needs one clear, followed by one final apply; no 60 Hz bridge flood.
    const manualCamera =
      options.cameraRequest && lastCameraRequest.current !== options.cameraRequest.sequence;
    const restoredCamera = manualCamera
      ? options.cameraRequest!.camera
      : !wasReady.current
        ? restoreCamera.current
        : null;
    if (options.suspendHistory && clearingHistory.current && !restoredCamera) return;
    wasReady.current = true;
    lastCameraRequest.current = options.cameraRequest?.sequence;
    clearingHistory.current = options.suspendHistory ?? false;
    const focusPilot = previousFocus.current !== options.pilotFocusRequest;
    previousFocus.current = options.pilotFocusRequest;
    const retryData = lastDataRetry.current !== dataRetry;
    lastDataRetry.current = dataRetry;
    setCommand(
      encode({
        version: 1,
        type: 'catalog.view',
        sessionId,
        requestId: `command-${++sequence.current}`,
        payload: {
          projection: options.projection ?? 'globe',
          notes: options.notes ?? [],
          showDemo: options.showDemo ?? true,
          reducedMotion: options.reducedMotion ?? true,
          retryData,
          ...(restoredCamera ? { camera: restoredCamera } : {}),
          year: options.historicalYear ?? new Date().getFullYear(),
          polity: options.showPolities ?? true,
          culture: options.showCultures ?? true,
          person: options.showPersons ?? false,
          battle: options.showBattles ?? false,
          event: options.showEvents ?? false,
          labels: options.showHistoricalLabels ?? true,
          modernCities: options.showModernCities ?? true,
          modernRoads: options.showModernRoads ?? true,
          sparseLabels: options.sparseLabels ?? false,
          ...(options.filters ? { filters: options.filters } : {}),
          includeApproximatePersons: options.includeApproximatePersons ?? false,
          focusPilot,
          selectedId: options.selectedHistoricalId ?? options.selectedPolityId ?? null,
          revision: options.timelineRevision ?? 0,
          suspendHistory: options.suspendHistory ?? false,
          previewSnapshot: options.previewSnapshot ?? false,
        },
      }),
    );
  }, [
    ready,
    dataRetry,
    sessionId,
    options.historicalYear,
    options.projection,
    options.notes,
    options.showDemo,
    options.reducedMotion,
    options.cameraRequest,
    options.showPolities,
    options.showCultures,
    options.showPersons,
    options.showBattles,
    options.showEvents,
    options.showHistoricalLabels,
    options.showModernCities,
    options.showModernRoads,
    options.sparseLabels,
    options.filters,
    options.includeApproximatePersons,
    options.pilotFocusRequest,
    options.previewSnapshot,
    options.timelineRevision,
    options.suspendHistory,
    options.selectedPolityId,
    options.selectedHistoricalId,
  ]);
  const lastPageRequest = useRef(options.selectionPageRequest?.sequence);
  useEffect(() => {
    const request = options.selectionPageRequest;
    if (
      !ready ||
      !request ||
      options.suspendHistory ||
      request.sequence === lastPageRequest.current ||
      request.revision !== options.timelineRevision
    )
      return;
    lastPageRequest.current = request.sequence;
    setCommand(
      encode({
        version: 1,
        type: 'selection.page',
        sessionId,
        requestId: `command-${++sequence.current}`,
        payload: {
          selectionId: request.selectionId,
          revision: request.revision,
          offset: request.offset,
        },
      }),
    );
  }, [
    ready,
    sessionId,
    options.selectionPageRequest,
    options.suspendHistory,
    options.timelineRevision,
  ]);
  useEffect(() => {
    if (previousReset.current !== options.resetRequest) {
      previousReset.current = options.resetRequest;
      if (ready) reset();
    }
  });

  const lastPoliticalFocus = useRef(options.politicalFocusRequest);
  useEffect(() => {
    if (!ready || options.suspendHistory) return;
    const focus = lastPoliticalFocus.current !== options.politicalFocusRequest;
    if (!focus) return;
    lastPoliticalFocus.current = options.politicalFocusRequest;
    const recordId = options.selectedPolityId ?? null;
    if (recordId)
      setCommand(
        encode({
          version: 1,
          type: 'polity.focus',
          sessionId,
          requestId: `command-${++sequence.current}`,
          payload: {
            recordId,
            revision: options.timelineRevision ?? 0,
            reducedMotion: options.reducedMotion ?? true,
          },
        }),
      );
  }, [
    ready,
    sessionId,
    options.selectedPolityId,
    options.politicalFocusRequest,
    options.reducedMotion,
    options.suspendHistory,
    options.timelineRevision,
  ]);

  const readyCallback = useRef(options.onReadyChange);
  useEffect(() => {
    readyCallback.current = options.onReadyChange;
  }, [options.onReadyChange]);
  useEffect(() => {
    readyCallback.current?.(ready);
    return () => readyCallback.current?.(false);
  }, [ready]);
  return {
    sessionId,
    command,
    onEvent,
    ready,
    selected,
    historicalSelected,
    camera,
    reset,
    dataError,
    placesStatus,
    cityError,
    retryData: () => {
      setDataError(false);
      setDataRetry((v) => v + 1);
    },
  };
}
