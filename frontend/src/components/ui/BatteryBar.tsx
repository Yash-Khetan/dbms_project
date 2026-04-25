import { cn } from "@/lib/utils";

interface BatteryBarProps {
  level: number;
}

export function BatteryBar({ level }: BatteryBarProps) {
  let color = "bg-emerald-500";
  if (level < 40) color = "bg-crimson-500";
  else if (level < 80) color = "bg-amber-500";

  const isCritical = level < 40;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-0.5 bg-background border border-white/10 p-0.5 rounded-sm h-4">
        {[...Array(10)].map((_, i) => {
          const threshold = (i + 1) * 10;
          const isActive = level >= threshold || (level > 0 && i === 0);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-[1px] transition-colors duration-500",
                isActive ? color : "bg-white/5",
                isCritical && isActive ? "animate-pulse" : ""
              )}
            />
          );
        })}
      </div>
      <span className={cn("font-mono text-xs font-bold", isCritical ? "text-crimson-500" : "text-slate-400")}>
        {level}%
      </span>
    </div>
  );
}
