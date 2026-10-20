import { Linking } from 'react-native';
import { openCheckedExternal, type ExternalPurpose } from './url-policy.ts';
export function openExternal(url: string, purpose: ExternalPurpose = 'source') {
  return openCheckedExternal(url, purpose, (target) => Linking.openURL(target));
}
