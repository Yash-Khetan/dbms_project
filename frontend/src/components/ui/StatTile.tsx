import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: number;
  icon: ReactNode;
  alert?: boolean;
}

export function StatTile({ label, value, icon, alert }: StatTileProps) {
  const animatedValue = useCountUp(value);

  return (
    <div className={cn("glass-card p-6 relative overflow-hidden", alert && value > 0 && "border-crimson-500/50 shadow-[inset_0_0_20px_rgba(255,61,87,0.1)]")}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-mono text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</h3>
        <div className={cn("p-2 rounded-lg bg-white/5", alert && value > 0 ? "text-crimson-500" : "text-cyan-500")}>
          {icon}
        </div>
      </div>
      <div className={cn("font-syne text-4xl font-bold", alert && value > 0 ? "text-crimson-500" : "text-white")}>
        {animatedValue}
      </div>
    </div>
  );
}
