import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
/** Nonmodal detail panels keep map gestures available; Escape/back still dismisses them. */
export function usePanelInteraction(nonmodal: boolean, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!nonmodal) return;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const previous = document.activeElement;
      const key = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close.current();
        }
      };
      document.addEventListener('keydown', key);
      return () => {
        document.removeEventListener('keydown', key);
        if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
      };
    }
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      close.current();
      return true;
    });
    return () => listener.remove();
  }, [nonmodal]);
}
