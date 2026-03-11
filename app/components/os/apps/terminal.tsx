'use client';

import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/app/store/os-store';

interface CommandRecord {
  command: string;
  output: React.ReactNode;
}

export function TerminalApp() {
  const { openApp, refreshUI } = useOSStore();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandRecord[]>([
    {
      command: 'bun run sevilleOS',
      output: (
        <div className="text-[#28c840] mb-2">
          [System 26 Kernel initialized]<br/>
          Welcome to Neural Explorer v1.0.0<br/>
          Type 'help' for a list of available commands.
        </div>
      ),
    },
  ]);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleTerminalClick = () => inputRef.current?.focus();

  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output: React.ReactNode = '';

    switch (trimmedCmd) {
      case 'help':
        output = (
          <div className="text-white/80 space-y-1">
            <p><span className="text-[#febc2e]">whoami</span>    - Display current user info</p>
            <p><span className="text-[#febc2e]">ls</span>        - List available directories/apps</p>
            <p><span className="text-[#febc2e]">open [app]</span> - Launch an application (e.g., 'open projects')</p>
            <p><span className="text-[#febc2e]">clear</span>     - Clear terminal history</p>
            <p><span className="text-[#febc2e]">reboot</span>    - Refresh the OS interface</p>
          </div>
        );
        break;
      case 'whoami':
        output = <div className="text-white/80">guest@system26 ~ an authorized explorer.</div>;
        break;
      case 'ls':
        output = (
          <div className="flex gap-4 text-[#ff5f57]">
            <span>projects/</span> <span>certs/</span> <span>cases/</span> <span>about.txt</span> <span>resume.pdf</span>
          </div>
        );
        break;
      case 'open projects':
        openApp('projects', 'Archive // Projects');
        output = <div className="text-white/50">Opening Projects...</div>;
        break;
      case 'reboot':
        refreshUI();
        return;
      case 'clear':
        setHistory([]);
        return;
      case '':
        output = '';
        break;
      default:
        output = <div className="text-[#ff5f57]">command not found: {trimmedCmd}</div>;
    }
    setHistory((prev) => [...prev, { command: cmd, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="h-full w-full bg-black/20 p-6 font-mono text-sm sm:text-base overflow-y-auto custom-scrollbar"
      onClick={handleTerminalClick}
    >
      <div className="flex flex-col space-y-4">
        {history.map((record, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-[#28c840]">guest@sys26</span>
              <span className="text-white/50">~</span>
              <span className="text-[#febc2e]">$</span>
              <span>{record.command}</span>
            </div>
            <div className="mt-1">{record.output}</div>
          </div>
        ))}
        
        <div className="flex items-center gap-2 text-white/90">
          <span className="text-[#28c840]">guest@sys26</span>
          <span className="text-white/50">~</span>
          <span className="text-[#febc2e]">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-white shadow-none ring-0 caret-white"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}