import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmployees, useEPPItems, useEPPDeliveries } from "@/hooks/useEPPData";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  AreaChart, Area
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download, Filter, Loader2, FileText, Shield, Boxes, Users, AlertTriangle, TrendingUp, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/skeletons/Skeletons";
import { motion } from "framer-motion";
import { MonoRoundedDonut } from "@/components/ui/amicro/MonoRoundedDonut";
import { MonoRoundedFunnel } from "@/components/ui/amicro/MonoRoundedFunnel";
import { MonoActivityBlue } from "@/components/ui/amicro/MonoActivityBlue";
import { MonoRoundedTreemap } from "@/components/ui/amicro/MonoRoundedTreemap";
import {
  getEmployees,
  getEPPItems,
  getEPPDeliveries,
  type Employee,
  type EPPItem,
  type EPPDelivery,
} from "@/services/eppService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ── color palette ───────────────────────────────────────────── */

const CLR = {
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  primary: "#06b6d4",
  purple: "#8b5cf6",
  muted: "#64748b",
};

/* ── shadcn chart config ──────────────────────────────────────── */

const chartConfig = {
  Signed: {
    label: "Firmados",
    color: "var(--chart-1)",
  },
  Firmados: {
    label: "Firmados",
    color: "var(--chart-1)",
  },
  Pending: {
    label: "Pendientes",
    color: "var(--chart-2)",
  },
  Pendientes: {
    label: "Pendientes",
    color: "var(--chart-2)",
  },
  "Pending Signature": {
    label: "Pendientes Firma",
    color: "var(--chart-2)",
  },
  "Pendientes Firma": {
    label: "Pendientes Firma",
    color: "var(--chart-2)",
  },
  Quantity: {
    label: "Cantidad",
    color: "var(--chart-3)",
  },
  Cantidad: {
    label: "Cantidad",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

/* ── recharts custom tooltip ──────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101d] px-4 py-3 shadow-xl text-xs text-slate-800 dark:text-white">
      {label && <p className="font-bold text-slate-700 dark:text-slate-350 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mt-0.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── stat card ────────────────────────────────────────────────── */

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  color: "red" | "amber" | "emerald" | "cyan";
}) {
  const c = {
    red: "text-red-650 dark:text-red-400 bg-red-500/5 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
    amber: "text-amber-650 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    emerald: "text-emerald-655 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-250 dark:border-emerald-500/20",
    cyan: "text-cyan-650 dark:text-cyan-400 bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
  }[color];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#080b11] p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={cn("h-8 w-8 rounded-xl border flex items-center justify-center", c)}>{icon}</div>
      </div>
      <p className="text-3xl font-black leading-none text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

/* ── chart card wrapper ───────────────────────────────────────── */

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#080b11] p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── custom pie label ─────────────────────────────────────────── */

const PIE_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RAD = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RAD);
  const y = cy + radius * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── page ─────────────────────────────────────────────────────── */

const Reports = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const companyId = profile?.company_id;

  const { data: employees = [], isLoading: loadingEmp } = useEmployees(companyId);
  const { data: eppItems = [], isLoading: loadingItems } = useEPPItems(companyId);
  const { data: deliveries = [], isLoading: loadingDel } = useEPPDeliveries(companyId);
  
  const loading = authLoading || !companyId || loadingEmp || loadingItems || loadingDel;
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Sync theme check for compliance circle stroke
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const handleThemeGlobal = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("theme-changed", handleThemeGlobal);
    return () => {
      window.removeEventListener("theme-changed", handleThemeGlobal);
    };
  }, []);

  // Filter deliveries by EPP category if needed
  const filteredDeliveries = useMemo(() => {
    if (categoryFilter === "all") return deliveries;
    return deliveries.filter(d => d.epp_item?.category === categoryFilter);
  }, [deliveries, categoryFilter]);

  // Calculate high-level compliance metrics
  const metrics = useMemo(() => {
    const total = filteredDeliveries.reduce((sum, d) => sum + d.quantity, 0);
    const signed = filteredDeliveries.filter(d => d.status === "firmado").reduce((sum, d) => sum + d.quantity, 0);
    const pending = total - signed;
    const complianceRate = total > 0 ? Math.round((signed / total) * 100) : 100;
    
    // Count items in inventory below critical level (stock <= 5)
    const lowStockCount = eppItems.filter(item => item.stock <= 5).length;

    return { total, signed, pending, complianceRate, lowStockCount };
  }, [filteredDeliveries, eppItems]);

  // Status distribution (Pie chart data)
  const statusData = useMemo(() => [
    { name: language === 'en' ? "Signed" : "Firmados", value: metrics.signed, color: CLR.success },
    { name: language === 'en' ? "Pending Signature" : "Pendientes Firma", value: metrics.pending, color: CLR.warning },
  ].filter(d => d.value > 0), [metrics, language]);

  // EPP Category distribution (Bar chart data)
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const d of filteredDeliveries) {
      const rawCat = (d.epp_item?.category || "otros").toLowerCase();
      let label = rawCat;
      if (rawCat.includes("cabeza") || rawCat.includes("crane")) {
        label = language === 'en' ? "Head Protection" : "Protección Craneana";
      } else if (rawCat.includes("mano")) {
        label = language === 'en' ? "Hand Protection" : "Protección de Manos";
      } else if (rawCat.includes("pie") || rawCat.includes("calza")) {
        label = language === 'en' ? "Foot Protection" : "Protección de Calzado";
      } else if (rawCat.includes("cuerp") || rawCat.includes("corpora")) {
        label = language === 'en' ? "Body Protection" : "Protección Corporal";
      } else if (rawCat.includes("visu") || rawCat.includes("ocula") || rawCat.includes("ojo")) {
        label = language === 'en' ? "Eye Protection" : "Protección Ocular";
      } else if (rawCat.includes("audi")) {
        label = language === 'en' ? "Hearing Protection" : "Protección Auditiva";
      } else if (rawCat.includes("respi")) {
        label = language === 'en' ? "Respiratory Protection" : "Protección Respiratoria";
      } else {
        label = language === 'en' ? "Other Equipment" : "Otros Equipos";
      }
      cats[label] = (cats[label] || 0) + d.quantity;
    }
    const qtyKey = language === 'en' ? "Quantity" : "Cantidad";
    return Object.entries(cats).map(([name, value]) => ({
      name,
      [qtyKey]: value,
      Cantidad: value
    }));
  }, [filteredDeliveries, language]);

  // Donut data formatted for MonoRoundedDonut chart
  const donutData = useMemo(() => {
    return categoryData.map(c => ({
      name: c.name,
      value: Number(c.Cantidad || 0),
    }));
  }, [categoryData]);

  // Treemap tile data for MonoRoundedTreemap chart
  const treemapItems = useMemo(() => {
    const inventoryTiles = eppItems.map((item) => ({
      id: `item-${item.id}`,
      label: item.name,
      category: item.category || "Equipamiento",
      value: Number(item.stock || 0),
      unit: "u.",
      status: item.stock <= 5 ? ("critical" as const) : ("info" as const),
    }));

    if (inventoryTiles.length === 0) {
      return [
        {
          id: "signed",
          label: "Entregas Firmadas",
          category: "Cumplimiento",
          value: metrics.signed,
          unit: "u.",
          status: "optimal" as const,
        },
        {
          id: "pending",
          label: "Pendientes de Firma",
          category: "Cumplimiento",
          value: metrics.pending,
          unit: "u.",
          status: metrics.pending > 0 ? ("critical" as const) : ("optimal" as const),
        },
      ];
    }

    return inventoryTiles;
  }, [eppItems, metrics]);

  // Monthly trend (Line chart data)
  const trendData = useMemo(() => {
    const signedKey = language === 'en' ? "Signed" : "Firmados";
    const pendingKey = language === 'en' ? "Pending" : "Pendientes";
    const monthlyCounts: Record<string, { month: string; [key: string]: any }> = {};
    
    // Generate last 6 months keys
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(language === 'en' ? "en-US" : "es-AR", { month: "short" });
      monthlyCounts[monthKey] = { month: label, [signedKey]: 0, [pendingKey]: 0 };
    }

    for (const d of filteredDeliveries) {
      const dateStr = d.delivery_date;
      if (!dateStr) continue;
      const key = dateStr.substring(0, 7); // YYYY-MM
      if (monthlyCounts[key]) {
        if (d.status === "firmado") {
          monthlyCounts[key][signedKey] += d.quantity;
        } else {
          monthlyCounts[key][pendingKey] += d.quantity;
        }
      }
    }

    return Object.values(monthlyCounts);
  }, [filteredDeliveries, language]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      const isEn = language === 'en';
      
      // Header Box
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(10, 15, 190, 30);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(isEn ? "PPE & WORK SAFETY CONTROL AUDIT REPORT" : "AUDITORÍA DE CONTROL DE EPP Y SEGURIDAD LABORAL", 15, 25);
      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.text(`${isEn ? "Company" : "Empresa"}: ${profile?.company_name || "Mi Empresa ifsinrem"}`, 15, 33);
      doc.text(`${isEn ? "Generation Date" : "Fecha de Generación"}: ${new Date().toLocaleDateString(isEn ? "en-US" : "es-AR")}`, 15, 38);
      doc.text(`${isEn ? "Signature Rate" : "Tasa de Cumplimiento"}: ${metrics.complianceRate}%`, 130, 33);
      doc.text(`${isEn ? "Total PPE Delivered" : "Total EPP Entregados"}: ${metrics.total} u.`, 130, 38);

      // Employees Compliance Table
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text(isEn ? "Worker Signature Summary:" : "Resumen de Firmas por Operario:", 10, 52);

      const tableRows = employees.map(emp => {
        const empDels = deliveries.filter(d => d.employee_id === emp.id);
        const totalEmp = empDels.reduce((sum, d) => sum + d.quantity, 0);
        const signedEmp = empDels.filter(d => d.status === "firmado").reduce((sum, d) => sum + d.quantity, 0);
        const pendingEmp = totalEmp - signedEmp;
        const rate = totalEmp > 0 ? `${Math.round((signedEmp / totalEmp) * 100)}%` : "N/A";
        return [emp.name, emp.dni_cuil, emp.job_title || (isEn ? "General" : "General"), totalEmp.toString(), signedEmp.toString(), pendingEmp.toString(), rate];
      });

      autoTable(doc, {
        startY: 55,
        head: isEn 
          ? [['Worker', 'ID / CUIL', 'Job Title', 'Delivered', 'Signed', 'Pending', 'Compliance Rate']]
          : [['Operario', 'DNI / CUIL', 'Puesto', 'Entregados', 'Firmados', 'Pendientes', 'Cumplimiento']],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }
      });

      // Stock alerts table
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont("Helvetica", "bold");
      doc.text(isEn ? "Warehouse Critical Stock Status:" : "Estado Crítico de Stock en Depósito:", 10, finalY);

      const stockRows = eppItems.map(item => {
        const isCritical = item.stock <= 5 
          ? (isEn ? "YES (CRITICAL)" : "SÍ (CRÍTICO)") 
          : (isEn ? "NO (SUFFICIENT)" : "NO (SUFFICIENT)");
        return [item.name, item.brand || "-", item.type_model || "-", item.certified === "Si" ? (isEn ? "YES" : "SÍ") : "NO", `${item.stock} u.`, isCritical];
      });

      autoTable(doc, {
        startY: finalY + 3,
        head: isEn
          ? [['Item Name', 'Brand', 'Model', 'Certified', 'Current Stock', 'Stock Alert']]
          : [['Elemento', 'Marca', 'Modelo', 'Certificado', 'Stock Actual', 'Alerta']],
        body: stockRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] }
      });

      const reportFileName = isEn ? `ppe_audit_report_${new Date().toISOString().split("T")[0]}.pdf` : `auditoria_epp_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(reportFileName);
      toast.success(isEn ? "Consolidated audit report downloaded successfully" : "Reporte consolidado descargado con éxito");
    } catch (err: any) {
      toast.error(language === 'en' ? "Error generating PDF report" : "Error al generar reporte PDF");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        userName={profile?.name || user?.email || "Usuario"}
        onLogout={signOut}
        isAdmin={isAdmin}
        userPlan={profile?.plan}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-900 pb-5"
        >
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t("reports.title")}</h1>
            <p className="text-xs text-slate-455 dark:text-slate-500 mt-0.5">{t("reports.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[180px] text-xs">
                <Filter size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <SelectValue placeholder={language === 'en' ? "Category" : "Categoría"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? "All Categories" : "Todas las Categorías"}</SelectItem>
                <SelectItem value="cabeza">{language === 'en' ? "Head Protection" : "Protección Craneana"}</SelectItem>
                <SelectItem value="manos">{language === 'en' ? "Hand Protection" : "Protección de Manos"}</SelectItem>
                <SelectItem value="pies">{language === 'en' ? "Foot Protection" : "Protección de Calzado"}</SelectItem>
                <SelectItem value="cuerpo">{language === 'en' ? "Body Protection" : "Protección Corporal"}</SelectItem>
                <SelectItem value="visual">{language === 'en' ? "Eye Protection" : "Protección Ocular"}</SelectItem>
                <SelectItem value="auditiva">{language === 'en' ? "Hearing Protection" : "Protección Auditiva"}</SelectItem>
                <SelectItem value="respiratoria">{language === 'en' ? "Respiratory Protection" : "Protección Respiratoria"}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="h-9 gap-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/10"
            >
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {isExporting ? (language === 'en' ? "Generating..." : "Generando...") : (language === 'en' ? "Export Audit" : "Exportar Auditoría")}
            </Button>
          </div>
        </motion.div>

        {/* STAT CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <StatCard icon={<Shield size={15} />} label={language === 'en' ? "Compliance" : "Cumplimiento"} value={`${metrics.complianceRate}%`} sub={language === 'en' ? "Signed delivery rate" : "Tasa de entregas firmadas"} color="emerald" />
          <StatCard icon={<Boxes size={15} />} label={language === 'en' ? "Total Delivered" : "Total Entregado"} value={`${metrics.total} u.`} sub={language === 'en' ? "Provided items" : "Elementos provistos"} color="cyan" />
          <StatCard icon={<AlertTriangle size={15} />} label={language === 'en' ? "Pending Signature" : "Pendiente Firma"} value={`${metrics.pending} u.`} sub={language === 'en' ? "Missing worker signature" : "Falta firma del operario"} color="amber" />
          <StatCard icon={<Users size={15} />} label={language === 'en' ? "Critical Stock" : "Stock Crítico"} value={`${metrics.lowStockCount} items`} sub={language === 'en' ? "PPE items with stock <= 5" : "EPP con stock <= 5"} color="red" />
        </motion.div>

        {/* ROW 1: status distribution + category bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Mono Rounded Funnel Chart (Replaces Distribución de Firmas) */}
          <MonoRoundedFunnel
            total={metrics.total}
            signed={metrics.signed}
            pending={metrics.pending}
            complianceRate={metrics.complianceRate}
            title={language === 'en' ? "Signature & Compliance Funnel" : "Flujo de Firmas y Cumplimiento"}
            subtitle={language === 'en' ? "Conversion pipeline of deliveries through digital signature" : "Funnel de conversión de entregas desde la creación hasta la firma digital"}
            isDark={isDark}
          />

          {/* Mono Rounded Donut Chart for EPP Categories */}
          <MonoRoundedDonut
            data={donutData}
            title={language === 'en' ? "Deliveries by PPE Category" : "Entregas por Categoría EPP"}
            subtitle={language === 'en' ? "Quantity of units provided by protection type" : "Cantidad de unidades provistas por tipo de protección"}
            totalLabel={language === 'en' ? "Total Delivered" : "Total Entregados"}
            unitLabel={language === 'en' ? "u." : "u."}
            isDark={isDark}
          />
        </motion.div>

        {/* ROW 2: Activity Heatmap (mono-activity-blue) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <MonoActivityBlue
            deliveries={deliveries}
            title={language === 'en' ? "ACTIVITY HEATMAP" : "MAPA DE ACTIVIDAD DEL SISTEMA"}
            subtitle={language === 'en' ? "Daily system usage and delivery activity grid" : "Registro de uso del sistema y entregas por día (20 Semanas)"}
            badgeLabel="Sky Blue Grid"
          />
        </motion.div>

        {/* ROW 2: Gradient Area Chart for Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#080b11] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'en' ? "Monthly Delivery Trend" : "Evolución Mensual de Entregas"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en' ? "History of quantities distributed over time with gradient fill" : "Historial de cantidades distribuidas por firma en el tiempo con relleno degradado"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart
                  accessibilityLayer
                  data={trendData}
                  margin={{ left: 0, right: 15, top: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#475569" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#475569" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <ChartTooltip cursor={{ stroke: isDark ? "#334155" : "#cbd5e1" }} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <defs>
                    <linearGradient id="fillSigned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey={language === 'en' ? "Signed" : "Firmados"}
                    type="monotone"
                    fill="url(#fillSigned)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                  />
                  <Area
                    dataKey={language === 'en' ? "Pending" : "Pendientes"}
                    type="monotone"
                    fill="url(#fillPending)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex w-full items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{language === 'en' ? `Compliance rate: ${metrics.complianceRate}%` : `Tasa de cumplimiento: ${metrics.complianceRate}%`}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* ROW 3: compliance audit score details */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Legal Compliance Score Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#080b11] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {language === 'en' ? "Legal Compliance Score" : "Score de Cumplimiento Legal"}
                </span>
                <span className={cn(
                  "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide",
                  metrics.complianceRate >= 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : metrics.complianceRate >= 50 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {metrics.complianceRate >= 80 ? (language === 'en' ? "OPTIMAL" : "ÓPTIMO") : (language === 'en' ? "REQUIRES ATTENTION" : "REQUIERE ATENCIÓN")}
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.complianceRate}%</h2>
                  <span className="text-xs text-slate-400 font-semibold">{metrics.signed} / {metrics.total} {language === 'en' ? "units signed" : "unidades firmadas"}</span>
                </div>
                {/* Sleek Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      metrics.complianceRate >= 80 ? "bg-emerald-500" : metrics.complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${metrics.complianceRate}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {metrics.complianceRate >= 90
                  ? (language === 'en' ? "Shielded Company — Full legal protection under SRT Res 299/11." : "Empresa Blindada — Cumplimiento total de resguardo bajo la Res. SRT 299/11.")
                  : metrics.complianceRate >= 70
                  ? (language === 'en' ? "Acceptable Level — Pending tactile signatures need completion." : "Nivel Aceptable — Se requiere completar las firmas táctiles pendientes.")
                  : (language === 'en' ? "Critical Risk — Missing worker signatures trigger fine risks." : "Riesgo Crítico — La falta de firmas genera riesgo directo de sanción.")}
              </p>

              {/* Sub-cards like Screenshot 2 */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {language === 'en' ? "SIGNED DELIVERIES" : "ENTREGAS FIRMADAS"}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {metrics.signed} {language === 'en' ? "Units" : "Unidades"}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    {language === 'en' ? "Verified SRT" : "Verificado SRT"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {language === 'en' ? "PENDING SIGNATURES" : "PENDIENTES DE FIRMA"}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {metrics.pending} {language === 'en' ? "Units" : "Unidades"}
                  </span>
                  <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">
                    {metrics.pending > 0 ? (language === 'en' ? "Requires Tactile Sign" : "Requiere Firma Táctil") : (language === 'en' ? "All Complete" : "Al Día")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3 text-xs border-0 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {isExporting ? (language === 'en' ? "Generating PDF..." : "Generando PDF...") : (language === 'en' ? "Download Full Audit Report (PDF)" : "Descargar Reporte Completo de Auditoría (PDF)")}
            </Button>
          </Card>

          {/* Mono Tile Treemap (mono-rounded-treemap) replacing raw inventory status */}
          <MonoRoundedTreemap
            items={treemapItems}
            title={language === 'en' ? "TILE TREEMAP" : "PARTICIONES DE INVENTARIO Y STOCK"}
            subtitle={language === 'en' ? "Inventory distribution treemap with critical stock thresholds" : "Relación de elementos en stock frente al stock crítico en formato Treemap"}
            badgeLabel="Allocation"
            isDark={isDark}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Reports;
