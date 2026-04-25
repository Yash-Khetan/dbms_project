import { cn, formatDate } from "@/lib/utils";

export interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <div className="text-slate-500 font-mono text-sm text-center py-4">No maintenance history</div>;
  }

  return (
    <div className="relative border-l border-white/10 ml-3 space-y-6">
      {events.map((event) => {
        let dotColor = "bg-emerald-500";
        if (event.status === 'PENDING') dotColor = "bg-amber-500";
        if (event.status === 'IN_PROGRESS') dotColor = "bg-cyan-500";

        return (
          <div key={event.id} className="relative pl-6">
            <div className={cn("absolute w-3 h-3 rounded-full -left-[6.5px] top-1 border-2 border-background", dotColor)} />
            <div className="font-mono text-xs text-slate-500 mb-1">{formatDate(event.date)}</div>
            <div className="text-white font-medium mb-1">{event.title}</div>
            {event.description && <div className="text-sm text-slate-400">{event.description}</div>}
          </div>
        );
      })}
    </div>
  );
}
