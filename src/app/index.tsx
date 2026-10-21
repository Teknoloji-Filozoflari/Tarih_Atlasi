import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { AtlasScreen } from '../atlas/AtlasScreen';
import { LoadingState } from '../atlas/LoadingState';

const subscribe = () => () => undefined;
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AtlasRoute() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return Platform.OS !== 'web' || mounted ? <AtlasScreen /> : <LoadingState />;
}
