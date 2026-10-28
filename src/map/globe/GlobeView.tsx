import { chunkedHistoricalFeatures, globeDataRuntime } from './application-loader';
import { count, localMetrics, profilingEnabled } from '../../performance/metrics';
import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './markers.css';
import './scene-atmosphere.css';
import { theme } from '../../theme/tokens';
import { t } from '../../i18n/index';
import {
  encode,
  parseMessage,
  type GlobeEvent,
  type RendererError,
} from '../../map-contract/protocol';
import { physicalLand } from './generated/physical-land';
import { workerSource } from './generated/worker-source';
import { globeNotices } from './generated/notices';
import { mountRenderer } from './renderer';
import { resourceScope } from './lifecycle';
import { PILOT_VERSION } from '../../data/pilot-contract';
import { placesRepository } from '../../places/runtime';
import { createStarField, paintStarField, sceneCssVariables } from './scene-atmosphere';

export interface GlobeViewProps {
  sessionId: string;
  command: string | null;
  onEvent: (message: string) => Promise<void>;
}
export function GlobeView({
  sessionId,
  command,
  onEvent,
  placesProvider = placesRepository,
}: GlobeViewProps & { placesProvider?: typeof placesRepository }) {
  count('globe.reactRender');
  const scene = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const starsCanvas = useRef<HTMLCanvasElement>(null);
  const stars = useRef(createStarField());
  const renderer = useRef<ReturnType<typeof mountRenderer> | null>(null);
  const callback = useRef(onEvent);
  useEffect(() => {
    callback.current = onEvent;
  }, [onEvent]);
  const [status, setStatus] = useState<'loading' | 'ready' | RendererError>('loading');
  const [attempt, setAttempt] = useState(0);
  const appliedRoads = useRef<boolean | null>(null);
  const seen = useRef<string | null>(null);
  const eventSequence = useRef(0);

  useEffect(() => {
    const root = scene.current;
    const canvas = starsCanvas.current;
    if (!root || !canvas) return;
    const paint = () => {
      const rect = root.getBoundingClientRect();
      paintStarField(canvas, stars.current, rect.width || 1, rect.height || 1);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scope = resourceScope();
    if (profilingEnabled()) {
      const target = globalThis as { __ATLAS_METRICS__?: () => unknown };
      target.__ATLAS_METRICS__ = () => ({
        metrics: localMetrics.snapshot(),
        data: globeDataRuntime.stats(),
        markers: container.current?.querySelectorAll('.maplibregl-marker').length ?? 0,
        canvases: document.querySelectorAll('canvas.maplibregl-canvas').length,
      });
      scope.add(() => {
        delete target.__ATLAS_METRICS__;
      });
    }
    scope.add(() => globeDataRuntime.clearMemory());
    scope.add(() => placesProvider.clear());
    const visibility = () => {
      if (document.hidden) {
        renderer.current?.pause();
        globeDataRuntime.clearMemory();
      } else renderer.current?.resume();
    };
    document.addEventListener('visibilitychange', visibility);
    scope.add(() => document.removeEventListener('visibilitychange', visibility));
    let inFlight = false;
    const queued: GlobeEvent[] = [];
    const emit = (message: GlobeEvent) => {
      if (scope.disposed) return;
      // Web popup reservation must remain in the name click's user activation.
      // This carries only a validated record ID/revision, never an external URL.
      if (message.type === 'entity.article') {
        void callback.current(encode(message)).catch(() => {});
        return;
      }
      // Yavaş köprüde sınırsız Promise kuyruğu oluşmasın. Kamera en son değerle birleşir.
      if (inFlight && message.type !== 'renderer.error') {
        if (message.type === 'camera.changed' || message.type === 'catalog.applied') {
          const previous = queued.findIndex((item) => item.type === message.type);
          if (previous >= 0) queued.splice(previous, 1);
        }
        if (queued.length >= 8) {
          const replaceable = queued.findIndex(
            (item) => item.type === 'camera.changed' || item.type === 'catalog.applied',
          );
          if (replaceable < 0) return;
          queued.splice(replaceable, 1);
        }
        queued.push(message);
        return;
      }
      inFlight = true;
      void callback
        .current(encode(message))
        .catch(() => {})
        .finally(() => {
          inFlight = false;
          const next = queued.shift();
          if (next) emit(next);
        });
    };
    const event = (body: Omit<GlobeEvent, 'version' | 'requestId' | 'sessionId'>) => {
      count('bridge.events');
      emit({
        version: 1,
        sessionId,
        requestId: `event-${++eventSequence.current}`,
        ...body,
      } as GlobeEvent);
    };
    const fail = (code: RendererError) => {
      if (scope.disposed) return;
      event({ type: 'renderer.error', payload: { code } });
      setStatus(code);
      scope.dispose();
      renderer.current = null;
    };
    seen.current = null;
    appliedRoads.current = null;
    const timeout = setTimeout(() => fail('timeout'), 20000);
    scope.add(() => clearTimeout(timeout));
    void (async () => {
      try {
        // v6 WebGL2 gerektirir. Geçici probe context'i hemen bırakılır.
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) {
          fail('webgl');
          return;
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        if (!physicalLand || !workerSource || !globeNotices) {
          fail('assets');
          return;
        }
        const [library, { loadPhysicalDetail }] = await Promise.all([
          import('maplibre-gl'),
          import('./generated/physical-detail'),
        ]);
        if (scope.disposed || !container.current) return;
        const physicalDetail = loadPhysicalDetail();
        const instance = mountRenderer(
          library,
          container.current,
          physicalDetail.land,
          workerSource,
          {
            noteSelected: (id) => event({ type: 'note.selected', payload: { id } }),
            roadsStatus: (state) => event({ type: 'roads.status', payload: { state } }),
            ready: () => {
              if (!scope.disposed) {
                clearTimeout(timeout);
                setStatus('ready');
                event({ type: 'renderer.ready', payload: { projection: 'globe' } });
              }
            },
            camera: (camera) => event({ type: 'camera.changed', payload: camera }),
            modernCitySelected: (cityId, packIndex, catalogVersion) => {
              if (packIndex !== undefined && catalogVersion)
                event({ type: 'place.selected', payload: { cityId, packIndex, catalogVersion } });
              else event({ type: 'city.selected', payload: { cityId } });
            },
            modernPlacesStatus: (state, loaded) =>
              event({ type: 'places.status', payload: { state, loaded } }),
            catalogApplied: (payload) => event({ type: 'catalog.applied', payload }),
            selected: () =>
              event({ type: 'demo.selected', payload: { id: 'synthetic-demo', synthetic: true } }),
            historicalSelected: (id, candidates, revision) =>
              event({
                type: 'entity.selected',
                payload: {
                  recordId: id,
                  catalogVersion: PILOT_VERSION,
                  revision: revision ?? 0,
                  candidateIds: candidates ?? [id],
                },
              }),
            selectionChanged: (payload) => event({ type: 'selection.changed', payload }),
            articleRequested: (recordId, revision) =>
              event({
                type: 'entity.article',
                payload: { recordId, revision, catalogVersion: PILOT_VERSION },
              }),
            dataError: (revision) =>
              event({
                type: 'catalog.error',
                payload: { revision, catalogVersion: PILOT_VERSION, code: 'data' },
              }),
            error: fail,
          },
          {
            loadFeatures: chunkedHistoricalFeatures,
            initialShowDemo: false,
            physicalDetail,
            placesProvider,
          },
        );
        scope.add(instance.dispose);
        if (!scope.disposed) {
          renderer.current = instance;
          if (document.hidden) instance.pause();
        }
      } catch {
        fail('renderer');
      }
    })();
    return () => {
      scope.dispose();
      renderer.current = null;
    };
  }, [sessionId, attempt, placesProvider]);

  useEffect(() => {
    if (status !== 'ready' || command === null) return;
    const parsed = parseMessage(command, 'command', sessionId);
    if (!parsed || seen.current === parsed.requestId) return;
    seen.current = parsed.requestId;
    count('bridge.commands');
    if (
      parsed.type === 'catalog.view' &&
      parsed.payload.modernRoads !== undefined &&
      parsed.payload.modernRoads !== appliedRoads.current
    ) {
      renderer.current?.setRoads(parsed.payload.modernRoads);
      appliedRoads.current = parsed.payload.modernRoads;
    }
    renderer.current?.command(parsed);
  }, [command, sessionId, status]);

  const failed = status !== 'loading' && status !== 'ready';
  return (
    <section
      ref={scene}
      className="atlas-scene-root"
      aria-label={t('globe.title')}
      data-testid="globe-scene"
      style={{
        ...sceneCssVariables(),
        color: theme.colors.text,
        fontFamily: 'system-ui',
      }}
    >
      <canvas
        ref={starsCanvas}
        className="atlas-scene-stars atlas-scene-stars--drift"
        aria-hidden
        data-testid="globe-scene-stars"
      />
      <div className="atlas-scene-glow" aria-hidden data-testid="globe-scene-glow" />
      <div ref={container} className="atlas-scene-map" data-testid="globe-canvas-host" />
      {status !== 'ready' && (
        <div
          role={failed ? 'alert' : 'status'}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            padding: 24,
            paddingTop: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            textAlign: 'center',
            background: theme.colors.surface,
            gap: 16,
            overflow: 'auto',
          }}
        >
          <strong>{t(failed ? 'globe.failure' : 'globe.loading')}</strong>
          <p style={{ margin: 0 }}>
            {failed ? t(`globe.error.${status}`) : t('globe.loading.detail')}
          </p>
          {failed && (
            <>
              <p style={{ margin: 0 }}>{t('globe.fallback')}</p>
              <button
                onClick={() => {
                  setStatus('loading');
                  setAttempt((value) => value + 1);
                }}
                style={{
                  minHeight: 48,
                  padding: '8px 24px',
                  background: theme.colors.accent,
                  color: theme.colors.onAccent,
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                {t('state.error.retry')}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
