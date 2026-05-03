import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Database, ArrowRight, Server, Navigation, Hexagon } from 'lucide-react';

export function Landing() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030610] text-white overflow-x-hidden font-mono selection:bg-cyan-500/30">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#030610]"
          >
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #00D4FF 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

            {/* Drone moving left to right across the screen */}
            <motion.div
              className="absolute top-1/4 z-20 flex items-center justify-center pointer-events-none"
              initial={{ left: "-30vw", y: 0 }}
              animate={{ left: "120vw", y: [0, -30, 10, -10, 0] }}
              transition={{
                left: { duration: 3.5, ease: "easeInOut" },
                y: { duration: 3.5, ease: "easeInOut", times: [0, 0.3, 0.6, 0.8, 1] }
              }}
            >
              {/* Exhaust trail */}
              <div className="absolute top-1/2 right-[60%] w-64 h-3 bg-gradient-to-r from-transparent to-cyan-500 blur-md rounded-full opacity-60" />
              <div className="absolute top-1/2 right-[60%] w-32 h-1 bg-gradient-to-r from-transparent to-white blur-[2px] rounded-full opacity-90" />

              <FuturisticDroneSVG className="w-48 h-48 drop-shadow-[0_0_25px_rgba(0,212,255,0.8)]" />
            </motion.div>

            <div className="mt-32 flex flex-col items-center w-full max-w-md z-10">
              <h2 className="text-xl tracking-[0.3em] font-syne text-cyan-400 mb-6 uppercase">Initializing System</h2>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_10px_#00D4FF]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
              <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>[OK] Establishing neural link...</motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>[OK] Booting PostgreSQL Triggers...</motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>[OK] Calibrating Fleet Telemetry...</motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className="text-cyan-400">System Ready.</motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Background Mesh */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            {/* Navigation */}
            <nav className="fixed top-0 w-full p-6 px-8 md:px-16 flex justify-between items-center z-50 backdrop-blur-md border-b border-white/5 bg-[#030610]/50">
              <div className="font-syne font-bold text-xl tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                DRONE<span className="text-cyan-400">_OPS</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs uppercase tracking-widest border border-cyan-500/30 px-6 py-2.5 rounded-full hover:bg-cyan-500/10 text-cyan-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              >
                Launch Dashboard
              </button>
            </nav>

            {/* Section 1: Hero */}
            <section className="min-h-screen flex items-center pt-24 relative px-8 md:px-16 lg:px-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs mb-6">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    SYSTEM ONLINE — V1.0
                  </div>
                  <h1 className="font-syne text-5xl lg:text-7xl font-bold tracking-widest uppercase mb-6 leading-tight">
                    Next-Gen <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,212,255,0.3)]">Fleet Control</span>
                  </h1>
                  <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
                    An autonomous, self-governing drone delivery command center. Powered by real-time telemetry, predictive maintenance, and strict database integrity.
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#030610] font-bold rounded-full transition-all duration-300 flex items-center gap-2 hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transform hover:-translate-y-1"
                    >
                      Enter Command Center <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="relative hidden lg:block"
                >
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
                  <img src="/drone-hero.png" alt="Futuristic Drone" className="relative z-10 w-full object-cover rounded-3xl drop-shadow-2xl hover:-translate-y-4 transition-transform duration-700 ease-out" />

                  {/* Floating Tech Elements */}
                  <div className="absolute top-10 -left-10 glass-card p-4 rounded-2xl border border-cyan-500/30 animate-pulse-slow">
                    <div className="text-xs text-cyan-400 mb-1">BATTERY STATUS</div>
                    <div className="text-2xl font-bold">100% <span className="text-emerald-400 text-sm">OPTIMAL</span></div>
                  </div>
                  <div className="absolute bottom-10 -right-10 glass-card p-4 rounded-2xl border border-cyan-500/30 animate-pulse-slow delay-150">
                    <div className="text-xs text-cyan-400 mb-1">ACTIVE FLIGHTS</div>
                    <div className="text-2xl font-bold">24 <span className="text-cyan-400 text-sm">IN TRANSIT</span></div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Section 2: Core Infrastructure */}
            <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#080D1A] relative border-y border-white/5">
              <div className="max-w-4xl mx-auto text-center mb-20">
                <h2 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-widest mb-6">Autonomous Infrastructure</h2>
                <p className="text-slate-400">The entire application is strictly governed at the lowest level. The database isn't just storage; it is the brain of the operation.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[
                  { icon: <Database size={32} />, title: "PL/pgSQL Triggers", desc: "8 advanced PostgreSQL triggers handle battery drain, status transitions, and audit logging completely autonomously." },
                  { icon: <ShieldCheck size={32} />, title: "Failsafe Integrity", desc: "Hardcoded constraints prevent logical impossibilities, like assigning drained drones or deleting active flights." },
                  { icon: <Activity size={32} />, title: "Real-time Sync", desc: "Powered by TanStack Query, the UI instantly reflects autonomous database changes without needing browser refreshes." }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/50 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Section 3: Drone Fleet Specs */}
            <section className="py-32 px-8 md:px-16 lg:px-24 relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full border-dashed animate-spin-slow" />

              <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-syne text-4xl font-bold uppercase tracking-widest mb-6">Predictive Maintenance</h2>
                  <p className="text-slate-400 text-lg mb-8">
                    The fleet is monitored 24/7. When a drone's battery dips below the critical 20% threshold during a delivery simulation, the system automatically grounds the drone and forces a MAINTENANCE status update.
                  </p>
                  <ul className="space-y-4">
                    {['Automated Audit Logging', 'Battery Clamping Constraints', 'Zero-Downtime Assignments'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-cyan-400">
                        <CheckCircle /> <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-4 rounded-3xl aspect-square border-cyan-500/30">
                    <Hexagon size={40} className="text-cyan-400" />
                    <div className="text-3xl font-bold">100+</div>
                    <div className="text-xs text-slate-400 tracking-widest uppercase">Nodes Active</div>
                  </div>
                  <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-4 rounded-3xl aspect-square border-cyan-500/30 mt-8">
                    <Server size={40} className="text-cyan-400" />
                    <div className="text-3xl font-bold">~12ms</div>
                    <div className="text-xs text-slate-400 tracking-widest uppercase">Query Latency</div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Section 4: CTA / Footer */}
            <section className="py-24 border-t border-white/5 relative bg-[#050A14]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/10 pointer-events-none" />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center relative z-10"
              >
                <h2 className="font-syne text-4xl font-bold uppercase tracking-widest mb-8">Ready to Take Command?</h2>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-12 py-5 bg-cyan-500/10 border border-cyan-500 text-cyan-400 font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-3 hover:bg-cyan-500 hover:text-[#030610] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] mx-auto tracking-widest uppercase"
                >
                  <Navigation size={20} /> Access Dashboard
                </button>
              </motion.div>

              <div className="text-center text-slate-600 text-sm mt-32 font-mono">
                &copy; {new Date().getFullYear()} DRONE_OPS. Designed for Database Management Systems Showcase.
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper icon
function CheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Custom SVG Drone
function FuturisticDroneSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glow Filter */}
      <defs>
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="carbonFiber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Tilt drone forward to fly left to right */}
      <g transform="rotate(75, 60, 60)">
        {/* Cross Arms */}
        <path d="M20 20 L100 100 M20 100 L100 20" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

        {/* Central Core */}
        <polygon points="60,35 85,60 60,85 35,60" fill="url(#carbonFiber)" stroke="#00D4FF" strokeWidth="2" />
        <circle cx="60" cy="60" r="8" fill="#030610" stroke="#00D4FF" strokeWidth="2" filter="url(#cyanGlow)" />
        <circle cx="60" cy="60" r="3" fill="#ffffff" className="animate-pulse" />

        {/* Propeller Guards & Blades */}
        {[
          { x: 20, y: 20 }, { x: 100, y: 20 },
          { x: 20, y: 100 }, { x: 100, y: 100 }
        ].map((pos, i) => (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#0f172a" strokeWidth="4" />
            <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#00D4FF" strokeWidth="1" strokeDasharray="8 8" className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
            {/* Fast Spinning Propellers */}
            <path d={`M${pos.x - 12} ${pos.y} Q${pos.x} ${pos.y - 10} ${pos.x + 12} ${pos.y} Q${pos.x} ${pos.y + 10} ${pos.x - 12} ${pos.y}`} fill="#00D4FF" opacity="0.6" className="animate-[spin_0.1s_linear_infinite]" style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
          </g>
        ))}

        {/* Forward Indicators (Top side since we rotated 75deg) */}
        <circle cx="40" cy="35" r="3" fill="#f59e0b" filter="url(#cyanGlow)" className="animate-pulse" />
        <circle cx="80" cy="35" r="3" fill="#f59e0b" filter="url(#cyanGlow)" className="animate-pulse" />
      </g>
    </svg>
  );
}
