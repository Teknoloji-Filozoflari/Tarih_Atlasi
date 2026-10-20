'use dom';

import type { WebViewProps } from 'react-native-webview';
import { GlobeView, type GlobeViewProps } from './globe/GlobeView';
import { domPlacesRepository } from '../places/dom-runtime';

// Native proxy + web DOM bundler sınırı. Callback top-level async action'dır.
// Expo'nun web koşullu type export'u DOMProps içermiyor. Ortak yapılandırma,
// kullanılan RN WebView'in public tipinden türetilir; kaynak/enjeksiyon açılmaz.
type ControlledDOMProps = Omit<
  WebViewProps,
  | 'source'
  | 'injectedJavaScript'
  | 'injectedJavaScriptBeforeContentLoaded'
  | 'injectedJavaScriptObject'
  | 'onMessage'
> & {
  useExpoDOMWebView?: false;
};
export default function GlobeDOM(props: GlobeViewProps & { dom?: ControlledDOMProps }) {
  return (
    <>
      <style>{'html,body,#root{height:100%;margin:0;overflow:hidden}'}</style>
      <GlobeView
        sessionId={props.sessionId}
        command={props.command}
        onEvent={props.onEvent}
        placesProvider={domPlacesRepository}
      />
    </>
  );
}
