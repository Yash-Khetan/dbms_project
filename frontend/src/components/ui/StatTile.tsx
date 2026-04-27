import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: number;
  icon: ReactNode;
  alert?: boolean;
  color?: 'cyan' | 'blue' | 'amber' | 'red';
  subtitle?: string;
}

const colorMap = {
  cyan:  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'rgba(0,212,255,0.06)' },
  blue:  { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'rgba(59,130,246,0.06)' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'rgba(245,158,11,0.06)' },
  red:   { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', glow: 'rgba(239,68,68,0.06)' },
};

export function StatTile({ label, value, icon, alert, color = 'cyan', subtitle }: StatTileProps) {
  const animatedValue = useCountUp(value);
  const scheme = colorMap[color];

  return (
    <div 
      className={cn(
        "glass-card p-6 relative overflow-hidden group transition-all duration-300",
        alert && value > 0 && "border-red-500/50"
      )}
      style={{ boxShadow: `inset 0 0 30px ${scheme.glow}` }}
    >
      {/* Accent line at top */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px]", alert && value > 0 ? "bg-red-500" : scheme.bg.replace('/10', ''))} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-mono text-[11px] text-slate-500 font-medium uppercase tracking-widest">{label}</h3>
          {subtitle && (
            <p className={cn("text-[10px] mt-0.5", scheme.text, "opacity-60")}>{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-2.5 rounded-xl transition-transform group-hover:scale-110",
          scheme.bg,
          alert && value > 0 ? "text-red-400" : scheme.text
        )}>
          {icon}
        </div>
      </div>
      <div className={cn(
        "font-syne text-4xl font-bold tracking-tight", 
        alert && value > 0 ? "text-red-400" : "text-white"
      )}>
        {animatedValue}
      </div>
    </div>
  );
}
