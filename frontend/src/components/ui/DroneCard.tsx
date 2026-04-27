import { Drone, updateDrone } from "@/api/drones";
import { StatusBadge } from "./StatusBadge";
import { BatteryBar } from "./BatteryBar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface DroneCardProps {
  drone: Drone;
}

const statusGlow: Record<string, string> = {
  AVAILABLE: 'rgba(16,185,129,0.08)',
  IN_DELIVERY: 'rgba(59,130,246,0.08)',
  CHARGING: 'rgba(245,158,11,0.08)',
  MAINTENANCE: 'rgba(239,68,68,0.08)',
};

const statusAccent: Record<string, string> = {
  AVAILABLE: '#10b981',
  IN_DELIVERY: '#3b82f6',
  CHARGING: '#f59e0b',
  MAINTENANCE: '#ef4444',
};

export function DroneCard({ drone }: DroneCardProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success("Drone status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update drone");
    }
  });

  return (
    <div 
      className="glass-card p-5 flex flex-col gap-4 min-w-[300px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1"
      style={{ boxShadow: `inset 0 0 40px ${statusGlow[drone.status] || 'transparent'}` }}
    >
      {/* 3D Drone SVG Watermark */}
      <div className="absolute -right-2 -top-2 w-36 h-36 opacity-[0.12] group-hover:opacity-[0.22] transition-opacity duration-700 pointer-events-none">
        <svg viewBox="0 0 140 140" fill="none" className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
          <defs>
            <linearGradient id={`body-${drone.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id={`arm-${drone.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <radialGradient id={`rotor-${drone.id}`}>
              <stop offset="0%" stopColor={statusAccent[drone.status]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={statusAccent[drone.status]} stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Shadow ellipse for 3D depth */}
          <ellipse cx="70" cy="125" rx="35" ry="6" fill="black" opacity="0.15" />

          {/* Arms — thick with gradient for depth */}
          <line x1="30" y1="30" x2="110" y2="110" stroke={`url(#arm-${drone.id})`} strokeWidth="7" strokeLinecap="round" />
          <line x1="110" y1="30" x2="30" y2="110" stroke={`url(#arm-${drone.id})`} strokeWidth="7" strokeLinecap="round" />

          {/* Rotor discs — colored by status */}
          <circle cx="30" cy="30" r="18" fill={`url(#rotor-${drone.id})`} />
          <circle cx="110" cy="30" r="18" fill={`url(#rotor-${drone.id})`} />
          <circle cx="30" cy="110" r="18" fill={`url(#rotor-${drone.id})`} />
          <circle cx="110" cy="110" r="18" fill={`url(#rotor-${drone.id})`} />

          {/* Rotor rings */}
          <circle cx="30" cy="30" r="18" fill="none" stroke={statusAccent[drone.status]} strokeWidth="1.5" opacity="0.5" />
          <circle cx="110" cy="30" r="18" fill="none" stroke={statusAccent[drone.status]} strokeWidth="1.5" opacity="0.5" />
          <circle cx="30" cy="110" r="18" fill="none" stroke={statusAccent[drone.status]} strokeWidth="1.5" opacity="0.5" />
          <circle cx="110" cy="110" r="18" fill="none" stroke={statusAccent[drone.status]} strokeWidth="1.5" opacity="0.5" />

          {/* Rotor hubs */}
          <circle cx="30" cy="30" r="4" fill="#1e293b" stroke={statusAccent[drone.status]} strokeWidth="1.5" />
          <circle cx="110" cy="30" r="4" fill="#1e293b" stroke={statusAccent[drone.status]} strokeWidth="1.5" />
          <circle cx="30" cy="110" r="4" fill="#1e293b" stroke={statusAccent[drone.status]} strokeWidth="1.5" />
          <circle cx="110" cy="110" r="4" fill="#1e293b" stroke={statusAccent[drone.status]} strokeWidth="1.5" />

          {/* Central body — 3D box effect */}
          <rect x="48" y="52" width="44" height="36" rx="10" fill={`url(#body-${drone.id})`} stroke="#475569" strokeWidth="1" />
          {/* Body highlight for 3D shine */}
          <rect x="50" y="54" width="40" height="8" rx="4" fill="white" opacity="0.06" />

          {/* Camera lens */}
          <circle cx="70" cy="70" r="8" fill="#0f172a" stroke={statusAccent[drone.status]} strokeWidth="2" />
          <circle cx="70" cy="70" r="4" fill={statusAccent[drone.status]} opacity="0.7" />
          <circle cx="68" cy="68" r="1.5" fill="white" opacity="0.8" />

          {/* Landing gear — adds depth */}
          <rect x="52" y="90" width="3" height="16" rx="1.5" fill="#475569" />
          <rect x="85" y="90" width="3" height="16" rx="1.5" fill="#475569" />
          <rect x="46" y="104" width="16" height="3" rx="1.5" fill="#64748b" />
          <rect x="78" y="104" width="16" height="3" rx="1.5" fill="#64748b" />

          {/* LED indicators */}
          <circle cx="52" cy="56" r="2" fill="#ef4444" opacity="0.9" />
          <circle cx="88" cy="56" r="2" fill="#22c55e" opacity="0.9" />
        </svg>
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">{drone.model}</h3>
          <p className="font-mono text-[10px] text-slate-500 mt-0.5">UNIT #{drone.id.toString().padStart(4, '0')}</p>
        </div>
        <StatusBadge status={drone.status} />
      </div>
      
      <div className="relative z-10">
        <BatteryBar level={drone.batteryLevel} />
      </div>
      
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-auto pt-3 border-t border-white/5 relative z-10">
        <span>MAINT: {drone.lastMaintenance ? drone.lastMaintenance : "—"}</span>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          {(drone.status === 'AVAILABLE' || drone.status === 'MAINTENANCE') && drone.batteryLevel < 30 && (
            <button
              onClick={() => updateMutation.mutate({ id: drone.id, status: 'CHARGING' })}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-all bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-md text-[11px]"
              title="Send to Charger"
            >
              <Zap className="w-3 h-3" /> Charge
            </button>
          )}
          {drone.status === 'CHARGING' && (
            <button
              onClick={() => updateMutation.mutate({ id: drone.id, status: 'AVAILABLE' })}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-400/10 hover:bg-emerald-400/20 px-2.5 py-1 rounded-md text-[11px]"
              title="Mark as Available"
            >
              <CheckCircle2 className="w-3 h-3" /> Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
