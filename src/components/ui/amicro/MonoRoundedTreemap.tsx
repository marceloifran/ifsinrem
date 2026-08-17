import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TreemapTileItem {
  id: string | number;
  label: string;
  category?: string;
  value: number; // e.g. stock or quantity
  unit?: string;
  percentage?: number;
  status?: "critical" | "optimal" | "warning" | "info";
  color?: string;
}

interface MonoRoundedTreemapProps {
  items: TreemapTileItem[];
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  className?: string;
  isDark?: boolean;
}

export const MonoRoundedTreemap: React.FC<MonoRoundedTreemapProps> = ({
  items,
  title = "PARTICIONES DE INVENTARIO Y STOCK",
  subtitle = "Distribución de inventario y estado crítico por particiones",
  badgeLabel = "Allocation",
  className,
  isDark = true,
}) => {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const processedItems = useMemo(() => {
    return items.map((item) => {
      const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
      return {
        ...item,
        percentage,
      };
    });
  }, [items, totalValue]);

  const getTileStyle = (index: number, status?: string) => {
    if (status === "critical") {
      return "bg-rose-950/80 text-white border border-rose-600/70 shadow-[0_0_20px_rgba(244,63,94,0.25)]";
    }
    if (status === "optimal") {
      return "bg-emerald-950/80 text-white border border-emerald-600/70 shadow-[0_0_20px_rgba(16,185,129,0.25)]";
    }

    const tileVariants = [
      "bg-slate-100 text-slate-900 border border-slate-200 dark:bg-white dark:text-slate-900 dark:border-white",
      "bg-slate-200 text-slate-900 border border-slate-300 dark:bg-slate-300 dark:text-slate-950 dark:border-slate-400",
      "bg-slate-700 text-white border border-slate-600 dark:bg-slate-700 dark:text-white dark:border-slate-600",
      "bg-slate-800 text-slate-200 border border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    ];

    return tileVariants[index % tileVariants.length];
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#080b11] p-6 shadow-sm flex flex-col justify-between overflow-hidden group transition-all duration-300",
        className
      )}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-slate-500/5 blur-3xl group-hover:bg-slate-500/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            {title}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Big Partition Counter */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          100%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          distribuido en {items.length} {items.length === 1 ? "partición" : "particiones"} de inventario
        </span>
      </div>

      {/* Main Treemap Grid Layout */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-[#0d111a] p-4 shadow-inner min-h-[180px]">
        {processedItems.length === 0 ? (
          <div className="flex h-36 items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
            Sin elementos en el treemap
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              processedItems.length === 1
                ? "grid-cols-1 md:grid-cols-2"
                : processedItems.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : processedItems.length <= 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {processedItems.map((item, idx) => {
              const isHovered = hoveredId === item.id;
              const tileClass = getTileStyle(idx, item.status);

              return (
                <motion.div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ scale: 1.025, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={cn(
                    "relative rounded-2xl p-4 min-h-[135px] flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm border overflow-hidden",
                    tileClass,
                    isHovered && "shadow-xl ring-2 ring-emerald-500/50"
                  )}
                >
                  {/* Category + Status Header Row */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] opacity-75 font-mono font-bold uppercase tracking-wider truncate">
                        {item.category || "Equipamiento"}
                      </span>

                      {item.status === "critical" && (
                        <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider shadow-sm animate-pulse">
                          CRÍTICO
                        </span>
                      )}
                      {item.status === "optimal" && (
                        <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider shadow-sm">
                          ÓPTIMO
                        </span>
                      )}
                    </div>

                    {/* Full width title with 2-line clamp */}
                    <h4
                      className="text-sm font-black tracking-tight leading-snug line-clamp-2"
                      title={item.label}
                    >
                      {item.label}
                    </h4>
                  </div>

                  {/* Bottom Metrics */}
                  <div className="flex items-end justify-between mt-3 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-2xl font-black font-mono leading-none block">
                        {item.percentage}%
                      </span>
                      <span className="text-xs opacity-90 font-bold block mt-1">
                        {item.value} {item.unit || "u."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 text-[11px] font-mono text-slate-500">
        <span>Rounded Corner Tiles</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold tracking-wider">
          {items.length} {items.length === 1 ? "Partición de Inventario" : "Particiones de Inventario"}
        </span>
      </div>
    </div>
  );
};

export default MonoRoundedTreemap;
