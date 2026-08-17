import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Activity, Info } from "lucide-react";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface MonoActivityBlueProps {
  activityData?: ActivityDay[];
  deliveries?: any[];
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  className?: string;
}

export const MonoActivityBlue: React.FC<MonoActivityBlueProps> = ({
  activityData,
  deliveries = [],
  title = "MAPA DE ACTIVIDAD DEL SISTEMA",
  subtitle = "Registro de entregas de EPP y constancias firmadas por fecha",
  badgeLabel = "Sky Blue Grid",
  className,
}) => {
  const [hoveredTile, setHoveredTile] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Build grid of last 20 weeks (140 days) ending today
  const { gridDays, totalContributions, monthLabels } = useMemo(() => {
    const today = new Date();
    const days: ActivityDay[] = [];
    let total = 0;

    // Create delivery count map by YYYY-MM-DD
    const countMap: Record<string, number> = {};
    deliveries.forEach((d) => {
      if (d.delivery_date) {
        const dateKey = d.delivery_date.substring(0, 10);
        countMap[dateKey] = (countMap[dateKey] || 0) + (d.quantity || 1);
      }
    });

    // Determine max count for scaling levels
    const maxCount = Math.max(...Object.values(countMap), 5);

    // Generate 140 days (20 weeks x 7 days)
    const numDays = 140;
    const startDate = new Date();
    startDate.setDate(today.getDate() - numDays + 1);

    const monthHeaderMap: { label: string; colIndex: number }[] = [];
    let currentMonth = -1;

    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      // Add month label when month changes
      if (d.getMonth() !== currentMonth) {
        currentMonth = d.getMonth();
        const colIdx = Math.floor(i / 7);
        const monthName = d.toLocaleDateString("es-AR", { month: "short" });
        monthHeaderMap.push({
          label: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
          colIndex: colIdx,
        });
      }

      // Check count strictly from real data
      let count = countMap[dateStr] || 0;

      // If explicit activity data provided, use it
      if (activityData) {
        const item = activityData.find((a) => a.date === dateStr);
        if (item) count = item.count;
      }

      total += count;

      // Level allocation based strictly on real activity
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) {
        const ratio = count / maxCount;
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.25) level = 2;
        else level = 1;
      }

      days.push({
        date: dateStr,
        count,
        level,
      });
    }

    return { gridDays: days, totalContributions: total, monthLabels: monthHeaderMap };
  }, [activityData, deliveries]);

  // Group days by column (weeks)
  const columns = useMemo(() => {
    const cols: ActivityDay[][] = [];
    for (let i = 0; i < gridDays.length; i += 7) {
      cols.push(gridDays.slice(i, i + 7));
    }
    return cols;
  }, [gridDays]);

  const levelStyles = {
    0: "bg-slate-800/40 dark:bg-slate-900/60 border-slate-800/30 hover:border-slate-700",
    1: "bg-sky-950/80 dark:bg-sky-950/60 border-sky-800/50 hover:bg-sky-900",
    2: "bg-sky-600/90 dark:bg-sky-600 border-sky-500 hover:bg-sky-500 shadow-[0_0_6px_rgba(56,189,248,0.3)]",
    3: "bg-sky-400 dark:bg-sky-400 border-sky-300 hover:bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]",
    4: "bg-sky-300 dark:bg-sky-300 border-white hover:bg-white shadow-[0_0_14px_rgba(56,189,248,0.9)] animate-pulse",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-800 bg-[#0b0f17] text-white p-6 shadow-xl flex flex-col justify-between overflow-hidden font-sans group transition-all duration-300",
        className
      )}
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl group-hover:bg-sky-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            {title}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/60 shadow-sm">
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Subtitle & Big Counter */}
      <p className="text-xs text-slate-400 mb-3 font-medium">
        {subtitle}
      </p>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black text-white tracking-tight font-mono">
          {totalContributions}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          entregas registradas en los últimos 140 días
        </span>
      </div>

      {/* Main Activity Heatmap Grid Box */}
      <div className="relative rounded-xl border border-slate-800/80 bg-[#0f1420] p-5 shadow-inner">
        {/* Month Labels Row */}
        <div className="flex justify-between items-center mb-3 text-[10px] font-mono text-slate-400 px-1">
          {monthLabels.slice(0, 5).map((m, idx) => (
            <span key={idx} className="text-slate-400 font-semibold">
              {m.label}
            </span>
          ))}
        </div>

        {/* Heatmap Grid Matrix (20 Weeks x 7 Days) */}
        <div className="flex justify-between items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5 shrink-0">
              {col.map((day, rowIdx) => (
                <motion.div
                  key={`${colIdx}-${rowIdx}`}
                  whileHover={{ scale: 1.3, zIndex: 20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTile({
                      date: day.date,
                      count: day.count,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={cn(
                    "h-3.5 w-3.5 rounded-md border transition-all duration-200 cursor-pointer",
                    levelStyles[day.level]
                  )}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Subtext */}
        <div className="text-center mt-4">
          <span className="text-[11px] font-mono text-slate-500 tracking-wide flex items-center justify-center gap-1">
            <Activity size={12} className="text-sky-400" />
            Hover tiles for metrics
          </span>
        </div>
      </div>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredTile && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              left: `${hoveredTile.x}px`,
              top: `${hoveredTile.y}px`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 100,
            }}
            className="rounded-lg bg-slate-900 border border-sky-500/40 px-3 py-2 shadow-2xl text-[11px] font-mono text-white text-center min-w-[160px]"
          >
            {hoveredTile.count > 0 ? (
              <div className="font-bold text-sky-400">
                {hoveredTile.count} {hoveredTile.count === 1 ? "entrega provista" : "entregas provistas"}
              </div>
            ) : (
              <div className="font-medium text-slate-400">Sin entregas de EPP</div>
            )}
            <div className="text-[10px] text-slate-400 mt-0.5">{hoveredTile.date}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Info size={12} className="text-sky-400" />
          Registra entregas de EPP y firmas procesadas por fecha
        </span>
        <span className="text-sky-400 font-bold tracking-wider">
          IfsinRem Activity
        </span>
      </div>
    </div>
  );
};

export default MonoActivityBlue;
