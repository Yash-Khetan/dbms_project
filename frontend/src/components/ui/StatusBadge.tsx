import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isPulse = status === 'IN_DELIVERY' || status === 'IN_TRANSIT' || status === 'MAINTENANCE';
  
  let colorClass = "bg-slate-500/20 text-slate-400 border-slate-500/30";
  let pulseColor = "";

  if (['AVAILABLE', 'DELIVERED', 'COMPLETED'].includes(status)) {
    colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  } else if (['IN_DELIVERY', 'IN_TRANSIT', 'IN_PROGRESS'].includes(status)) {
    colorClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    pulseColor = "bg-amber-400";
  } else if (['MAINTENANCE', 'CANCELLED', 'ABORTED'].includes(status)) {
    colorClass = "bg-crimson-500/20 text-crimson-400 border-crimson-500/30";
    pulseColor = "bg-crimson-400";
  } else if (['ASSIGNED', 'CHARGING'].includes(status)) {
    colorClass = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono border font-medium",
      colorClass,
      className
    )}>
      {isPulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColor)}></span>
          <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseColor)}></span>
        </span>
      )}
      {status.replace('_', ' ')}
    </div>
  );
}
