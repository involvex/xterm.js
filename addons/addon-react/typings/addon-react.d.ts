import { Terminal, ITerminalOptions, ITerminalAddon } from '@xterm/xterm';
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, MemoExoticComponent } from 'react';

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

export declare const XTerm: MemoExoticComponent<ForwardRefExoticComponent<PropsWithoutRef<IXTermProps> & RefAttributes<Terminal | null>>>;

/**
 * Hook to manage a terminal instance.
 */
export declare function useTerminal(options?: ITerminalOptions): Terminal;

/**
 * Hook to manage a terminal addon.
 */
export declare function useTerminalAddon<T extends ITerminalAddon>(addon: T, terminal: Terminal | null): void;

/**
 * Hook to connect a terminal to a PTY via WebSocket.
 */
export declare function usePty(terminal: Terminal | null, url: string, options?: { bidirectional?: boolean }): {
  status: 'connecting' | 'open' | 'closed' | 'error';
  socket: WebSocket | null;
};

export declare class ReactAddon implements ITerminalAddon {
  public activate(terminal: Terminal): void;
  public dispose(): void;
}
