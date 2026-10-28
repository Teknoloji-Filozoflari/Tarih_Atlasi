import type { SkySpecification } from 'maplibre-gl';
import { theme } from '../../theme/tokens.ts';

export type SceneStar = {
  x: number;
  y: number;
  r: number;
  a: number;
};

/** Deterministic LCG — aynı seed her build’de aynı yıldız alanı. */
export function createStarField(
  count = theme.scene.starCount,
  seed = theme.scene.starSeed,
): SceneStar[] {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const stars: SceneStar[] = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: next(),
      y: next(),
      r: 0.45 + next() * 1.35,
      a: 0.28 + next() * 0.62,
    });
  }
  return stars;
}

export function paintStarField(
  canvas: HTMLCanvasElement,
  stars: readonly SceneStar[],
  cssWidth: number,
  cssHeight: number,
): void {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const width = Math.max(1, Math.floor(cssWidth * dpr));
  const height = Math.max(1, Math.floor(cssHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  for (const star of stars) {
    const bright = star.a > 0.55;
    ctx.fillStyle = bright ? theme.scene.star : theme.scene.starDim;
    ctx.globalAlpha = star.a;
    ctx.beginPath();
    ctx.arc(star.x * cssWidth, star.y * cssHeight, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** MapLibre küre halo — zoom yakınında söner; renk MapLibre lighting’den gelir. */
export function sceneSkySpecification(): SkySpecification {
  const { atmosphereBlendFar, atmosphereBlendMid, atmosphereBlendNear } = theme.scene;
  return {
    'atmosphere-blend': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0,
      atmosphereBlendFar,
      2.5,
      atmosphereBlendMid,
      5,
      atmosphereBlendNear,
    ],
  };
}

export function sceneCssVariables(): Record<string, string> {
  const { scene, colors } = theme;
  return {
    '--atlas-scene-deep': scene.spaceDeep,
    '--atlas-scene-mid': scene.spaceMid,
    '--atlas-scene-lift': scene.spaceLift,
    '--atlas-scene-glow-sand': scene.glowSand,
    '--atlas-scene-glow-ink': scene.glowInk,
    '--atlas-scene-fallback': colors.background,
  };
}
