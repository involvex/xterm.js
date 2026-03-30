import { Terminal, ITerminalOptions, ITerminalAddon } from '@xterm/xterm';
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, MemoExoticComponent } from 'react';
import { ViewStyle } from 'react-native';

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

export declare const XTermReactNative: MemoExoticComponent<ForwardRefExoticComponent<PropsWithoutRef<IXTermReactNativeProps> & RefAttributes<IXTermReactNativeRef | null>>>;

export declare class ReactNativeAddon implements ITerminalAddon {
  public activate(terminal: Terminal): void;
  public dispose(): void;
}
