import { searchVisibilityLayer } from '../discovery/search';
import { politicalRepresentatives } from '../politics/selection';
import { TimelineDock } from './TimelineDock';
import { developerMode } from '../config/build';
import { globeView, PRODUCT_PROJECTION } from '../map/product-view';
import { ScreenSurface } from './ScreenSurface';
import { count } from '../performance/metrics';
import { usePreferences } from '../preferences/usePreferences';
import type { Preferences } from '../preferences/model';
import { SettingsPanel } from './SettingsPanel';
import { PlaceCard } from './PlaceCard';
import { ModernCityCard } from './ModernCityCard';
import { ModernPlacesExplorer } from './ModernPlacesExplorer';
import type { ModernCity } from '../places/modern';
import { SearchResults, SearchPeriod } from './SearchResults';
import { SearchTargetPanel } from './SearchTargetPanel';
import { BookmarksPanel } from './BookmarksPanel';
import { SharePanel } from './SharePanel';
import { ViewPreview } from './ViewPreview';
import { createBookmarkRepository } from '../discovery/bookmarks';
import { bookmarkStorage } from '../discovery/storage';
import { shareQuery, type SavedView } from '../discovery/view';
import { useIncomingView } from '../discovery/incoming';
import {
  INITIAL_CAMERA,
  MAX_MAP_ZOOM,
  type CameraState,
  type RoadStatus,
} from '../map-contract/protocol';
import { EventRecords } from './EventRecords';
import { EventCard } from './EventCard';
import { PersonCard } from './PersonCard';
import { PersonRecords } from './PersonRecords';
import { isMapDetailPanel, canSelectMapRecord, opensOverlapChooser } from './map-interaction';
import { usePanelInteraction } from './usePanelInteraction';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { polityWikidataId } from '../sources/polity-identity';
import { openArticle } from '../sources/open-article';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { AppHeader } from './AppHeader';
import { AttributionPanel } from './AttributionPanel';
import { EntityCard } from './EntityCard';
import { EntitySheet } from './EntitySheet';
import { GlobeViewport } from './GlobeViewport';
import { LayersDrawer } from './LayersDrawer';
import { FloatingLayersPanel } from './FloatingLayersPanel';
import { PeriodChips } from './PeriodChips';
import { LoadingState } from './LoadingState';
import { MapControls } from './MapControls';
import { TimelineBar, yearLabel } from './TimelineBar';
import { YearPicker } from './YearPicker';
import { layoutMode } from './presentation';
import type { LayerId } from './presentation';
import { Action } from './Action';
import { peopleExtension } from '../people/runtime';
import { useNotes } from '../annotations/useNotes';
import { notesAtYear, type LocalNote } from '../annotations/model';
import { LocalNotesPanel } from './LocalNotesPanel';
import { PilotCard } from './PilotCard';
import { PILOT_YEAR } from '../data/pilot-contract';
import { pilotStatus, pilotSearch, worldRepository } from '../data/application';
import { worldNames } from '../data/world/names';
import { shortCountryName } from '../politics/short-names';
import { worldTerritoryId } from '../data/world/records';
import { useCurrentYear } from '../timeline/useTimeline';
import { useTimelineStore } from '../timeline/useTimelineStore';
import { TimelineDetails } from './TimelineDetails';
import type { Layer } from '../timeline/engine';
import { CoverageStatus } from './CoverageStatus';
import { PolityCard } from './PolityCard';
import { CultureCard } from './CultureCard';
import { CulturalRecords } from './CulturalRecords';
import { SelectionOptions, type AreaOption } from './SelectionOptions';
import type { HistoricalSelectionPage, SelectionPageRequest } from '../map-contract/selection';

type Panel =
  | 'notes'
  | 'developer'
  | 'explore'
  | 'discovery'
  | 'bookmarks'
  | 'share'
  | 'shared'
  | 'layers'
  | 'settings'
  | 'place'
  | 'modern-city'
  | 'modern-places'
  | 'year'
  | 'info'
  | 'demo'
  | 'pilot'
  | 'polity'
  | 'polities'
  | 'culture'
  | 'cultures'
  | 'person'
  | 'persons'
  | 'event'
  | 'events'
  | 'selection'
  | 'search'
  | 'attribution'
  | null;
export function AtlasScreen() {
  count('atlas.reactRender');
  const { width, height, fontScale } = useWindowDimensions();
  const wide = layoutMode(width, height, fontScale) === 'wide';
  const [focused, setFocused] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [cardDetails, setCardDetails] = useState(false);
  const notes = useNotes();
  const [pickingNote, setPickingNote] = useState(false);
  usePanelInteraction(pickingNote, () => setPickingNote(false));
  const [notePoint, setNotePoint] = useState(INITIAL_CAMERA.center);
  const [noteId, setNoteId] = useState<string | null>(null);
  const nonmodalDetail = isMapDetailPanel(panel);
  const [modernCity, setModernCity] = useState<ModernCity | null>(null);
  const blocksMap = panel !== null && !nonmodalDetail;
  const [query, setQuery] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const preferences = usePreferences();
  const visibility = preferences.value.layers;
  const changePreferences = (patch: Partial<Preferences>) => {
    void preferences.store.update((value) => ({ ...value, ...patch }));
  };
  const enableBirths = () =>
    changePreferences({
      includeApproximatePersons: true,
      layers: { ...visibility, person: true },
      filters: {
        ...preferences.value.filters,
        exactOnly: false,
        confidence: 'all',
        personRelationship: 'all',
      },
    });
  const projection = PRODUCT_PROJECTION;
  const setVisibility = (change: (value: typeof visibility) => typeof visibility) => {
    void preferences.store.update((value) => ({ ...value, layers: change(value.layers) }));
  };
  const maxYear = useCurrentYear();
  const bookmarks = useMemo(() => createBookmarkRepository(bookmarkStorage, maxYear), [maxYear]);
  const [camera, setCamera] = useState<CameraState | null>(null);
  const [cameraRequest, setCameraRequest] = useState<
    { sequence: number; camera: CameraState } | undefined
  >(undefined);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [pendingView, setPendingView] = useState<SavedView | null>(null);
  const link = useIncomingView(useLocalSearchParams(), maxYear);
  const linkKey = link.status === 'ready' ? shareQuery(link.view, maxYear) : link.status;
  const [dismissedLink, setDismissedLink] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<{ id: string; year: number } | null>(null);
  const activeLayers: Layer[] = [
    ...(visibility.state ? ['polity' as const] : []),
    ...(visibility.culture ? ['culture' as const] : []),
    ...(visibility.person ? ['person' as const] : []),
    ...(visibility.war ? ['battle' as const] : []),
    ...(visibility.event ? ['event' as const] : []),
    ...(visibility.labels ? ['place' as const] : []),
  ];
  const {
    store,
    state: time,
    snapshots,
  } = useTimelineStore(
    maxYear,
    activeLayers,
    focused,
    preferences.value.filters,
    preferences.value.includeApproximatePersons,
    preferences.value.motion,
  );
  const selectedYear = time.requestedYear;
  const noteMarkers = useMemo(
    () =>
      notesAtYear(notes.records, selectedYear)
        .filter((n) =>
          n.kind === 'person'
            ? visibility.person
            : n.kind === 'war'
              ? visibility.war
              : visibility.event,
        )
        .sort((a, b) => Number(b.id === noteId) - Number(a.id === noteId))
        .slice(0, 8)
        .map(({ id, kind, lng, lat }) => ({ id, kind, lng, lat })),
    [notes.records, selectedYear, visibility.person, visibility.war, visibility.event, noteId],
  );
  const hiddenBirths =
    (!preferences.value.includeApproximatePersons ||
      !visibility.person ||
      preferences.value.filters.exactOnly ||
      !['all', 'medium'].includes(preferences.value.filters.confidence) ||
      !['all', 'BIRTH'].includes(preferences.value.filters.personRelationship)) &&
    peopleExtension.records.some(
      (r) =>
        r.kind === 'person-location' &&
        r.temporal.support?.kind === 'snapshot' &&
        r.temporal.start.kind === 'known' &&
        r.temporal.start.date.year === selectedYear,
    );
  const articleRequest = useRef<AbortController | null>(null);
  const [articleState, setArticleState] = useState<{
    year: number;
    status: 'loading' | 'error' | 'unavailable' | 'fallback';
  } | null>(null);
  const articleStatus = articleState?.year === selectedYear ? articleState.status : 'idle';
  useEffect(() => {
    return () => articleRequest.current?.abort();
  }, [selectedYear]);
  const previewSnapshot = time.preview;
  const coverage = {
    report: time.frame?.coverage ?? null,
    failed: time.coverageStatus === 'error',
  };
  const chooseYear = (value: number) => {
    setPendingFocus(null);
    store.selectYear(value);
  };
  const chooseBirthYear = (year: number, personOrLocationId: string) => {
    chooseYear(year);
    enableBirths();
    const location = peopleExtension.records.find(
      (r) =>
        r.kind === 'person-location' &&
        (r.personId === personOrLocationId || r.id === personOrLocationId) &&
        r.temporal.support?.kind === 'snapshot' &&
        r.temporal.start.kind === 'known' &&
        r.temporal.start.date.year === year,
    );
    if (location) setPendingFocus({ id: location.id, year });
  };
  const [ready, setReady] = useState(false);
  const [roadsEnabled, setRoadsEnabled] = useState(true);
  const [roadsStatus, setRoadsStatus] = useState<RoadStatus>('off');
  const [resetRequest, setResetRequest] = useState(0);
  const [selectedPolityId, setSelectedPolityId] = useState<string | null>(null);
  const [politicalFocusRequest, setPoliticalFocusRequest] = useState(0);
  const [candidateIds, setCandidateIds] = useState<readonly string[]>([]);
  const [selection, setSelection] = useState<HistoricalSelectionPage | null>(null);
  const [pageRequest, setPageRequest] = useState<
    (SelectionPageRequest & { sequence: number }) | undefined
  >(undefined);
  const areas: AreaOption[] = (time.frame?.coverage.records ?? []).flatMap(({ record }) =>
    record.kind === 'territory' ||
    record.kind === 'cultural-region' ||
    record.kind === 'person-location' ||
    record.kind === 'event' ||
    record.kind === 'place'
      ? [
          {
            id: record.id,
            kind: record.kind,
            label:
              record.names.find((name) => name.language === 'tr')?.value ?? record.names[0]!.value,
          },
        ]
      : [],
  );
  const territories = visibility.state
    ? (time.frame?.coverage.records
        .map((hit) => hit.record)
        .filter((record) => record.kind === 'territory') ?? [])
    : [];
  const candidateLabels = Object.fromEntries(
    territories.map((record) => [
      record.id,
      shortCountryName(
        record.names.find((name) => name.language === 'tr')?.value ?? record.names[0]!.value,
      ),
    ]),
  );
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setPanel(null);
      };
    }, []),
  );
  const open = (next: Panel) => {
    store.pause();
    Keyboard.dismiss();
    setCardDetails(false);
    setPickingNote(false);
    setPanel(next);
  };
  const close = () => {
    Keyboard.dismiss();
    setPanel(null);
  };
  const toggle = (id: LayerId) => setVisibility((current) => ({ ...current, [id]: !current[id] }));
  const selectModernCity = (city: ModernCity) => {
    if (!canSelectMapRecord(panel, pickingNote)) return;
    setModernCity(city);
    setSelection(null);
    setSelectedPolityId(null);
    open('modern-city');
  };
  const selectPolity = (id: string, candidates: readonly string[] = [id]) => {
    if (!territories.some((record) => record.id === id)) return;
    setSelection(null);
    setSelectedPolityId(id);
    setCandidateIds(
      candidates
        .filter((candidate) => territories.some((record) => record.id === candidate))
        .slice(0, 8),
    );
    open('polity');
  };
  const selectArea = (id: string) => {
    const option = areas.find((option) => option.id === id);
    if (!option) return;
    setSelectedPolityId(id);
    setCandidateIds([]);
    open(
      option.kind === 'place'
        ? 'place'
        : option.kind === 'event'
          ? 'event'
          : option.kind === 'person-location'
            ? 'person'
            : option.kind === 'cultural-region'
              ? 'culture'
              : 'polity',
    );
  };
  const selectionCurrent = selection?.revision === time.revision;
  const onSelectionPage = (page: HistoricalSelectionPage) => {
    if (
      time.renderStatus !== 'applied' ||
      page.revision !== time.revision ||
      !areas.some((option) => option.id === page.recordId) ||
      !page.candidateIds.every((id) => areas.some((option) => option.id === id))
    )
      return;
    const same =
      selection?.selectionId === page.selectionId && selection.revision === page.revision;
    if (same && !panel) return;
    if (!canSelectMapRecord(panel, pickingNote)) return;
    setSelection(page);
    if (!same) {
      setSelectedPolityId(page.recordId);
      setCandidateIds([]);
      if (opensOverlapChooser(areas.find((a) => a.id === page.recordId)!.kind, page.total))
        open('selection');
      else selectArea(page.recordId);
    }
  };
  const chooseSearch = (id: string) => {
    const entry = pilotSearch?.get(id);
    if (!entry) return;
    setSelection(null);
    setDiscoveryId(entry.id);
    setSelectedPolityId(entry.id);
    open('discovery');
  };
  const focusSearch = (id: string, approximate: boolean) => {
    const entry = pilotSearch?.get(id);
    if (!entry || !ready) return;
    store.pause();
    if (time.preview) store.setPreview(false);
    if (approximate && !time.includeApproximatePersons)
      changePreferences({ includeApproximatePersons: true });
    const layer = searchVisibilityLayer(entry.group);
    setVisibility((v) => ({ ...v, [layer]: true }));
    setPendingFocus({ id, year: selectedYear });
  };
  useEffect(() => {
    const target = pendingFocus;
    if (
      !target ||
      target.year !== time.requestedYear ||
      time.preview ||
      !ready ||
      time.renderStatus !== 'applied' ||
      !time.frame?.coverage.records.some((h) => h.record.id === target.id)
    )
      return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setSelectedPolityId(target.id);
        setPoliticalFocusRequest((v) => v + 1);
        setPendingFocus(null);
        const record = time.frame?.coverage.records.find((h) => h.record.id === target.id)?.record;
        if (record)
          setPanel(
            record.kind === 'territory'
              ? 'polity'
              : record.kind === 'cultural-region'
                ? 'culture'
                : record.kind === 'person-location'
                  ? 'person'
                  : record.kind === 'place'
                    ? 'place'
                    : 'event',
          );
      }
    });
    return () => {
      active = false;
    };
  }, [pendingFocus, ready, time.requestedYear, time.preview, time.renderStatus, time.frame]);
  const savedView: SavedView = {
    year: selectedYear,
    entityId: pilotSearch?.get(selectedPolityId ?? '')?.id ?? null,
    camera,
    projection,
  };
  const applyView = () => {
    if (!pendingView) return;
    chooseYear(pendingView.year);
    setSelection(null);
    if (pendingView.camera) {
      setCamera(pendingView.camera);
      setCameraRequest((previous) => ({
        sequence: (previous?.sequence ?? 0) + 1,
        camera: pendingView.camera!,
      }));
    }
    setDismissedLink(linkKey);
    const entry = pendingView.entityId ? pilotSearch?.get(pendingView.entityId) : null;
    if (entry) chooseSearch(entry.id);
    else {
      setSelectedPolityId(null);
      close();
    }
  };
  const title =
    panel === 'notes'
      ? t('notes.titlePanel')
      : panel === 'modern-city' || panel === 'modern-places'
        ? t('cities.layer')
        : panel === 'developer'
          ? t('developer.title')
          : panel === 'explore'
            ? t('map.discover')
            : panel === 'settings'
              ? t('layers.settings')
              : panel === 'place'
                ? t('layers.labels')
                : panel === 'bookmarks'
                  ? t('bookmarks.title')
                  : panel === 'share' || panel === 'shared'
                    ? t('share.title')
                    : panel === 'discovery'
                      ? t('search.detail')
                      : panel === 'event' || panel === 'events'
                        ? t('events.title')
                        : panel === 'person' || panel === 'persons'
                          ? t('person.title')
                          : panel === 'culture' || panel === 'cultures'
                            ? t('culture.title')
                            : panel === 'selection'
                              ? t('selection.title')
                              : panel === 'polity' || panel === 'polities'
                                ? t('politics.title')
                                : panel === 'layers'
                                  ? t('atlas.layers')
                                  : panel === 'year'
                                    ? t('atlas.year.title')
                                    : panel === 'search'
                                      ? t('atlas.search.title')
                                      : panel === 'attribution'
                                        ? t('globe.licenses')
                                        : t('atlas.info');
  const recordDetailsAvailable =
    panel === 'person' ||
    panel === 'event' ||
    (panel === 'discovery' &&
      ['person', 'war', 'event'].includes(pilotSearch?.get(discoveryId ?? '')?.group ?? ''));
  const panelContent = panel && (
    <EntitySheet
      title={title}
      wide={wide}
      onClose={close}
      nonmodal={nonmodalDetail}
      focusClose={panel !== 'search'}
      compact={recordDetailsAvailable && !cardDetails}
      headerAction={
        recordDetailsAvailable ? (
          <Action
            label={t('record.cardDetails')}
            symbol="ⓘ"
            iconOnly
            selected={cardDetails}
            onPress={() => setCardDetails((v) => !v)}
          />
        ) : undefined
      }
    >
      {panel === 'notes' && (
        <LocalNotesPanel
          key={`${noteId ?? 'new'}/${notePoint.lng}/${notePoint.lat}`}
          notes={notes}
          point={notePoint}
          year={selectedYear}
          selectedId={noteId}
          onFocus={(n: LocalNote) => {
            setNoteId(n.id);
            chooseYear(n.start);
            setVisibility((v) => ({
              ...v,
              [n.kind === 'person' ? 'person' : n.kind === 'war' ? 'war' : 'event']: true,
            }));
            setCameraRequest((p) => ({
              sequence: (p?.sequence ?? 0) + 1,
              camera: {
                ...(camera ?? INITIAL_CAMERA),
                center: { lng: n.lng, lat: n.lat },
                zoom: 5,
              },
            }));
          }}
        />
      )}
      {['explore', 'info'].includes(panel) && <TimelineDetails state={time} />}
      {developerMode && panel === 'developer' && (
        <View style={styles.explore}>
          <TimelineDetails state={time} />
          <Action
            label={t('map.demoToggle')}
            symbol="◎"
            selected={showDemo}
            onPress={() => {
              setShowDemo((v) => !v);
              close();
            }}
          />
          <AppText variant="heading" accessibilityRole="header">
            {t('explore.examples')}
          </AppText>
          <Action
            label={t('pilot.show')}
            symbol="↗"
            disabled={!ready || !pilotStatus.ok}
            onPress={() => {
              chooseYear(PILOT_YEAR);
              close();
              setVisibility((value) => ({ ...value, state: true }));
            }}
          />
          <Action
            label={t('playback.focus')}
            symbol="⌖"
            disabled={!ready || !coverage.report?.records.length}
            onPress={() => {
              store.pause();
              const record = coverage.report?.records[0]?.record;
              if (record) {
                setSelectedPolityId(record.id);
                setPoliticalFocusRequest((value) => value + 1);
                close();
              }
            }}
          />
          <Action label={t('pilot.details')} symbol="ⓘ" onPress={() => open('pilot')} />
          <Action
            label={t('events.pilot')}
            symbol="⚔"
            onPress={() => {
              chooseYear(1066);
              setVisibility((v) => ({ ...v, war: true }));
              close();
            }}
          />
          <Action
            label={t('person.pilot')}
            symbol="≈"
            onPress={() => {
              chooseYear(1880);
              changePreferences({ includeApproximatePersons: true });
              setVisibility((v) => ({ ...v, person: true }));
              close();
            }}
          />
        </View>
      )}
      {panel === 'explore' && (
        <>
          <Action
            label={t('notes.titlePanel')}
            symbol="◇"
            onPress={() => {
              setNoteId(null);
              setNotePoint(camera?.center ?? INITIAL_CAMERA.center);
              open('notes');
            }}
          />
          <Action
            label={t('notes.pick')}
            symbol="+"
            disabled={!ready}
            onPress={() => {
              store.pause();
              setNoteId(null);
              close();
              setPickingNote(true);
            }}
          />
          <AppText>{t('map.noRecord')}</AppText>
          <AppText variant="small">{t('map.westernSaharaGap')}</AppText>
          <AppText variant="small" muted>
            {t('map.basemap')}
          </AppText>
          <View style={styles.explore}>
            <AppText accessibilityRole="header" variant="heading">
              {t('explore.discoverRecords')}
            </AppText>
            {pilotSearch
              ?.search('')
              .records.slice(0, 4)
              .map((entry) => (
                <View key={entry.id}>
                  <Action label={entry.name} onPress={() => chooseSearch(entry.id)} />
                  <SearchPeriod entry={entry} />
                </View>
              ))}
            {developerMode && (
              <Action label={t('developer.title')} onPress={() => open('developer')} />
            )}
            <CoverageStatus
              year={selectedYear}
              report={coverage.report}
              failed={coverage.failed}
              preview={previewSnapshot}
              onPreview={store.setPreview}
              onRetry={store.retry}
              dataStatus={time.frame?.dataStatus}
              layerHidden={
                !visibility.state &&
                !visibility.culture &&
                !visibility.person &&
                !visibility.war &&
                !visibility.event &&
                !visibility.labels
              }
            />
            {time.frame?.coverage.politicalCoverage && (
              <AppText variant="small" muted testID="world-coverage-summary">
                {t('world.coverage')} {time.frame.coverage.politicalCoverage.total} /{' '}
                {time.frame.coverage.politicalCoverage.drawn} /{' '}
                {time.frame.coverage.politicalCoverage.withheld}
              </AppText>
            )}
            <Action label={t('layers.settings')} symbol="⚙" onPress={() => open('settings')} />
            <AppText variant="heading" accessibilityRole="header">
              {t('explore.yourView')}
            </AppText>
            <Action label={t('bookmarks.title')} symbol="☆" onPress={() => open('bookmarks')} />
            <Action label={t('share.title')} symbol="↗" onPress={() => open('share')} />

            <AppText variant="heading" accessibilityRole="header">
              {t('explore.catalog')}
            </AppText>
            <Action label={t('politics.records')} symbol="◇" onPress={() => open('polities')} />
            <Action label={t('culture.records')} symbol="≈" onPress={() => open('cultures')} />
            <Action label={t('events.records')} symbol="✦" onPress={() => open('events')} />

            <Action label={t('person.records')} symbol="●" onPress={() => open('persons')} />

            {areas.length > 32 && <AppText variant="small">{t('selection.density')}</AppText>}
            <AppText variant="small" muted>
              {t('atlas.map.help')}
            </AppText>
            <Link href="/about" style={styles.link}>
              {t('navigation.about')}
            </Link>
          </View>
        </>
      )}
      {panel === 'layers' && (
        <>
          <LayersDrawer
            visibility={visibility}
            onToggle={toggle}
            preferences={preferences.value}
            disabled={preferences.status !== 'ready'}
            onChange={changePreferences}
            onSettings={() => open('settings')}
            onAttribution={() => open('attribution')}
            onPlaceBrowser={() => open('modern-places')}
          />
        </>
      )}
      {panel === 'settings' && (
        <SettingsPanel
          state={preferences}
          onChange={changePreferences}
          onRetry={() => {
            void (preferences.status === 'read-error'
              ? preferences.store.load()
              : preferences.store.retryWrite());
          }}
          onReset={() => {
            void preferences.store.reset();
          }}
          onAttribution={() => open('attribution')}
        />
      )}
      {['polity', 'culture', 'person', 'event', 'place'].includes(panel) &&
        time.frame &&
        !time.frame.coverage.records.some(
          ({ record }) =>
            record.id === selectedPolityId ||
            (record.kind === 'person-location' && record.personId === selectedPolityId),
        ) && <AppText accessibilityLiveRegion="polite">{t('layers.filtered')}</AppText>}
      {panel === 'place' &&
        time.frame?.coverage.records.map(({ record }) =>
          record.kind === 'place' && record.id === selectedPolityId ? (
            <PlaceCard key={record.id} record={record} year={time.frame!.contextYear} />
          ) : null,
        )}
      {panel === 'modern-city' && modernCity && preferences.value.modernCities !== false && (
        <ModernCityCard
          key={modernCity.id}
          city={modernCity}
          onBrowse={() => open('modern-places')}
          onFocus={() => {
            store.pause();
            if (preferences.value.modernCities === false) changePreferences({ modernCities: true });
            const current = camera ?? INITIAL_CAMERA;
            setCameraRequest((previous) => ({
              sequence: (previous?.sequence ?? 0) + 1,
              camera: {
                ...current,
                center: { lng: modernCity.coordinate[0], lat: modernCity.coordinate[1] },
                zoom: modernCity.featureCode?.startsWith('ADM') ? 8 : 7,
              },
            }));
          }}
        />
      )}
      {panel === 'modern-places' && (
        <ModernPlacesExplorer
          onChoose={(city) => {
            if (preferences.value.modernCities === false) changePreferences({ modernCities: true });
            selectModernCity(city);
          }}
        />
      )}
      {panel === 'year' && (
        <YearPicker
          year={selectedYear}
          maxYear={time.maxYear}
          onInteract={store.pause}
          onApply={(value) => {
            chooseYear(value);
            close();
          }}
        />
      )}
      {(panel === 'info' || panel === 'demo') && <EntityCard demo={panel === 'demo'} />}
      {panel === 'polities' && (
        <>
          <AppText>{t('politics.catalogScope')}</AppText>
          {!territories.length && <AppText>{t('politics.empty')}</AppText>}
          {visibility.state && worldRepository.rowsAt(selectedYear).some((r) => r.withheld) && (
            <>
              <AppText>{t('world.unmapped')}</AppText>
              <AppText muted>{t('world.notAbsence')}</AppText>
            </>
          )}
          {visibility.state &&
            worldRepository
              .rowsAt(selectedYear)
              .filter((r) => r.withheld)
              .map((row) => (
                <Action
                  key={row.index}
                  label={shortCountryName(worldNames[row.name] ?? row.name)}
                  onPress={() => {
                    setSelection(null);
                    setSelectedPolityId(worldTerritoryId(row));
                    setCandidateIds([]);
                    open('polity');
                  }}
                />
              ))}
          {politicalRepresentatives(territories).map((record) => (
            <Action
              key={record.id}
              label={candidateLabels[record.id]!}
              onPress={() => selectPolity(record.id)}
            />
          ))}
        </>
      )}
      {panel === 'cultures' && (
        <CulturalRecords
          key={time.revision}
          options={areas.filter((option) => option.kind === 'cultural-region')}
          onChoose={(id) => {
            setSelection(null);
            selectArea(id);
          }}
        />
      )}
      {panel === 'culture' && selectedPolityId && (
        <CultureCard
          recordId={selectedPolityId}
          requestedYear={selectedYear}
          sourceYear={time.frame?.contextYear ?? selectedYear}
          preview={coverage.report?.isPreview === true}
        />
      )}
      {panel === 'polity' && selectedPolityId && (
        <PolityCard
          recordId={selectedPolityId}
          requestedYear={selectedYear}
          sourceYear={time.frame?.contextYear ?? selectedYear}
          preview={coverage.report?.isPreview === true}
          canFocus={
            ready &&
            time.renderStatus === 'applied' &&
            territories.some((record) => record.id === selectedPolityId)
          }
          onFocus={() => setPoliticalFocusRequest((value) => value + 1)}
          candidateIds={candidateIds}
          candidateLabels={candidateLabels}
          onChoose={(id) => selectPolity(id, candidateIds)}
        />
      )}
      {panel === 'pilot' && (
        <>
          {coverage.report?.isPreview && coverage.report.sourceYear !== null && (
            <AppText>
              {t('timeline.preview.active')} {yearLabel(coverage.report.sourceYear)}.{' '}
              {t('timeline.preview.warning')}
            </AppText>
          )}
          <PilotCard />
        </>
      )}
      {panel === 'search' && (
        <SearchResults query={query} onQuery={setQuery} onChoose={chooseSearch} />
      )}
      {panel === 'discovery' && discoveryId && (
        <SearchTargetPanel
          key={`${discoveryId}/${selectedYear}`}
          id={discoveryId}
          detailsOpen={cardDetails}
          onBirthYear={(year) => chooseBirthYear(year, discoveryId)}
          year={selectedYear}
          maxYear={maxYear}
          canFocus={ready && time.renderStatus === 'applied'}
          includeApproximate={time.includeApproximatePersons}
          filters={preferences.value.filters}
          onFocus={focusSearch}
          onYear={(year, approximate) => {
            chooseYear(year);
            if (approximate) {
              changePreferences({ includeApproximatePersons: true });
              setVisibility((v) => ({ ...v, person: true }));
            }
          }}
          onBack={() => open('search')}
        />
      )}
      {panel === 'bookmarks' && (
        <BookmarksPanel
          repository={bookmarks}
          view={savedView}
          onOpen={(view) => {
            setPendingView(globeView(view));
            open('shared');
          }}
        />
      )}
      {panel === 'share' && <SharePanel view={savedView} maxYear={maxYear} />}
      {panel === 'shared' && pendingView && <ViewPreview view={pendingView} onApply={applyView} />}
      {panel === 'persons' && (
        <PersonRecords
          key="all-persons"
          query=""
          onEnableBirths={() => {
            enableBirths();
          }}
          onChoose={(id) => {
            setSelection(null);
            setSelectedPolityId(id);
            open('person');
          }}
        />
      )}
      {panel === 'person' && selectedPolityId && (
        <PersonCard
          detailsOpen={cardDetails}
          key={`${selectedPolityId}/${time.revision}`}
          recordId={selectedPolityId}
          visibleLocationIds={areas.filter((a) => a.kind === 'person-location').map((a) => a.id)}
          year={time.frame?.contextYear ?? selectedYear}
          requestedYear={selectedYear}
          includeApproximate={time.includeApproximatePersons}
          canFocus={ready && visibility.person && time.renderStatus === 'applied'}
          onBirthYear={(year) => chooseBirthYear(year, selectedPolityId)}
          onFocus={(id) => {
            setSelectedPolityId(id);
            setPoliticalFocusRequest((v) => v + 1);
          }}
        />
      )}
      {panel === 'events' && (
        <EventRecords
          key={`${time.revision}`}
          records={time.frame?.events ?? []}
          year={time.frame?.contextYear ?? selectedYear}
          battle={visibility.war}
          event={visibility.event}
          loading={!time.frame}
          failed={time.coverageStatus === 'error'}
          onChoose={(id) => {
            setSelection(null);
            setSelectedPolityId(id);
            open('event');
          }}
        />
      )}
      {panel === 'event' && selectedPolityId && (
        <EventCard
          detailsOpen={cardDetails}
          key={`${selectedPolityId}/${time.revision}`}
          id={selectedPolityId}
          year={time.frame?.contextYear ?? selectedYear}
          requestedYear={selectedYear}
          battle={visibility.war}
          event={visibility.event}
          canFocus={
            ready && time.renderStatus === 'applied' && areas.some((a) => a.id === selectedPolityId)
          }
          onFocus={() => setPoliticalFocusRequest((v) => v + 1)}
        />
      )}
      {['culture', 'polity', 'person', 'event', 'selection'].includes(panel) &&
        selection &&
        (selectionCurrent ? (
          <SelectionOptions
            page={selection}
            options={areas}
            selectedId={selectedPolityId}
            enabled={time.renderStatus === 'applied'}
            onChoose={selectArea}
            onPage={(request) =>
              setPageRequest((previous) => ({
                ...request,
                sequence: (previous?.sequence ?? 0) + 1,
              }))
            }
          />
        ) : (
          <AppText>{t('selection.expired')}</AppText>
        ))}
      {panel === 'attribution' && (
        <AttributionPanel
          roadsEnabled={roadsEnabled}
          roadsStatus={roadsStatus}
          onRoadsChange={setRoadsEnabled}
        />
      )}
    </EntitySheet>
  );
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenSurface
          largeText={fontScale >= 1.6}
          style={styles.fill}
          pointerEvents={blocksMap ? 'none' : 'auto'}
          accessibilityElementsHidden={blocksMap}
          importantForAccessibility={blocksMap ? 'no-hide-descendants' : 'auto'}
        >
          {link.status === 'invalid' && (
            <AppText accessibilityRole="alert">{t('share.invalid')}</AppText>
          )}
          {link.status === 'ready' && dismissedLink !== linkKey && (
            <View style={styles.footer}>
              <AppText>{t('share.received')}</AppText>
              <Action
                label={t('share.inspect')}
                onPress={() => {
                  setPendingView(globeView(link.view));
                  open('shared');
                }}
              />
              <Action label={t('share.ignore')} onPress={() => setDismissedLink(linkKey)} />
            </View>
          )}
          {(preferences.status === 'read-error' || preferences.writeError) && (
            <View style={styles.footer}>
              <AppText accessibilityRole="alert">
                {t(
                  preferences.status === 'read-error'
                    ? 'settings.readError'
                    : 'settings.writeError',
                )}
              </AppText>
              <Action label={t('layers.settings')} onPress={() => open('settings')} />
            </View>
          )}
          <AppHeader
            query={query}
            onQuery={setQuery}
            onSearch={() => open('search')}
            onLayers={() => open('layers')}
            onDiscover={() => open('explore')}
            compact={!wide}
            onBookmarks={() => open('bookmarks')}
            onShare={() => open('share')}
          />
          <View
            style={[styles.workspace, height < 500 && { minHeight: 120 }]}
            testID="atlas-workspace"
          >
            <View style={[styles.body, wide && styles.wideBody]}>
              <View style={styles.globe}>
                <Suspense fallback={<LoadingState />}>
                  <GlobeViewport
                    notes={noteMarkers}
                    onNoteSelected={(id) => {
                      if (!canSelectMapRecord(panel, pickingNote)) return;
                      setNoteId(id);
                      open('notes');
                    }}
                    projection={projection}
                    showDemo={developerMode && showDemo}
                    active={focused}
                    initialCamera={camera}
                    cameraRequest={cameraRequest}
                    onCameraChange={setCamera}
                    resetRequest={resetRequest}
                    onReadyChange={(value) => {
                      setReady(value);
                      if (!value) {
                        store.rendererUnavailable();
                        setSelection(null);
                        setPageRequest(undefined);
                      } else store.rendererAvailable();
                    }}
                    timelineRevision={time.revision}
                    suspendHistory={!time.frame}
                    onTimelineApplied={store.acknowledge}
                    historicalYear={selectedYear}
                    previewSnapshot={previewSnapshot && coverage.report?.isPreview === true}
                    showPolities={visibility.state}
                    showCultures={visibility.culture}
                    showPersons={visibility.person}
                    showBattles={visibility.war}
                    showEvents={visibility.event}
                    showHistoricalLabels={visibility.labels}
                    showModernCities={preferences.value.modernCities ?? true}
                    showModernRoads={roadsEnabled}
                    onRoadsStatus={setRoadsStatus}
                    onModernCitySelected={selectModernCity}
                    sparseLabels={preferences.value.sparseLabels}
                    filters={preferences.value.filters}
                    includeApproximatePersons={time.includeApproximatePersons}
                    selectedPolityId={selectedPolityId}
                    selectedHistoricalId={selectedPolityId}
                    onSelectionPage={onSelectionPage}
                    onArticleRequested={(id, revision) => {
                      if (
                        !canSelectMapRecord(panel, pickingNote) ||
                        time.renderStatus !== 'applied' ||
                        revision !== time.revision
                      )
                        return;
                      const record = territories.find((record) => record.id === id);
                      if (!record) return;
                      const qid = polityWikidataId(record);
                      articleRequest.current?.abort();
                      const request = new AbortController();
                      articleRequest.current = request;
                      if (qid) {
                        setArticleState({ year: selectedYear, status: 'loading' });
                        void openArticle(qid, request.signal)
                          .then((result) => {
                            if (!request.signal.aborted)
                              setArticleState(
                                result.kind === 'wikidata'
                                  ? { year: selectedYear, status: 'fallback' }
                                  : null,
                              );
                          })
                          .catch(() => {
                            if (!request.signal.aborted)
                              setArticleState({ year: selectedYear, status: 'error' });
                          });
                      } else setArticleState({ year: selectedYear, status: 'unavailable' });
                      selectPolity(id);
                    }}
                    selectionPageRequest={pageRequest}
                    politicalFocusRequest={politicalFocusRequest}
                    reducedMotion={time.reducedMotion}
                    onHistoricalSelected={(id, candidates, revision) => {
                      if (
                        canSelectMapRecord(panel, pickingNote) &&
                        time.renderStatus === 'applied' &&
                        revision === time.revision
                      )
                        selectPolity(id, candidates);
                    }}
                    onDemoSelected={() => {
                      if (canSelectMapRecord(panel, pickingNote)) open('demo');
                    }}
                  />
                </Suspense>
              </View>
              {pickingNote && (
                <>
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -12 }, { translateY: -12 }],
                    }}
                  >
                    <AppText variant="heading">＋</AppText>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      backgroundColor: theme.colors.surface,
                      padding: 8,
                    }}
                  >
                    <AppText>{t('notes.pickHelp')}</AppText>
                    <View style={styles.footer}>
                      <Action
                        label={t('notes.usePoint')}
                        onPress={() => {
                          setNotePoint(camera?.center ?? INITIAL_CAMERA.center);
                          setPickingNote(false);
                          open('notes');
                        }}
                      />
                      <Action label={t('atlas.close')} onPress={() => setPickingNote(false)} />
                    </View>
                  </View>
                </>
              )}
              <View
                style={[
                  styles.tools,
                  nonmodalDetail && wide && { right: theme.layout.panelWidth + theme.spacing.sm },
                ]}
              >
                <MapControls
                  ready={ready}
                  onZoom={(delta) => {
                    const current = camera ?? INITIAL_CAMERA;
                    setCameraRequest((previous) => ({
                      sequence: (previous?.sequence ?? 0) + 1,
                      camera: {
                        ...current,
                        zoom: Math.max(0, Math.min(MAX_MAP_ZOOM, current.zoom + delta)),
                      },
                    }));
                  }}
                  onReset={() => setResetRequest((v) => v + 1)}
                  onInfo={() => open('info')}
                  onAttribution={() => open('attribution')}
                />
              </View>
              {!pickingNote && (
                <FloatingLayersPanel
                  visibility={visibility}
                  onToggle={toggle}
                  onOpenFull={() => open('layers')}
                  compact={!wide}
                />
              )}
              {nonmodalDetail && panelContent}
            </View>
          </View>
          <TimelineDock>
            <PeriodChips
              year={selectedYear}
              maxYear={time.maxYear}
              onSelectYear={(value) => store.selectYear(value, false)}
              reducedMotion={time.reducedMotion}
            />
            {hiddenBirths && (
              <Action
                label={t('births.hiddenAtYear')}
                symbol="≈"
                onPress={() => {
                  enableBirths();
                }}
              />
            )}
            {articleStatus !== 'idle' && (
              <AppText
                variant="small"
                accessibilityLiveRegion="polite"
                testID="country-article-status"
              >
                {t(
                  articleStatus === 'loading'
                    ? 'sources.articleLoading'
                    : articleStatus === 'unavailable'
                      ? 'sources.noId'
                      : articleStatus === 'fallback'
                        ? 'sources.articleFallback'
                        : 'sources.articleFailed',
                )}
              </AppText>
            )}
            {(time.coverageStatus === 'error' || coverage.report?.isPreview) && (
              <View style={styles.coverageStrip} testID="timeline-coverage">
                <AppText
                  variant="small"
                  accessibilityLiveRegion="polite"
                  testID="historical-coverage"
                  style={{ flex: 1 }}
                >
                  {time.coverageStatus === 'error'
                    ? t('timeline.error')
                    : time.coverageStatus === 'loading' || !coverage.report
                      ? t('timeline.loading')
                      : coverage.report.isPreview && coverage.report.sourceYear !== null
                        ? `${t('timeline.preview.active')} ${yearLabel(coverage.report.sourceYear)} · ${t('timeline.preview.warning')}`
                        : coverage.report.selectedYearMode === 'exact verified'
                          ? t('timeline.exact')
                          : coverage.report.selectedYearMode === 'documented approximate'
                            ? t('timeline.approximate')
                            : t('timeline.unsupported')}
                </AppText>
                {coverage.report?.isPreview && coverage.report.sourceYear !== null && (
                  <AppText testID="snapshot-preview-label" variant="small">
                    {t('timeline.preview.active')} {yearLabel(coverage.report.sourceYear)}
                  </AppText>
                )}
                <Action
                  label={t('map.coverage')}
                  symbol="ⓘ"
                  iconOnly
                  onPress={() => open('explore')}
                />
              </View>
            )}
            <TimelineBar
              statusLabel={t(
                time.coverageStatus === 'error'
                  ? 'timeline.mini.error'
                  : time.coverageStatus === 'loading' || !coverage.report
                    ? 'timeline.mini.loading'
                    : coverage.report.selectedYearMode === 'exact verified'
                      ? 'timeline.mini.exact'
                      : coverage.report.selectedYearMode === 'documented approximate'
                        ? 'timeline.mini.approximate'
                        : 'timeline.mini.unsupported',
              )}
              year={selectedYear}
              maxYear={time.maxYear}
              onSelect={(value, debounced) => store.selectYear(value, debounced)}
              onJump={store.jump}
              onPicker={() => open('year')}
              onInteract={store.pause}
              onRelease={store.flush}
              playing={time.playing}
              speed={time.speed}
              onPlay={() => (time.playing ? store.pause() : store.play())}
              onSpeed={store.setSpeed}
              snapshots={snapshots}
              compact={!wide}
              reducedMotion={time.reducedMotion}
              dense={height < 500}
            />
          </TimelineDock>
        </ScreenSurface>
        {!nonmodalDetail && panelContent}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  fill: { flex: 1 },
  workspace: { flex: 1, minHeight: 160 },
  body: { flex: 1, position: 'relative' },
  wideBody: {},
  tools: { position: 'absolute', right: theme.spacing.sm, top: theme.spacing.sm },
  viewSwitch: {
    position: 'absolute',
    left: theme.spacing.sm,
    top: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  coverageStrip: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  explore: { gap: theme.spacing.sm },
  rail: { width: 180, borderRightWidth: 1, borderColor: theme.colors.border },
  globe: { flex: 1, minWidth: 0 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  link: {
    color: theme.colors.accent,
    fontSize: 14,
    minHeight: theme.layout.minTouchTarget,
    paddingVertical: theme.spacing.sm,
  },
});
