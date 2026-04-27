import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/api/stats';
import { fetchDrones } from '@/api/drones';
import { fetchOrders } from '@/api/orders';
import { StatTile } from '@/components/ui/StatTile';
import { DroneCard } from '@/components/ui/DroneCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Plane, Package, AlertTriangle, Activity, Radio, Satellite, Clock, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/api/client';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const { data: drones, isLoading: dronesLoading } = useQuery({
    queryKey: ['drones'],
    queryFn: fetchDrones,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(),
  });

  const { data: fleetOverview, isLoading: fleetLoading } = useQuery({
    queryKey: ['fleetOverview'],
    queryFn: () => apiFetch<any[]>('/stats/fleet-overview'),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* Hero Command Bar */}
      <motion.div variants={itemVariants} className="relative glass-card p-8 overflow-hidden group">
        {/* Animated gradient border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SYSTEMS NOMINAL
            </div>
            <h1 className="font-syne text-3xl font-bold text-white tracking-widest mb-2">FLEET COMMAND CENTER</h1>
            <p className="text-slate-400 font-mono text-sm max-w-xl">
              Real-time monitoring and autonomous control of active aerospace operations.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <Satellite size={14} className="text-cyan-400" />
              <span>SAT LINK: <span className="text-emerald-400">ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>
        </div>
        
        {/* Radar Animation */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 opacity-20 pointer-events-none">
          <div className="absolute inset-0 border border-cyan-500/60 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 border border-cyan-500/40 rounded-full" />
          <div className="absolute inset-10 border border-cyan-500/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent origin-left animate-spin-slow" />
          <div className="absolute top-1/4 left-3/4 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <div className="absolute top-3/4 left-1/4 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
        </div>
      </motion.div>

      {/* KPI Tiles */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-36" />)
        ) : stats ? (
          <>
            <StatTile label="Total Drones" value={stats.totalDrones} icon={<Plane />} color="cyan" subtitle="Fleet Capacity" />
            <StatTile label="Active Deliveries" value={stats.activeDeliveries} icon={<Activity />} color="blue" subtitle="In Transit" />
            <StatTile label="Pending Orders" value={stats.pendingOrders} icon={<Package />} color="amber" subtitle="Awaiting Assignment" />
            <StatTile 
              label="Critical Alerts" 
              value={stats.criticalBatteryAlerts} 
              icon={<AlertTriangle />} 
              alert 
              color="red"
              subtitle="Battery < 20%"
            />
          </>
        ) : null}
      </motion.div>

      {/* Fleet Overview & Status Distribution */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution Card */}
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-syne text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Radio size={16} className="text-cyan-400" /> Fleet Distribution
          </h3>
          {stats && (
            <div className="space-y-4">
              {[
                { label: 'Available', count: stats.dronesByStatus?.AVAILABLE ?? 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'In Delivery', count: stats.dronesByStatus?.IN_DELIVERY ?? 0, color: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: 'Charging', count: stats.dronesByStatus?.CHARGING ?? 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'Maintenance', count: stats.dronesByStatus?.MAINTENANCE ?? 0, color: 'bg-red-500', textColor: 'text-red-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-400 flex-1">{item.label}</span>
                  <span className={`font-mono font-bold text-lg ${item.textColor}`}>{item.count}</span>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${stats.totalDrones > 0 ? (item.count / stats.totalDrones) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-syne text-lg font-bold text-white mb-6">Recent Orders</h3>
          {ordersLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : orders && orders.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-white/5">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td className="text-cyan-400">#{order.id.toString().padStart(4, '0')}</td>
                      <td>{order.customerName}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-slate-500">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono border border-dashed border-white/10 rounded-lg">No recent orders.</div>
          )}
        </div>
      </motion.div>

      {/* Fleet Strip */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
            <Plane size={18} className="text-cyan-400" /> Active Fleet Status
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full">
            {drones?.length ?? 0} units
          </span>
        </div>
        
        {dronesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-44 min-w-[300px]" />)}
          </div>
        ) : drones && drones.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
            {drones.map((drone, i) => (
              <motion.div 
                key={drone.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <DroneCard drone={drone} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400 font-mono border border-dashed border-white/10">No drones in fleet.</div>
        )}
      </motion.div>

      {/* Fleet Overview — PostgreSQL VIEW */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
            <Eye size={18} className="text-cyan-400" /> Fleet Overview
          </h2>
          <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
            DB View
          </span>
        </div>

        {fleetLoading ? (
          <LoadingSkeleton className="h-48" />
        ) : fleetOverview && fleetOverview.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Drone</th>
                    <th>Status</th>
                    <th>Battery</th>
                    <th>Active Orders</th>
                    <th>Maint. Records</th>
                    <th>Last Maintenance</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetOverview.map((row: any) => (
                    <tr key={row.drone_id}>
                      <td>
                        <span className="text-white font-semibold">{row.drone_model}</span>
                        <span className="text-slate-500 text-xs ml-2">#{String(row.drone_id).padStart(4, '0')}</span>
                      </td>
                      <td><StatusBadge status={row.drone_status} /></td>
                      <td>
                        <span className={cn(
                          "font-mono font-bold",
                          Number(row.battery_level) < 20 ? "text-red-400" : Number(row.battery_level) < 50 ? "text-amber-400" : "text-emerald-400"
                        )}>
                          {row.battery_level}%
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={cn(
                          "inline-block min-w-[24px] text-center font-mono font-bold rounded-md px-2 py-0.5 text-xs",
                          Number(row.active_orders) > 0 ? "bg-blue-500/20 text-blue-400" : "text-slate-500"
                        )}>
                          {row.active_orders}
                        </span>
                      </td>
                      <td className="text-center font-mono text-slate-400">{row.total_maintenance_records}</td>
                      <td className="font-mono text-slate-500">{row.latest_maintenance_date ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-white/5 text-[10px] font-mono text-slate-600 tracking-wider">
              SOURCE: <span className="text-purple-400">SELECT * FROM fleet_overview</span> — PostgreSQL VIEW joining drones, orders, maintenance_records
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400 font-mono border border-dashed border-white/10">No fleet data.</div>
        )}
      </motion.div>
    </motion.div>
  );
}
