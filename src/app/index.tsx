import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AtlasScreen } from '../atlas/AtlasScreen';
import { LoadingState } from '../atlas/LoadingState';

/** Match static HTML before mounting viewport- and device-dependent map state. */
export default function AtlasRoute() {
  const [mounted, setMounted] = useState(Platform.OS !== 'web');
  useEffect(() => setMounted(true), []);
  return mounted ? <AtlasScreen /> : <LoadingState />;
}
