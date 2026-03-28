import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal, ITerminalOptions, ITerminalAddon } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';

/**
 * Hook to manage a terminal instance.
 */
export function useTerminal(options?: ITerminalOptions) {
  const terminalRef = useRef<Terminal | null>(null);

  if (!terminalRef.current) {
    terminalRef.current = new Terminal(options);
  }

  useEffect(() => {
    return () => {
      terminalRef.current?.dispose();
      terminalRef.current = null;
    };
  }, []);

  return terminalRef.current;
}

/**
 * Hook to manage a terminal addon.
 */
export function useTerminalAddon<T extends ITerminalAddon>(addon: T, terminal: Terminal | null) {
  useEffect(() => {
    if (terminal) {
      terminal.loadAddon(addon);
      return () => {
        addon.dispose();
      };
    }
  }, [terminal, addon]);
}

/**
 * Hook to connect a terminal to a PTY via WebSocket.
 */
export function usePty(terminal: Terminal | null, url: string, options?: { bidirectional?: boolean }) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const addonRef = useRef<AttachAddon | null>(null);

  useEffect(() => {
    if (!terminal || !url) return;

    setStatus('connecting');
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus('open');
      const addon = new AttachAddon(socket, options);
      addonRef.current = addon;
      terminal.loadAddon(addon);
    };

    socket.onclose = () => setStatus('closed');
    socket.onerror = (e) => {
      console.error('WebSocket error:', e);
      setStatus('error');
    };

    return () => {
      addonRef.current?.dispose();
      socket.close();
      socketRef.current = null;
      addonRef.current = null;
    };
  }, [terminal, url, options?.bidirectional]);

  return { status, socket: socketRef.current };
}
