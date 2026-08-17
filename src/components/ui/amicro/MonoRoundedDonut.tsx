import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Boxes, ShieldCheck } from "lucide-react";

export interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
  category?: string;
}

interface MonoRoundedDonutProps {
  data: DonutDataItem[];
  title?: string;
  subtitle?: string;
  totalLabel?: string;
  unitLabel?: string;
  className?: string;
  isDark?: boolean;
}

const DEFAULT_PALETTE = [
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#64748b", // Slate
];

export const MonoRoundedDonut: React.FC<MonoRoundedDonutProps> = ({
  data,
  title = "Entregas por Categoría EPP",
  subtitle = "Distribución proporcional de elementos provistos",
  totalLabel = "Total Entregas",
  unitLabel = "u.",
  className,
  isDark = true,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const processedData = useMemo(() => {
    return data.map((item, idx) => ({
      ...item,
      color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      percentage: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0,
    }));
  }, [data, totalValue]);

  const activeItem = activeIndex !== null ? processedData[activeIndex] : null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#080b11] p-6 shadow-sm flex flex-col justify-between overflow-hidden group transition-all duration-300",
        className
      )}
    >
      {/* Background Micro Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Boxes size={13} className="text-emerald-500" />
          <span>{totalValue} {unitLabel}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Sin entregas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2">
          {/* Donut Chart Container */}
          <div className="md:col-span-6 relative h-64 flex items-center justify-center min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }} style={{ overflow: "visible" }}>
                <Pie
                  data={processedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={85}
                  paddingAngle={5}
                  cornerRadius={8}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {processedData.map((entry, index) => {
                    const isSelected = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 12px ${entry.color}aa)`
                            : "none",
                          transform: isSelected ? "scale(1.04)" : "scale(1)",
                          transformOrigin: "center center",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          opacity: activeIndex === null || isSelected ? 1 : 0.45,
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Dynamic Center Badge - Generous Spacing */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <AnimatePresence mode="wait">
                {activeItem ? (
                  <motion.div
                    key={activeItem.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center max-w-[120px]"
                  >
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full text-white mb-1"
                      style={{ backgroundColor: activeItem.color }}
                    >
                      {activeItem.percentage}%
                    </span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-tight font-mono">
                      {activeItem.value}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
                      {activeItem.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center max-w-[120px]"
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 leading-none">
                      TOTAL ENTREGAS
                    </span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none font-mono">
                      {totalValue}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                      Auditado
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Categories List (Legend) */}
          <div className="md:col-span-6 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {processedData.map((item, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={cn(
                    "group/item p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5",
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 shadow-sm"
                      : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-900 hover:bg-slate-100/80 dark:hover:bg-slate-900/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover/item:scale-125"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.value} {unitLabel}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                        opacity: isSelected ? 1 : 0.75,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Footer without explanation text */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-900 mt-2 flex items-center justify-end text-[11px] text-slate-400 dark:text-slate-500">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
          Amicro Mono Donut
        </span>
      </div>
    </div>
  );
};

export default MonoRoundedDonut;
