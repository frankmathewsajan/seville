'use client';

import { useEffect, useState } from 'react';
import { Github, ExternalLink, Star, GitFork, Server, Code2 } from 'lucide-react';
import { cn } from '@/app/utils/cn';

// Type definition based on the Egoist pinned-repos API response
interface PinnedRepo {
  repo: string;
  link: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
}

export function ProjectsApp() {
  const [repos, setRepos] = useState<PinnedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetching from a dedicated open-source proxy for pinned GitHub repos
    fetch('https://gh-pinned-repos.egoist.dev/?username=frankmathewsajan')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-full w-full p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Project Archive</h2>
          <p className="text-white/60 text-sm font-medium mt-1">Live from github.com/frankmathewsajan</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
          <Github className="w-5 h-5 text-white/80" />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse flex flex-col p-5">
              <div className="flex justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="w-16 h-8 rounded-full bg-white/10" />
              </div>
              <div className="w-3/4 h-5 bg-white/10 rounded-md mb-3" />
              <div className="w-full h-4 bg-white/10 rounded-md mb-2" />
              <div className="w-2/3 h-4 bg-white/10 rounded-md mt-auto" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
          <Server className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-red-400 font-medium">Unable to connect to GitHub registry.</p>
          <p className="text-red-400/60 text-sm mt-1">Please check my pinned repos directly on GitHub.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div 
              key={repo.repo}
              className="group relative flex flex-col p-5 rounded-2xl bg-black/20 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner bg-white/5 border border-white/5">
                  <Code2 className="w-5 h-5 text-white/70" />
                </div>
                <a 
                  href={repo.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center gap-2 transition-colors group/btn"
                >
                  <span className="text-xs font-bold text-white/70 group-hover/btn:text-white">View</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70 group-hover/btn:text-white" />
                </a>
              </div>

              {/* Repo Info */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#28c840] transition-colors">
                {repo.repo}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1 line-clamp-3">
                {repo.description || "No description provided."}
              </p>

              {/* GitHub Metrics & Language Tag */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                    style={{ backgroundColor: repo.languageColor, color: repo.languageColor }}
                  />
                  <span className="text-xs font-bold text-white/70">{repo.language}</span>
                </div>
                
                <div className="flex items-center gap-4 text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{repo.forks}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}