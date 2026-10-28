/**
 * CI-only stub for `src/places/generated/world/assets.ts`.
 *
 * Full android export statically `require()`s 16 102 GeoNames `.atlas` packs
 * (~657 MiB). Metro registers every asset during `expo export --platform android`
 * and is SIGKILL'd (exit 137) on GitHub-hosted runners even with unique swap,
 * `max-workers 1`, and a 6 GiB Node heap.
 *
 * This stub keeps the Hermes/JS export gate honest for application code while
 * documenting that the full places-inclusive `npm run android:bundle` remains a
 * local / larger-runner verification (not continue-on-error greenwash).
 */
export function placeAsset(index: number): number | string {
  throw new Error(
    `ATLAS_CI_ANDROID_LIGHT: place pack ${index} is not bundled in CI android export`,
  );
}
