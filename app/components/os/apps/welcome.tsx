'use client';

export function WelcomeApp() {
  return (
    <div className="p-10 space-y-6 h-full flex flex-col justify-center">
      <div>
        <h1 className="text-5xl font-black tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-white mb-2">
          Frank Mathew Sajan.
        </h1>
        <h2 className="text-[#28c840] font-mono text-sm tracking-[0.15em] uppercase mb-6 drop-shadow-md">
          Zero-to-One Engineer // Architect // CS Major
        </h2>
      </div>
      
      <div className="space-y-4">
        <p className="text-white/80 text-base max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-medium leading-relaxed">
          I specialize in zero-to-one engineering for early-stage startups. From architecting scalable backend systems from scratch to establishing core engineering cultures, I build the foundations that companies scale on.
        </p>
        
        <p className="text-white/80 text-base max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-medium leading-relaxed">
          My philosophy is simple: <strong className="text-white">zero friction</strong>. Whether it is crafting a hyper-fluid user experience or maintaining a ruthlessly clean codebase for the next developer, I do not compromise on quality. 
        </p>
      </div>

      <div className="pt-4 border-t border-white/10 max-w-xl">
        <p className="text-white/50 text-xs font-medium leading-relaxed">
          This environment is a pure technical demonstration of native-tier Apple Glassmorphism. For my professional history, view my LinkedIn. For deep-dive architecture breakdowns, see the Readmes in my pinned GitHub repositories.
        </p>
      </div>
    </div>
  );
}