import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/api/stats';
import { fetchDrones } from '@/api/drones';
import { fetchOrders } from '@/api/orders';
import { StatTile } from '@/components/ui/StatTile';
import { DroneCard } from '@/components/ui/DroneCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Plane, Package, AlertTriangle, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative glass-card p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-syne text-3xl font-bold text-white tracking-widest mb-2">FLEET COMMAND CENTER</h1>
          <p className="text-slate-400 font-mono text-sm max-w-xl">
            Real-time monitoring and control of active aerospace operations.
          </p>
        </div>
        
        {/* Radar Animation */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 opacity-30 pointer-events-none">
          <div className="absolute inset-0 border border-cyan-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 border border-cyan-500 rounded-full" />
          <div className="absolute inset-12 border border-cyan-500 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-cyan-500 origin-left animate-spin-slow" />
          <div className="absolute top-1/4 left-3/4 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150" />
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-32" />)
        ) : stats ? (
          <>
            <StatTile label="Total Drones" value={stats.totalDrones} icon={<Plane />} />
            <StatTile label="Active Deliveries" value={stats.activeDeliveries} icon={<Activity />} />
            <StatTile label="Pending Orders" value={stats.pendingOrders} icon={<Package />} />
            <StatTile 
              label="Critical Alerts" 
              value={stats.criticalBatteryAlerts} 
              icon={<AlertTriangle />} 
              alert 
            />
          </>
        ) : null}
      </div>

      {/* Fleet Strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne text-xl font-bold text-white">Active Fleet Status</h2>
        </div>
        
        {dronesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-40 min-w-[280px]" />)}
          </div>
        ) : drones && drones.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
            {drones.map((drone) => (
              <DroneCard key={drone.id} drone={drone} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400 font-mono">No drones in fleet.</div>
        )}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-syne text-xl font-bold text-white mb-4">Recent Orders</h2>
        {ordersLoading ? (
          <LoadingSkeleton className="h-64" />
        ) : orders && orders.length > 0 ? (
          <div className="glass-card overflow-hidden">
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
                    <td>#{order.id.toString().padStart(4, '0')}</td>
                    <td>{order.customerName}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400 font-mono">No recent orders.</div>
        )}
      </div>
    </div>
  );
}
