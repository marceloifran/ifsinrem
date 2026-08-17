import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Filter, CheckCircle2, AlertCircle, Shield, ArrowDown } from "lucide-react";

export interface FunnelStage {
  label: string;
  count: number;
  sublabel?: string;
  colorFrom?: string;
  colorTo?: string;
  badge?: string;
}

interface MonoRoundedFunnelProps {
  total: number;
  signed: number;
  pending: number;
  complianceRate: number;
  title?: string;
  subtitle?: string;
  className?: string;
  isDark?: boolean;
}

export const MonoRoundedFunnel: React.FC<MonoRoundedFunnelProps> = ({
  total,
  signed,
  pending,
  complianceRate,
  title = "Flujo de Firmas y Cumplimiento",
  subtitle = "Funnel de conversión de entregas desde la creación hasta la firma digital",
  className,
  isDark = true,
}) => {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const stages: FunnelStage[] = [
    {
      label: "1. Entregas Registradas",
      count: total,
      sublabel: "Total de elementos provistos en sistema",
      colorFrom: "from-cyan-500",
      colorTo: "to-blue-600",
      badge: "100% Creadas",
    },
    {
      label: "2. Formulario SRT 299/11 Generado",
      count: total,
      sublabel: "Constancias PDF e Integridad Hash SHA-256",
      colorFrom: "from-blue-500",
      colorTo: "to-emerald-500",
      badge: "100% Auditadas",
    },
    {
      label: "3. Firmadas Digitalmente",
      count: signed,
      sublabel: "Resguardo legal válido con firma táctil",
      colorFrom: "from-emerald-500",
      colorTo: "to-teal-400",
      badge: `${complianceRate}% Completadas`,
    },
  ];

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#080b11] p-6 shadow-sm flex flex-col justify-between overflow-hidden group transition-all duration-300",
        className
      )}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Funnel Pipeline Stages */}
      <div className="space-y-3.5 my-2">
        {stages.map((stage, idx) => {
          // Calculate relative funnel bar width percentage
          const widthPercent = total > 0 ? Math.max(Math.round((stage.count / total) * 100), 20) : 100;
          const isSelected = activeStage === idx;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Funnel Stage Bar Container */}
              <motion.div
                onMouseEnter={() => setActiveStage(idx)}
                onMouseLeave={() => setActiveStage(null)}
                whileHover={{ scale: 1.015 }}
                className={cn(
                  "relative w-full rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border",
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 shadow-md"
                    : "bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-900"
                )}
              >
                {/* Gradient Rounded Bar */}
                <div className="flex items-center justify-between relative z-10 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {stage.count} u.
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
                      {stage.badge}
                    </span>
                  </div>
                </div>

                {/* Progress bar background track */}
                <div className="h-3.5 w-full bg-slate-200/80 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-300 shadow-sm",
                      stage.colorFrom,
                      stage.colorTo
                    )}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  <span>{stage.sublabel}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {widthPercent}% de volumen
                  </span>
                </div>
              </motion.div>

              {/* Conversion Arrow Indicator between stages */}
              {idx < stages.length - 1 && (
                <div className="my-1 text-slate-300 dark:text-slate-700 flex items-center justify-center gap-1 text-[10px]">
                  <ArrowDown size={12} className="animate-bounce text-cyan-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-900">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
              FIRMADOS
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {signed} u. ({complianceRate}%)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <AlertCircle size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
              PENDIENTES
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {pending} u. ({100 - complianceRate}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonoRoundedFunnel;
