'use client';

import { useState } from 'react';
import { Download, Printer, ExternalLink, FileText, ShieldCheck, Loader2 } from 'lucide-react';

export function ResumeApp() {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Frank_Mathew_Sajan_Resume.pdf';
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('/resume.pdf');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1E1E1E] relative pointer-events-auto">
      
      {/* OS-Level Custom Toolbar (macOS Preview Style) */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-black/50 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shadow-inner">
            <FileText className="w-4 h-4 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white/90 tracking-wide">Frank_Mathew_Sajan_Resume.pdf</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Verified Document</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group" title="Print">
            <Printer className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group" title="Open in New Tab">
            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white" />
          </a>
          <div className="w-[1px] h-5 bg-white/10 mx-1" />
          <button onClick={handleDownload} className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 flex items-center gap-2 transition-colors group">
            <Download className="w-4 h-4 text-white/80 group-hover:text-white" />
            <span className="text-xs font-bold text-white/80 group-hover:text-white">Download</span>
          </button>
        </div>
      </div>

      {/* THE NATIVE RENDERER HACK:
        Instead of react-pdf, we use the native iframe but expand its width past the container bounds
        to literally chop the native scrollbar off the screen.
      */}
      <div className="flex-1 w-full bg-[#323639] relative overflow-hidden">
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Parsing PDF Engine...</span>
          </div>
        )}

        {/* Notice the width is calc(100% + 20px). 
          This forces the browser's native scrollbar into the hidden overflow area.
        */}
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="/resume.pdf#toolbar=0&navpanes=0&view=FitH"
            onLoad={() => setIsLoading(false)}
            className="h-full border-none"
            style={{ width: 'calc(100% + 20px)' }}
            title="Resume PDF"
          />
        </div>

      </div>
    </div>
  );
}