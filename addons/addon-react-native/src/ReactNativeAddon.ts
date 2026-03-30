export * from './XTermReactNative';
import { ITerminalAddon, Terminal } from '@xterm/xterm';

export class ReactNativeAddon implements ITerminalAddon {
  public activate(terminal: Terminal): void {
  }

  public dispose(): void {
  }
}
