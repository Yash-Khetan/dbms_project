import { motion } from "framer-motion";

interface BatteryGaugeProps {
  level: number;
  size?: number;
}

export function BatteryGauge({ level, size = 160 }: BatteryGaugeProps) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  const strokeDashoffset = circumference - (level / 100) * circumference;

  let color = "#00E396"; // emerald
  if (level < 20) color = "#FF3D57"; // crimson
  else if (level < 50) color = "#FFB800"; // amber

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2} className="overflow-visible">
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="font-syne text-3xl font-bold" style={{ color }}>{level}%</span>
        <span className="font-mono text-xs text-slate-400">BATTERY</span>
      </div>
    </div>
  );
}
