import React, { useCallback, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface IXTermReactNativeProps {
  /**
   * Initial options for the terminal.
   */
  options?: any;

  /**
   * Custom style for the container.
   */
  style?: ViewStyle;

  /**
   * Callback when data is written to the terminal.
   */
  onData?: (data: string) => void;

  /**
   * Callback when the terminal is resized.
   */
  onResize?: (size: { cols: number; rows: number }) => void;
}

export interface IXTermReactNativeRef {
  /**
   * Write data to the terminal.
   */
  write: (data: string) => void;

  /**
   * Clear the terminal.
   */
  clear: () => void;

  /**
   * Focus the terminal.
   */
  focus: () => void;

  /**
   * Blur the terminal.
   */
  blur: () => void;

  /**
   * Resize the terminal.
   */
  resize: (cols: number, rows: number) => void;
}

export const XTermReactNative = memo(forwardRef<IXTermReactNativeRef, IXTermReactNativeProps>((props, ref) => {
  const { options, style, onData, onResize } = props;
  const webViewRef = useRef<any>(null);

  const postMessage = useCallback((message: any) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  useImperativeHandle(ref, () => ({
    write: (data: string) => postMessage({ type: 'write', data }),
    clear: () => postMessage({ type: 'clear' }),
    focus: () => postMessage({ type: 'focus' }),
    blur: () => postMessage({ type: 'blur' }),
    resize: (cols: number, rows: number) => postMessage({ type: 'resize', cols, rows }),
  }));

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.type) {
        case 'data':
          onData?.(message.data);
          break;
        case 'resize':
          onResize?.({ cols: message.cols, rows: message.rows });
          break;
      }
    } catch (e) {
      console.error('Error parsing message from xterm:', e);
    }
  }, [onData, onResize]);

  // This HTML contains the xterm.js library and the bridge logic.
  // In a real production setup, you would ideally bundle xterm.js and its CSS.
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html, #terminal {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
        </style>
      </head>
      <body>
        <div id="terminal"></div>
        <script src="https://cdn.jsdelivr.net/npm/@xterm/xterm/lib/xterm.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm/css/xterm.css" />
        <script>
          const term = new Terminal(${JSON.stringify(options || {})});
          term.open(document.getElementById('terminal'));

          term.onData(data => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'data', data }));
          });

          term.onResize(size => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'resize', ...size }));
          });

          window.addEventListener('message', (event) => {
            try {
              const message = JSON.parse(event.data);
              switch (message.type) {
                case 'write':
                  term.write(message.data);
                  break;
                case 'clear':
                  term.clear();
                  break;
                case 'focus':
                  term.focus();
                  break;
                case 'blur':
                  term.blur();
                  break;
                case 'resize':
                  term.resize(message.cols, message.rows);
                  break;
              }
            } catch (e) {}
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
}));

XTermReactNative.displayName = 'XTermReactNative';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
