export * from './XTerm';
export * from './hooks';
import { ITerminalAddon, Terminal } from '@xterm/xterm';

export class ReactAddon implements ITerminalAddon {
  public activate(terminal: Terminal): void {
  }

  public dispose(): void {
  }
}
