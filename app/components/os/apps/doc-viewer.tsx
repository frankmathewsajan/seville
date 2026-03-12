'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, Type, Check, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/app/utils/cn';
import { motion, AnimatePresence } from 'motion/react';

type ThemeType = 'light' | 'dark' | 'blush';
type FontType = 'sans' | 'serif' | 'mono' | 'rounded' | 'charter';

const FONTS: Record<FontType, { name: string, class: string }> = {
  sans: { name: 'Inter (System)', class: 'font-sans' },
  serif: { name: 'Georgia (Classic)', class: 'font-serif' },
  charter: { name: 'Charter (Book)', class: '[font-family:Charter,Bitstream_Charter,Sitka_Text,Cambria,serif]' },
  rounded: { name: 'SF Rounded', class: '[font-family:ui-rounded,system-ui,-apple-system,sans-serif]' },
  mono: { name: 'SF Mono', class: 'font-mono' },
};

const THEME_CONFIG = {
  light: {
    bgBadge: 'bg-[#FCFAF5]',
    wrapper: 'bg-[#FCFAF5] text-[#292929]',
    header: 'bg-[#FCFAF5]/80 border-black/10',
    btn: 'bg-black/5 hover:bg-black/10 text-black',
    markdown: cn(
      "[&_h1]:text-black [&_h2]:text-black [&_h2]:border-black/10 [&_h3]:text-black",
      "[&_a]:text-blue-600 [&_a]:decoration-blue-600/30 hover:[&_a]:decoration-blue-600",
      "[&_blockquote]:border-black/20 [&_blockquote]:text-black/60 [&_blockquote]:bg-black/5",
      "[&_pre]:bg-[#1A1A1A] [&_pre]:text-[#E4E4E4] [&_code]:bg-black/5 [&_code]:text-[#D93025]"
    )
  },
  dark: {
    bgBadge: 'bg-[#1C1B1A]',
    wrapper: 'bg-[#1C1B1A] text-[#EAE5D9]',
    header: 'bg-[#1C1B1A]/80 border-white/10',
    btn: 'bg-white/5 hover:bg-white/10 text-white',
    markdown: cn(
      "[&_h1]:text-[#F5F2EB] [&_h2]:text-[#F5F2EB] [&_h2]:border-white/10 [&_h3]:text-[#F5F2EB]",
      "[&_a]:text-[#8EACCD] [&_a]:decoration-[#8EACCD]/30 hover:[&_a]:decoration-[#8EACCD]",
      "[&_blockquote]:border-white/20 [&_blockquote]:text-white/60 [&_blockquote]:bg-white/5",
      "[&_pre]:bg-[#0A0A0A] [&_pre]:text-[#EAE5D9] [&_code]:bg-white/10 [&_code]:text-[#E0A99E]"
    )
  },
  blush: {
    bgBadge: 'bg-[#FDF6F5]',
    wrapper: 'bg-[#FDF6F5] text-[#4A3B3C]',
    header: 'bg-[#FDF6F5]/80 border-[#4A3B3C]/10',
    btn: 'bg-[#4A3B3C]/5 hover:bg-[#4A3B3C]/10 text-[#4A3B3C]',
    markdown: cn(
      "[&_h1]:text-[#2D1F20] [&_h2]:text-[#2D1F20] [&_h2]:border-[#4A3B3C]/10 [&_h3]:text-[#2D1F20]",
      "[&_a]:text-[#A45C5E] [&_a]:decoration-[#A45C5E]/30 hover:[&_a]:decoration-[#A45C5E]",
      "[&_blockquote]:border-[#4A3B3C]/20 [&_blockquote]:text-[#4A3B3C]/70 [&_blockquote]:bg-[#4A3B3C]/5",
      "[&_pre]:bg-[#2D1F20] [&_pre]:text-[#FDF6F5] [&_code]:bg-[#4A3B3C]/5 [&_code]:text-[#B05C5E]"
    )
  }
};

const baseMarkdownStyles = cn(
  "text-left leading-[1.75] transition-colors duration-500",
  "[&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mb-[0.5em] [&_h1]:mt-[1em] [&_h1]:leading-tight [&_h1]:text-[2.2em]",
  "[&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mb-[0.5em] [&_h2]:mt-[1.5em] [&_h2]:border-b [&_h2]:pb-[0.2em] [&_h2]:text-[1.5em]",
  "[&_h3]:font-bold [&_h3]:mb-[0.5em] [&_h3]:mt-[1.5em] [&_h3]:text-[1.25em]",
  "[&_p]:mb-[1.5em]",
  "[&_a]:underline [&_a]:underline-offset-4",
  "[&_ul]:list-disc [&_ul]:ml-[1.5em] [&_ul]:mb-[1.5em] [&_ul_li]:mb-[0.5em] [&_ul_li]:pl-[0.5em]",
  "[&_ol]:list-decimal [&_ol]:ml-[1.5em] [&_ol]:mb-[1.5em]",
  "[&_blockquote]:border-l-4 [&_blockquote]:pl-[1em] [&_blockquote]:py-[0.5em] [&_blockquote]:italic [&_blockquote]:my-[2em] [&_blockquote]:text-[1.1em]",
  "[&_pre]:p-[1.5em] [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:my-[2em] [&_pre]:shadow-xl [&_pre]:font-mono [&_pre]:leading-relaxed [&_pre]:text-[0.85em]",
  "[&_code]:font-mono [&_code]:px-[0.4em] [&_code]:py-[0.2em] [&_code]:rounded-md [&_code]:text-[0.9em]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:rounded-none",
  "[&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-[2.5em] [&_img]:max-w-full [&_img]:border",
  "[&_table]:w-full [&_table]:mb-[2em] [&_table]:text-left [&_th]:border-b-2 [&_th]:p-[0.75em] [&_th]:font-bold [&_td]:border-b [&_td]:p-[0.75em]"
);

// THE FALLBACK MARKDOWN ENGINE
const FALLBACK_MARKDOWN = `
# Offline Mode: System Overview
The GitHub API rate limit was exceeded (403 Forbidden). We have seamlessly transitioned to the cached local environment to ensure continued demonstration of the typography engine.

This is the first page of the document. You can read the introduction here, and then use the pagination controls below to continue to the technical specifications.

## Typography & Engine
This document viewer dynamically scales all spacing, margins, and line heights mathematically.

* Use the **Aa** button in the top right.
* Adjust the slider to see fluid geometric scaling.
* Switch between Editorial, Charcoal, and Blush themes.

> "Good typography is like a crystal goblet. It should elegantly contain the text without obscuring it." 
> — Beatrice Warde

## Code Parsing & Rendering
This is the third page. The parser easily handles syntax formatting without requiring heavy external plugins.

\`\`\`typescript
interface TypographyEngine {
  theme: 'light' | 'dark' | 'blush';
  scaleBase: number;
  activeFont: 'sans' | 'serif' | 'mono' | 'rounded' | 'charter';
}

function initViewer(config: TypographyEngine) {
  console.log("Renderer initialized successfully.");
}
\`\`\`

The pagination engine uses Regular Expressions to look ahead and slice the markdown strictly before header tags.
`;

export function DocumentViewerApp({ repoName }: { repoName: string }) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reader Settings
  const [theme, setTheme] = useState<ThemeType>('light');
  const [font, setFont] = useState<FontType>('charter');
  const [fontSize, setFontSize] = useState<number>(18);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const processMarkdown = (text: string) => {
    const chunks = text.split(/(?=^#{1,2}\s+)/m).filter(c => c.trim().length > 0);
    setPages(chunks.length > 0 ? chunks : [text]);
    setLoading(false);
  };

  useEffect(() => {
    const fetchDoc = async () => {
      const docCacheKey = `sys26_readme_${repoName}`;
      const cached = localStorage.getItem(docCacheKey);

      if (cached) {
        processMarkdown(cached);
        return;
      }

      try {
        const res = await fetch(`https://api.github.com/repos/frankmathewsajan/${repoName}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' }
        });
        
        if (!res.ok) throw new Error('API Limit or Not Found');
        
        const text = await res.text();
        localStorage.setItem(docCacheKey, text);
        processMarkdown(text);
        
      } catch (err) {
        console.warn(`Could not fetch README for ${repoName}. Loading fallback document.`);
        processMarkdown(FALLBACK_MARKDOWN); // EXECUTING THE FALLBACK
      }
    };
    
    fetchDoc();
  }, [repoName]);

  const activeTheme = THEME_CONFIG[theme];
  const activeFont = FONTS[font].class;

  return (
    <div className={cn("h-full w-full flex flex-col transition-colors duration-500 relative", activeTheme.wrapper, activeFont)}>
      
      {/* Floating Header Controls */}
      <div className="absolute top-6 right-6 z-20" ref={settingsRef}>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md", activeTheme.btn, showSettings && "ring-2 ring-current ring-offset-2 ring-offset-transparent")}
        >
          <Type className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 w-72 bg-black/90 backdrop-blur-3xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-3xl p-6 flex flex-col gap-6 font-sans text-white"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Theme</span>
                <div className="flex items-center justify-between gap-2">
                  {(Object.keys(THEME_CONFIG) as ThemeType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-inner transition-transform hover:scale-110",
                        THEME_CONFIG[t].bgBadge,
                        theme === t ? "ring-2 ring-white ring-offset-2 ring-offset-black/80" : "opacity-80"
                      )}
                    >
                      {theme === t && <Check className="w-4 h-4 text-black mix-blend-difference" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

               <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Typeface</span>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FONTS) as FontType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFont(f)}
                      className={cn(
                        "px-3 py-2 text-xs text-left rounded-lg transition-colors border",
                        FONTS[f].class,
                        font === f ? "bg-white text-black border-white" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                      )}
                    >
                      {FONTS[f].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-white/50">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Size</span>
                  <span className="text-[10px] font-mono">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-serif font-bold">A</span>
                  <input 
                    type="range" min="12" max="28" 
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <span className="text-lg font-serif font-bold">A</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:px-20 md:py-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-3xl mx-auto pb-32">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center opacity-50 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-sans font-bold tracking-widest uppercase">Parsing Document...</span>
            </div>
          ) : (
            <motion.div 
              key={currentPage} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ fontSize: `${fontSize}px` }} className={cn(baseMarkdownStyles, activeTheme.markdown)}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {pages[currentPage]}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && pages.length > 1 && (
        <div className={cn("absolute bottom-0 left-0 right-0 p-6 border-t backdrop-blur-xl flex items-center justify-between", activeTheme.header)}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={cn("px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold font-sans transition-all disabled:opacity-30", activeTheme.btn)}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <span className="text-xs font-mono font-bold tracking-widest opacity-50">
            SEC {currentPage + 1} / {pages.length}
          </span>

          <button 
            onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            className={cn("px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold font-sans transition-all disabled:opacity-30", activeTheme.btn)}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}