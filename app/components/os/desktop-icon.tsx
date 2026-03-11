'use client';

export function DesktopIcon({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-2 w-24 p-2 rounded-xl focus:outline-none">
      <div className="w-14 h-14 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] bg-black/20 backdrop-blur-xl backdrop-saturate-150 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform">
        <Icon className="w-7 h-7 text-white drop-shadow-md" strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-tight">
        {label}
      </span>
    </button>
  );
}