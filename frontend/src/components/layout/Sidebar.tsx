import { Link, useLocation } from "react-router-dom";
import { Plane, Package, Users, Database, Wrench, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Activity size={20} /> },
    { name: "Drone Fleet", path: "/drones", icon: <Plane size={20} /> },
    { name: "Orders", path: "/orders", icon: <Package size={20} /> },
    { name: "Operators", path: "/operators", icon: <Users size={20} /> },
    { name: "Flight Logs", path: "/flights", icon: <ChevronRight size={20} /> },
    { name: "Maintenance", path: "/maintenance", icon: <Wrench size={20} /> },
    { name: "Trigger Sim", path: "/triggers", icon: <Database size={20} /> },
    { name: "SQL Reference", path: "/sql", icon: <Database size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#080D1A]/95 backdrop-blur-xl border-r border-white/5 z-30 flex flex-col transition-transform duration-300">
      <div className="p-6 border-b border-white/5">
        <h1 className="font-syne text-xl font-bold text-white tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-slow"></span>
          DRONE_OPS
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm group",
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_2px_0_0_#00D4FF]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "transition-transform duration-300",
                !isActive && "group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="font-mono text-[10px] text-slate-500 tracking-widest uppercase text-center">
          DRONE OPS v1.0
        </div>
      </div>
    </aside>
  );
}
