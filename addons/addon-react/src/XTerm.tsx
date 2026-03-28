import { useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { Terminal, ITerminalOptions, ITerminalAddon } from '@xterm/xterm';

export interface IXTermProps {
  /**
   * Options for the terminal.
   */
  options?: ITerminalOptions;

  /**
   * Addons to load.
   */
  addons?: ITerminalAddon[];

  /**
   * Custom CSS class for the terminal container.
   */
  className?: string;

  /**
   * Callback when the terminal is resized.
   */
  onResize?: (cols: number, rows: number) => void;

  /**
   * Callback when data is written to the terminal.
   */
  onData?: (data: string) => void;

  /**
   * Callback when the terminal has been initialized.
   */
  onInit?: (terminal: Terminal) => void;

  /**
   * Callback when the terminal is disposed.
   */
  onDispose?: () => void;
}

export const XTerm = memo(forwardRef<Terminal | null, IXTermProps>((props, ref) => {
  const { options, addons, className, onResize, onData, onInit, onDispose } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const initialOptionsRef = useRef<ITerminalOptions | undefined>(options);
  const initialAddonsRef = useRef<ITerminalAddon[] | undefined>(addons);
  const onInitRef = useRef<IXTermProps['onInit']>(onInit);
  const onDisposeRef = useRef<IXTermProps['onDispose']>(onDispose);
  const onResizeRef = useRef<IXTermProps['onResize']>(onResize);
  const onDataRef = useRef<IXTermProps['onData']>(onData);

  useImperativeHandle(ref, () => terminalRef.current!);

  // Keep callback refs up to date so event handlers always see the latest callbacks
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onDisposeRef.current = onDispose;
  }, [onDispose]);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal(initialOptionsRef.current);
    terminalRef.current = term;

    const addonsToLoad = initialAddonsRef.current;
    if (addonsToLoad) {
      addonsToLoad.forEach(addon => term.loadAddon(addon));
    }

    term.open(containerRef.current);

    const initCallback = onInitRef.current;
    if (initCallback) {
      initCallback(term);
    }

    const disposables = [
      term.onResize(({ cols, rows }: { cols: number, rows: number }) => {
        const resizeHandler = onResizeRef.current;
        if (resizeHandler) {
          resizeHandler(cols, rows);
        }
      }),
      term.onData((data: string) => {
        const dataHandler = onDataRef.current;
        if (dataHandler) {
          dataHandler(data);
        }
      }),
    ];

    return () => {
      disposables.forEach(d => d.dispose());
      term.dispose();
      terminalRef.current = null;
      const disposeCallback = onDisposeRef.current;
      if (disposeCallback) {
        disposeCallback();
      }
    };
  }, []);

  // Update options when they change
  useEffect(() => {
    if (terminalRef.current && options) {
      Object.entries(options).forEach(([key, value]) => {
        terminalRef.current!.options[key as keyof ITerminalOptions] = value as any;
      });
    }
  }, [options]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
}));

XTerm.displayName = 'XTerm';
