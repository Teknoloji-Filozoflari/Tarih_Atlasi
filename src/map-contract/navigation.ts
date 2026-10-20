// Kaynak URI Expo tarafından üretilir; overrideUri veya uzaktan HTML kabul edilmez.
export function developmentOrigin(
  hostUri: string | undefined,
  development: boolean,
): string | null {
  if (!development || !hostUri) return null;
  try {
    const url = new URL(`http://${hostUri}`);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function isAllowedNavigation(raw: string, devOrigin: string | null): boolean {
  // URL normalizasyonundan önce encoded/düz traversal'ı reddet.
  if (
    typeof raw !== 'string' ||
    raw.length > 2048 ||
    /[\s\\\u0000-\u001f\u007f]/u.test(raw) ||
    /%2e|%2f|%5c|\/\.\.?\//i.test(raw)
  )
    return false;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return false;
    if (url.protocol === 'file:') {
      return (
        url.hostname === '' &&
        !url.search &&
        !url.hash &&
        /^\/android_asset\/www\.bundle\/[A-Za-z0-9_-]+\.html$/.test(url.pathname)
      );
    }
    return (
      devOrigin !== null &&
      !url.hash &&
      url.origin === devOrigin &&
      url.pathname.startsWith('/_expo/@dom/')
    );
  } catch {
    return false;
  }
}
