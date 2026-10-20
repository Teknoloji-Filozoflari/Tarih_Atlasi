import { openCheckedExternal, type ExternalPurpose } from './url-policy.ts';
export function openExternal(url: string, purpose: ExternalPurpose = 'source') {
  return openCheckedExternal(url, purpose, (target) => {
    window.open(target, '_blank', 'noopener,noreferrer');
    // noopener browsers return null even on success; do not infer a popup error from it.
  });
}
