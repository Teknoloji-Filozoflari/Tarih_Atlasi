// Expo replaces __DEV__ in release bundles; never infer development from a URL parameter.
export const developerMode = typeof __DEV__ !== 'undefined' && __DEV__;
