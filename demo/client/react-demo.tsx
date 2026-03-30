import React, { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { XTerm, usePty } from '@xterm/addon-react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';

const App = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [pid, setPid] = useState<number | null>(null);
  const [fitAddon] = useState(() => new FitAddon());

  useEffect(() => {
    // Create the terminal on the server
    fetch('/terminals?cols=80&rows=24', { method: 'POST' })
      .then(res => res.text())
      .then(pidStr => {
        console.log('Created PTY with PID:', pidStr);
        setPid(parseInt(pidStr));
      }).catch(err => console.error('Error creating terminal:', err));
  }, []);

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = pid ? `${protocol}//${window.location.host}/terminals/${pid}` : '';

  const { status } = usePty(
    terminal,
    url,
    { bidirectional: true }
  );

  useEffect(() => {
    if (terminal) {
      terminal.writeln('Hello from React demo!');
      terminal.writeln('PTY Status: ' + status);
      if (url) {
        terminal.writeln('Connecting to: ' + url);
      }
    }
  }, [terminal, status, url]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>React XTerm.js Demo</h1>
      <p>PTY Status: {status}</p>
      <div style={{ flex: 1, border: '1px solid #ccc' }}>
        <XTerm
          addons={[fitAddon]}
          options={{ cursorBlink: true }}
          onInit={(term) => {
            setTerminal(term);
            fitAddon.fit();
          }}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
