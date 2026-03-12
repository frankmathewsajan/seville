'use client';

import { useEffect, useState } from 'react';
import { Github, ExternalLink, Star, GitFork, Code2, BookOpen, Server } from 'lucide-react';
import { useOSStore } from '@/app/store/os-store';
import { cn } from '@/app/utils/cn';

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', 
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', HTML: '#e34c26', 
  CSS: '#563d7c', Vue: '#41b883', Ruby: '#b07219', C: '#555555', 
  'C++': '#f34b7d', 'C#': '#178600', Shell: '#89e051', Jupyter: '#DA5B0B'
};

const CACHE_KEY = 'sys26_github_repos';

export function ProjectsApp() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { openApp } = useOSStore();

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setRepos(JSON.parse(cached));
      setLoading(false);
      return; 
    }

    fetch('https://api.github.com/users/frankmathewsajan/repos?per_page=100&sort=pushed')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: GitHubRepo[]) => {
        const originalRepos = data.filter(repo => !(repo as any).fork);
        const topRepos = originalRepos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
        localStorage.setItem(CACHE_KEY, JSON.stringify(topRepos));
        setRepos(topRepos);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("GitHub API limit hit.", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleReadDoc = (repoName: string) => {
    // Spawns a dedicated document viewer window
    openApp(`docViewer-${repoName}`, `Reader ◦ ${repoName}`);
  };

  return (
    <div className="h-full w-full p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Project Archive</h2>
          <p className="text-white/60 text-sm font-medium mt-1">Top Repositories ◦ github.com/frankmathewsajan</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
          <Github className="w-5 h-5 text-white/80" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse flex flex-col p-5" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white/5 border border-white/10 rounded-2xl">
          <Server className="w-8 h-8 text-white/50 mb-3" />
          <p className="text-white font-medium">GitHub Registry Offline</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => {
            const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] || '#ffffff') : '#ffffff';
            return (
              <div key={repo.id} className="group relative flex flex-col p-5 rounded-2xl bg-black/20 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner bg-white/5 border border-white/5">
                    <Code2 className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex gap-2 z-10">
                    {/* NEW: Spawns the reader app */}
                    <button 
                      onClick={() => handleReadDoc(repo.name)}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center gap-2 transition-colors group/btn"
                    >
                      <span className="text-xs font-bold text-white/70 group-hover/btn:text-white">Read Docs</span>
                      <BookOpen className="w-3.5 h-3.5 text-white/70 group-hover/btn:text-white" />
                    </button>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors group/link">
                      <ExternalLink className="w-3.5 h-3.5 text-white/70 group-hover/link:text-white" />
                    </a>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white group-hover:translate-x-1 transition-all truncate">{repo.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1 line-clamp-3">{repo.description || "No description provided."}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: langColor, color: langColor }} />
                    <span className="text-xs font-bold text-white/70">{repo.language || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/50">
                    <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /><span className="text-xs font-semibold">{repo.stargazers_count}</span></div>
                    <div className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5" /><span className="text-xs font-semibold">{repo.forks_count}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}