import { modernRoads, roadRequest, ROAD_SOURCE, type RoadStatus } from './modern-roads.ts';
import { yearLabel } from '../../atlas/yearLabel.ts';
import { projectAnchor } from './project-anchor.ts';
import { count, measure, profilingEnabled, localMetrics } from '../../performance/metrics.ts';
import { personMarkers } from './person-markers.ts';
import { noteMarkers } from './note-markers.ts';
import { eventSymbol } from '../../events/model.ts';
import type { HistoricalEventType } from '../../domain/types.ts';
import { modernCityMarkers } from './modern-city-markers.ts';
import type { PlaceLayerState } from './modern-city-markers.ts';
import type { PlacesProvider } from '../../places/repository.ts';
import { theme } from '../../theme/tokens.ts';
import type * as MapLibre from 'maplibre-gl';
import { dataErrorCode } from '../../data/error-code.ts';
import { t } from '../../i18n/index.ts';
import {
  DEMO_ID,
  INITIAL_CAMERA,
  MAX_MAP_ZOOM,
  isCamera,
  type CameraState,
  type GlobeCommand,
  type RendererError,
} from '../../map-contract/protocol.ts';
import type { LandCollection } from './land.ts';
import type { PhysicalDetail } from './physical-detail.ts';
import { resourceScope } from './lifecycle.ts';
import { physicalStyle } from './style.ts';
import {
  historicalFeatures,
  type HistoricalView,
  type RenderFeatureCollection,
} from '../../data/pilot.ts';
import { rankPoliticalHits } from '../../politics/selection.ts';
import { focusPlan } from '../../discovery/camera.ts';
import { politicalLabels } from './political-labels.ts';
import { PILOT_CAMERA, PILOT_VERSION } from '../../data/pilot-contract.ts';
import type { AppliedTimeline } from '../../timeline/store.ts';
import { createHitSelection, type HistoricalSelectionPage } from '../../map-contract/selection.ts';
import { facingGlobe } from '../../persons/clustering.ts';

const wrap = (value: number) => ((((value + 180) % 360) + 360) % 360) - 180;
export function mountRenderer(
  library: typeof MapLibre,
  container: HTMLDivElement,
  land: LandCollection,
  worker: string,
  callbacks: {
    ready: () => void;
    noteSelected?: (id: string) => void;
    roadsStatus?: (status: RoadStatus) => void;
    camera: (camera: CameraState) => void;
    selected: () => void;
    error: (code: RendererError) => void;
    historicalSelected?: (id: string, candidates?: string[], revision?: number) => void;
    catalogApplied?: (payload: AppliedTimeline) => void;
    dataError?: (revision: number) => void;
    selectionChanged?: (payload: HistoricalSelectionPage) => void;
    articleRequested?: (id: string, revision: number) => void;
    modernCitySelected?: (id: string, packIndex?: number, catalogVersion?: string) => void;
    modernPlacesStatus?: (state: PlaceLayerState, loaded: number) => void;
  },
  options: {
    loadFeatures?: typeof historicalFeatures;
    initialShowDemo?: boolean;
    physicalDetail?: PhysicalDetail;
    placesProvider?: PlacesProvider;
  } = {},
) {
  const scope = resourceScope();
  let map: MapLibre.Map;
  let roads: ReturnType<typeof modernRoads> | undefined;
  let restoreRoads = false;
  let historyAbort = new AbortController();
  scope.add(() => historyAbort.abort());
  let initialized = false;
  let demoButton: HTMLButtonElement | null = null;
  let historicalView: HistoricalView = {
    year: new Date().getFullYear(),
    polity: true,
    culture: true,
  };
  let viewRevision = 0;
  let requestedRevision = 0;
  let suspended = false,
    paused = false;
  let lastViewSignature = '';
  let visibleIds = new Set<string>();
  let reducedMotion = true;
  let selectedId: string | null = null;
  let currentFeatures: RenderFeatureCollection['features'] = [];
  const hitSelection = createHitSelection(PILOT_VERSION);
  const fail = (code: RendererError) => {
    if (scope.disposed) return;
    scope.dispose();
    callbacks.error(code);
  };
  try {
    const workerUrl = URL.createObjectURL(new Blob([worker], { type: 'text/javascript' }));
    scope.add(() => URL.revokeObjectURL(workerUrl));
    library.setWorkerCount(1);
    library.setWorkerUrl(workerUrl);
    map = new library.Map({
      container,
      style: physicalStyle(land, options.physicalDetail),
      center: [INITIAL_CAMERA.center.lng, INITIAL_CAMERA.center.lat],
      zoom: INITIAL_CAMERA.zoom,
      bearing: 0,
      pitch: 0,
      minZoom: 0,
      maxZoom: MAX_MAP_ZOOM,
      maxTileCacheSize: 128,
      maxPitch: 60,
      canvasContextAttributes: { antialias: false, preserveDrawingBuffer: false },
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      dragPan: true,
      dragRotate: true,
      touchZoomRotate: true,
      touchPitch: true,
      scrollZoom: true,
      keyboard: true,
      attributionControl: false,
      // Only explicitly enabled contemporary XYZ tiles; all other remote resources denied.
      transformRequest: (url) => roadRequest(url, roads?.allowed() ?? false),
    });
    scope.add(() => map.remove());
    const notes = noteMarkers(library, map, (id) => callbacks.noteSelected?.(id));
    scope.add(() => notes.dispose());
    scope.add(() => roads?.dispose());
    if (profilingEnabled()) {
      const rendered = () => count('map.render');
      map.on('render', rendered);
      scope.add(() => map.off('render', rendered));
    }
    const emitSelection = (id: string, candidates = [id]) => {
      if (
        scope.disposed ||
        suspended ||
        !visibleIds.has(id) ||
        !currentFeatures.some(
          (f) =>
            f.id === id &&
            ['territory', 'cultural-region', 'person-location', 'event', 'place'].includes(
              f.properties.kind,
            ),
        )
      )
        return;
      const page = hitSelection.begin(
        [id, ...candidates.filter((candidate) => candidate !== id && visibleIds.has(candidate))],
        requestedRevision,
      );
      if (page && callbacks.selectionChanged) callbacks.selectionChanged(page);
      else callbacks.historicalSelected?.(id, candidates.slice(0, 8), requestedRevision);
    };
    const expandCluster = (ids: string[], id: string) => {
      if (ids.length < 2 || map.getZoom() >= MAX_MAP_ZOOM) return;
      const p = currentFeatures.find((f) => f.id === id)?.properties;
      if (p?.anchorLng === null || p?.anchorLat === null || !p) return;
      map.easeTo?.({
        center: [p.anchorLng, p.anchorLat],
        zoom: Math.min(MAX_MAP_ZOOM, map.getZoom() + 1),
        duration: reducedMotion ? 0 : 250,
        essential: false,
      });
    };
    const labels = politicalLabels(library, map, container, (id) => {
      const p = currentFeatures.find((feature) => feature.id === id)?.properties;
      if (
        p?.kind === 'territory' &&
        visibleIds.has(id) &&
        !suspended &&
        !scope.disposed &&
        callbacks.articleRequested
      ) {
        callbacks.articleRequested(id, requestedRevision);
        return;
      }
      if (p && p.anchorLng !== null && p.anchorLat !== null && typeof map.project === 'function')
        selectAt(projectAnchor(map, p.anchorLng, p.anchorLat), id);
      else emitSelection(id);
    });
    scope.add(labels.dispose);
    const people = personMarkers(
      library,
      map,
      container,
      (ids, id) => {
        expandCluster(ids, id);
        const p = currentFeatures.find((f) => f.id === id)?.properties;
        if (p && typeof map.project === 'function')
          selectAt(projectAnchor(map, p.anchorLng!, p.anchorLat!), id, ids);
        else emitSelection(id, ids);
      },
      {
        kind: 'person-location',
        kinds: ['person-location', 'event'],
        className: 'atlas-discovery-marker',
        selectLabel: t('atlas.info'),
        clusterLabel: t('discovery.cluster'),
        clusterNotice: t('discovery.clusterNotice'),
        symbol: (f) =>
          f.properties.kind === 'event'
            ? eventSymbol(f.properties.classification as HistoricalEventType)
            : '●',
      },
    );
    scope.add(people.dispose);
    const cities = modernCityMarkers(
      library,
      map,
      container,
      (id, pack, version) => {
        if (!scope.disposed && !paused) callbacks.modernCitySelected?.(id, pack, version);
      },
      options.placesProvider,
      (state, loaded) => {
        if (!scope.disposed && !paused) callbacks.modernPlacesStatus?.(state, loaded);
      },
    );
    scope.add(cities.dispose);
    const applySelection = (id: string | null) => {
      if (typeof map.removeFeatureState === 'function')
        map.removeFeatureState({ source: 'historical' });
      selectedId = id;
      if (id && visibleIds.has(id) && typeof map.setFeatureState === 'function')
        map.setFeatureState({ source: 'historical', id }, { selected: true });
      labels.set(
        currentFeatures,
        selectedId,
        historicalView.labels ?? true,
        historicalView.sparseLabels ?? false,
      );
      people.set(currentFeatures, selectedId);
      measure('persons.clusterMs', () => people.refresh());
      measure('labels.refreshMs', () => labels.refresh());
    };
    const refreshHistory = async () => {
      if (scope.disposed || paused || !initialized) return;
      const signature = `${requestedRevision}/${suspended}/${historicalView.year}/${historicalView.polity}/${historicalView.culture}/${historicalView.person ?? false}/${historicalView.battle ?? false}/${historicalView.event ?? false}/${historicalView.includeApproximatePersons ?? false}/${historicalView.previewSnapshot ?? false}/${historicalView.labels ?? true}/${historicalView.sparseLabels ?? false}/${JSON.stringify(historicalView.filters ?? null)}/${map.getZoom() < 2.5 ? 'coarse' : 'fine'}`;
      if (signature === lastViewSignature) return;
      lastViewSignature = signature;
      historyAbort.abort();
      historyAbort = new AbortController();
      const signal = historyAbort.signal;
      const revision = ++viewRevision;
      const inputRevision = requestedRevision;
      const requestedYear = historicalView.year;
      container.dataset.historicalStatus = 'loading';
      try {
        const source = map.getSource('historical') as MapLibre.GeoJSONSource | undefined;
        if (!source) throw new Error('Missing historical source');
        visibleIds = new Set();
        currentFeatures = [];
        labels.set([], null);
        people.set([], null);
        cities.refresh();
        measure('persons.clusterMs', () => people.refresh());
        measure('labels.refreshMs', () => labels.refresh());
        const cleared = source.setData({ type: 'FeatureCollection', features: [] });
        container.dataset.historicalCount = '0';
        delete container.dataset.historicalSourceYear;
        container.dataset.historicalPreview = 'false';
        await cleared;
        if (scope.disposed || revision !== viewRevision) return;
        if (suspended) {
          container.dataset.historicalYear = String(requestedYear);
          callbacks.catalogApplied?.({
            revision: inputRevision,
            year: requestedYear,
            sourceYear: null,
            coverageStatus: 'loading',
            catalogVersion: PILOT_VERSION,
          });
          return;
        }
        const features = await (options.loadFeatures ?? historicalFeatures)(
          { ...historicalView, signal },
          map.getZoom(),
        );
        if (scope.disposed || revision !== viewRevision) return;
        const applyStarted = profilingEnabled() ? performance.now() : null;
        await source.setData(features);
        if (applyStarted !== null)
          localMetrics.record('map.setDataMs', performance.now() - applyStarted);
        if (scope.disposed || revision !== viewRevision) return;
        visibleIds = new Set(features.features.map((feature) => feature.id));
        currentFeatures = features.features;
        applySelection(selectedId);
        container.dataset.historicalCount = String(features.features.length);
        container.dataset.historicalYear = String(historicalView.year);
        const firstFeature = features.features[0];
        if (firstFeature)
          container.dataset.historicalSourceYear = String(firstFeature.properties.sourceYear);
        container.dataset.historicalPreview = String(firstFeature?.properties.preview ?? false);
        container.dataset.historicalStatus = 'ready';
        callbacks.catalogApplied?.({
          revision: inputRevision,
          year: requestedYear,
          sourceYear: firstFeature?.properties.sourceYear ?? null,
          coverageStatus:
            firstFeature?.properties.coverageMode ?? 'no supported historical geography',
          catalogVersion: PILOT_VERSION,
        });
      } catch (error) {
        if (!scope.disposed && !signal.aborted && revision === viewRevision) {
          console.warn('[atlas.renderer.data]', dataErrorCode(error));
          container.dataset.historicalStatus = 'error';
          lastViewSignature = '';
          if (callbacks.dataError) callbacks.dataError(inputRevision);
          else fail('assets');
        }
      }
    };
    const zoomed = () => {
      void refreshHistory();
    };
    map.on('zoomend', zoomed);
    scope.add(() => map.off('zoomend', zoomed));
    let mapDragged = false;
    const pointerStarted = () => {
      mapDragged = false;
    };
    const dragged = () => {
      mapDragged = true;
    };
    const selectAt = (
      point: MapLibre.MapMouseEvent['point'],
      preferredId?: string,
      additionalIds: string[] = [],
    ) => {
      if (scope.disposed || visibleIds.size === 0) return;
      const matches = map.queryRenderedFeatures(point, {
        layers: [
          'polity-area',
          'polity-documented',
          'polity-approximate',
          'polity-disputed',
          'polity-shared',
          'polity-vassal',
          'culture-area',
          'culture-uncertain',
          'event-area',
          'event-region-edge',
        ],
      });
      const candidates = rankPoliticalHits(
        [
          ...matches,
          ...currentFeatures.filter((feature) => {
            const p = feature.properties;
            if (
              !['person-location', 'event', 'place'].includes(p.kind) ||
              p.anchorLng === null ||
              p.anchorLat === null ||
              typeof map.project !== 'function'
            )
              return false;
            const center = map.getCenter();
            if (
              map.getProjection()?.type === 'globe' &&
              !facingGlobe(p.anchorLng, p.anchorLat, center.lng, center.lat)
            )
              return false;
            const projected = projectAnchor(map, p.anchorLng, p.anchorLat);
            return Math.abs(projected.x - point.x) <= 24 && Math.abs(projected.y - point.y) <= 24;
          }),
          ...additionalIds.map((id) => ({
            properties: currentFeatures.find((f) => f.id === id)?.properties,
          })),
        ]
          .filter((feature) => feature.properties?.catalogVersion === PILOT_VERSION)
          .map((feature) => ({
            recordId: String(feature.properties?.recordId),
            priority: Number(feature.properties?.priority ?? 0),
            selected: feature.properties?.recordId === (preferredId ?? selectedId),
          })),
        visibleIds,
        1000,
      );
      if (candidates[0]) emitSelection(candidates[0], candidates);
    };
    const selectedHistorical = (event: MapLibre.MapMouseEvent) => {
      if (!mapDragged) selectAt(event.point);
    };
    map.on('mousedown', pointerStarted);
    map.on('touchstart', pointerStarted);
    map.on('dragstart', dragged);
    map.on('click', selectedHistorical);
    scope.add(() => {
      map.off('mousedown', pointerStarted);
      map.off('touchstart', pointerStarted);
      map.off('dragstart', dragged);
      map.off('click', selectedHistorical);
    });
    const hover = (event: MapLibre.MapMouseEvent) => {
      if (!window.matchMedia?.('(hover: hover)')?.matches || suspended) return;
      const hit = map
        .queryRenderedFeatures(event.point, {
          layers: [
            'polity-area',
            'polity-documented',
            'polity-approximate',
            'culture-area',
            'culture-uncertain',
            'event-area',
          ],
        })
        .find((f) => visibleIds.has(String(f.properties?.recordId)));
      map.getCanvas().title = hit
        ? `${String(hit.properties?.label ?? '')} · ${Number.isInteger(hit.properties?.sourceYear) && hit.properties?.sourceYear !== 0 ? yearLabel(Number(hit.properties?.sourceYear)) : ''}`
        : '';
    };
    const leave = () => {
      map.getCanvas().title = '';
    };
    map.on('mousemove', hover);
    map.on('mouseout', leave);
    scope.add(() => {
      map.off('mousemove', hover);
      map.off('mouseout', leave);
    });
    map.getCanvas().setAttribute('aria-label', t('globe.canvas'));
    let lastCamera = '';
    const emitCamera = () => {
      // Resize can emit moveend before load. The host resets transient state on ready;
      // an early notification must not consume the first usable camera update.
      if (!initialized || scope.disposed) return;
      const center = map.getCenter();
      const camera = {
        center: { lng: wrap(center.lng), lat: center.lat },
        zoom: map.getZoom(),
        bearing: wrap(map.getBearing()),
        pitch: map.getPitch(),
      };
      container.dataset.cameraZoom = camera.zoom.toFixed(2);
      const cameraKey = JSON.stringify(camera);
      if (isCamera(camera) && cameraKey !== lastCamera) {
        lastCamera = cameraKey;
        callbacks.camera(camera);
      }
      try {
        measure('labels.refreshMs', () => labels.refresh());
        cities.refresh();
        measure('persons.clusterMs', () => people.refresh());
      } catch {
        fail('renderer');
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      fail('context-lost');
    };
    const canvas = map.getCanvas();
    canvas.addEventListener('webglcontextlost', lost);
    scope.add(() => canvas.removeEventListener('webglcontextlost', lost));
    const onError = (event: unknown) => {
      if (
        event &&
        typeof event === 'object' &&
        'sourceId' in event &&
        event.sourceId === ROAD_SOURCE
      ) {
        roads?.error();
        return;
      }
      fail('renderer');
    };
    map.on('error', onError);
    scope.add(() => map.off('error', onError));
    // moveend: hareket sırasında köprüye frame/geometri akışı yok, yalnız son kamera.
    map.on('moveend', emitCamera);
    scope.add(() => map.off('moveend', emitCamera));
    const loaded = () => {
      if (scope.disposed || initialized) return;
      initialized = true;
      try {
        map.setProjection({ type: 'globe' });
        if (map.getProjection()?.type !== 'globe') {
          fail('renderer');
          return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        demoButton = button;
        button.hidden = options.initialShowDemo === false;
        button.classList.add('atlas-demo-marker');
        button.textContent = '◎';
        button.title = t('globe.demo');
        button.setAttribute('aria-label', t('globe.demo'));
        button.dataset.demoId = DEMO_ID;
        button.style.cssText = `width:${theme.layout.minTouchTarget}px;height:${theme.layout.minTouchTarget}px;border:2px solid ${theme.colors.accent};border-radius:50%;background:${theme.colors.surface};color:${theme.colors.accent};font:28px system-ui;cursor:pointer;touch-action:manipulation`;
        let dragging = false;
        const down = () => {
          dragging = false;
        };
        const drag = () => {
          dragging = true;
        };
        const select = (event: MouseEvent) => {
          if (button.hidden || button.classList.contains('maplibregl-marker-covered')) return;
          if (event.detail === 0 || !dragging) callbacks.selected();
        };
        button.addEventListener('pointerdown', down);
        button.addEventListener('click', select);
        map.on('dragstart', drag);
        scope.add(() => {
          button.removeEventListener('pointerdown', down);
          button.removeEventListener('click', select);
          map.off('dragstart', drag);
        });
        const marker = new library.Marker({ element: button, opacityWhenCovered: 0 });
        scope.add(() => marker.remove());
        marker.setLngLat([0, 0]).addTo(map);
        container.dataset.projection = 'globe';
        lastCamera = '';
        callbacks.ready();
        emitCamera();
        void refreshHistory();
      } catch {
        fail('renderer');
      }
    };
    map.on('load', loaded);
    scope.add(() => map.off('load', loaded));
    const observer = new ResizeObserver(() => {
      if (!scope.disposed) {
        try {
          map.resize();
          measure('labels.refreshMs', () => labels.refresh());
          measure('persons.clusterMs', () => people.refresh());
          cities.refresh();
        } catch {
          fail('renderer');
        }
      }
    });
    observer.observe(container);
    scope.add(() => observer.disconnect());
    scope.add(() => {
      delete container.dataset.projection;
      delete container.dataset.historicalCount;
      delete container.dataset.historicalYear;
      delete container.dataset.historicalSourceYear;
      delete container.dataset.historicalPreview;
      delete container.dataset.historicalStatus;
      delete container.dataset.cameraZoom;
    });
    return {
      dispose: () => scope.dispose(),
      setRoads(enabled: boolean) {
        if (scope.disposed) return;
        roads ??= modernRoads(map, (status) => callbacks.roadsStatus?.(status));
        restoreRoads = enabled;
        roads.set(enabled && !paused);
      },
      pause() {
        if (scope.disposed) return;
        paused = true;
        restoreRoads = roads?.allowed() ?? false;
        roads?.set(false);
        cities.pause();
        historyAbort.abort();
        map.stop?.();
      },
      resume() {
        if (scope.disposed) return;
        paused = false;
        if (restoreRoads) roads?.set(true);
        cities.resume();
        cities.refresh();
        lastViewSignature = '';
        void refreshHistory();
      },
      command(command: GlobeCommand) {
        if (scope.disposed) return;
        if (command.type === 'selection.page') {
          if (suspended || command.payload.revision !== requestedRevision) return;
          const page = hitSelection.page(command.payload);
          if (page && page.candidateIds.every((id) => visibleIds.has(id)))
            callbacks.selectionChanged?.(page);
          return;
        }
        if (command.type === 'polity.select' || command.type === 'polity.focus') {
          if (command.payload.revision !== requestedRevision || suspended) return;
          const id = command.payload.recordId;
          if (
            id !== null &&
            !currentFeatures.some(
              (feature) =>
                feature.id === id &&
                ['territory', 'cultural-region', 'person-location', 'event', 'place'].includes(
                  feature.properties.kind,
                ),
            )
          )
            return;
          applySelection(id);
          if (command.type === 'polity.focus' && id) {
            const feature = currentFeatures.find((f) => f.id === id)!;
            const plan = focusPlan(feature.geometry);
            const camera = plan.camera;
            try {
              if (
                plan.kind === 'bounds' &&
                plan.bounds &&
                ['Polygon', 'MultiPolygon'].includes(feature.geometry.type)
              ) {
                map.fitBounds(plan.bounds, {
                  padding: 48,
                  maxZoom: MAX_MAP_ZOOM,
                  duration: command.payload.reducedMotion ? 0 : theme.motion.camera,
                  essential: false,
                });
                return;
              }
              map.flyTo({
                center: [camera.center.lng, camera.center.lat],
                zoom: camera.zoom,
                bearing: 0,
                pitch: 0,
                duration: command.payload.reducedMotion ? 0 : theme.motion.camera,
                essential: false,
              });
            } catch {
              fail('renderer');
            }
          }
          return;
        }
        if (command.type === 'catalog.view') {
          notes.set(command.payload.notes ?? []);
          cities.set(command.payload.modernCities ?? false);
          if (command.payload.retryData) cities.retry();
          cities.refresh();
          reducedMotion = command.payload.reducedMotion ?? true;
          if (command.payload.retryData) lastViewSignature = '';
          if (
            (command.payload.revision ?? 0) !== requestedRevision ||
            command.payload.year !== historicalView.year ||
            command.payload.polity !== historicalView.polity ||
            command.payload.culture !== historicalView.culture ||
            !!command.payload.person !== !!historicalView.person ||
            !!command.payload.battle !== !!historicalView.battle ||
            !!command.payload.event !== !!historicalView.event ||
            !!command.payload.includeApproximatePersons !==
              !!historicalView.includeApproximatePersons ||
            command.payload.labels !== historicalView.labels ||
            command.payload.sparseLabels !== historicalView.sparseLabels ||
            JSON.stringify(command.payload.filters) !== JSON.stringify(historicalView.filters) ||
            !!command.payload.previewSnapshot !== !!historicalView.previewSnapshot ||
            command.payload.suspendHistory
          )
            hitSelection.clear();
          requestedRevision = command.payload.revision ?? 0;
          suspended = command.payload.suspendHistory ?? false;
          applySelection(command.payload.selectedId ?? null);
          historicalView = {
            year: command.payload.year,
            polity: command.payload.polity,
            culture: command.payload.culture,
            person: command.payload.person ?? false,
            battle: command.payload.battle ?? false,
            event: command.payload.event ?? false,
            labels: command.payload.labels ?? true,
            sparseLabels: command.payload.sparseLabels ?? false,
            ...(command.payload.filters ? { filters: command.payload.filters } : {}),
            includeApproximatePersons: command.payload.includeApproximatePersons ?? false,
            previewSnapshot: command.payload.previewSnapshot ?? false,
          };
          try {
            if (demoButton) demoButton.hidden = command.payload.showDemo === false;
            const projection = command.payload.projection ?? 'globe';
            if (map.getProjection()?.type !== projection) {
              map.setProjection({ type: projection });
              if (map.getProjection()?.type !== projection) throw new Error('Projection mismatch');
              container.dataset.projection = projection;
              map
                .getCanvas()
                .setAttribute(
                  'aria-label',
                  t(projection === 'globe' ? 'globe.canvas' : 'map.atlasCanvas'),
                );
              labels.refresh();
              people.refresh();
              cities.refresh();
            }
            if (command.payload.camera) {
              const camera = command.payload.camera;
              // Explicit restore is an acknowledgement even at identical coordinates.
              // A pre-ready event may have been intentionally ignored by the host.
              lastCamera = '';
              map.jumpTo({
                center: [camera.center.lng, camera.center.lat],
                zoom: camera.zoom,
                bearing: camera.bearing,
                pitch: camera.pitch,
              });
              emitCamera();
            } else if (command.payload.focusPilot)
              map.jumpTo({
                center: [PILOT_CAMERA.center.lng, PILOT_CAMERA.center.lat],
                zoom: PILOT_CAMERA.zoom,
                bearing: 0,
                pitch: 0,
              });
          } catch {
            fail('renderer');
            return;
          }
          void refreshHistory();
          return;
        }
        const camera = command.type === 'camera.reset' ? INITIAL_CAMERA : command.payload;
        try {
          map.jumpTo({
            center: [camera.center.lng, camera.center.lat],
            zoom: camera.zoom,
            bearing: camera.bearing,
            pitch: camera.pitch,
          });
        } catch {
          fail('renderer');
        }
      },
    };
  } catch (error) {
    scope.dispose();
    throw error;
  }
}
