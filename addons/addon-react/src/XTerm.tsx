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

  useImperativeHandle(ref, () => terminalRef.current!);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal(options);
    terminalRef.current = term;

    if (addons) {
      addons.forEach(addon => term.loadAddon(addon));
    }

    term.open(containerRef.current);

    if (onInit) {
      onInit(term);
    }

    const disposables = [
      term.onResize(({ cols, rows }: { cols: number, rows: number }) => onResize?.(cols, rows)),
      term.onData((data: string) => onData?.(data)),
    ];

    return () => {
      disposables.forEach(d => d.dispose());
      term.dispose();
      terminalRef.current = null;
      if (onDispose) {
        onDispose();
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
