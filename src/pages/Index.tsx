import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Zap,
  Calendar,
  FileSignature,
  Users,
  Boxes,
  Sparkles,
  QrCode,
  FileText,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  Lock,
  ChevronRight,
  Mic,
  FileCheck,
  Check,
  Globe,
  Smartphone,
  ShieldCheck,
  Award,
  HardHat,
  Factory,
  Cpu,
  Layers,
  CheckSquare,
  Activity,
  FileSpreadsheet,
  Truck,
  ScanLine,
  Warehouse,
  Download,
  ArrowRightLeft,
  Search,
  BadgeCheck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { openCalDemo } from "@/utils/cal";
import AnimatedBeamIfsinrem from "@/components/ui/AnimatedBeamIfsinrem";

// Amicro Micro-interaction Components
import { TiltCard } from "@/components/ui/amicro/TiltCard";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";
import { ShimmerBadge } from "@/components/ui/amicro/ShimmerBadge";
import KineticGrid from "@/components/ui/amicro/KineticGrid";
import PressStorySection from "@/components/landing/PressStorySection";

// Smooth FadeIn with customizable spring motion
function FadeIn({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── INFINITE MARQUEE TICKER ──────────────────────────────────────────────────
function MarqueeTicker() {
  const { language } = useLanguage();
  const items = [
    language === 'en' ? "MULTI-SITE LOGISTICS & REAL-TIME STOCK" : "LOGÍSTICA MULTI-SEDE & CONTROL DE STOCK EN TIEMPO REAL",
    language === 'en' ? "QR DIGITAL DISPATCHES & INTER-SITE TRANSFERS" : "REMITOS DIGITALES & DESPACHOS CON CÓDIGO QR",
    language === 'en' ? "MOBILE FIELD INTAKE WITH CAMERA SCANNER" : "RECEPCIÓN MÓVIL EN CAMPO CON ESCÁNER ÓPTICO",
    language === 'en' ? "RESOLUTION SRT N° 299/11 OFFICIAL COMPLIANCE" : "RESOLUCIÓN SRT N° 299/11 OFICIAL HOMOLOGADA",
    language === 'en' ? "IN-SITU TOUCH SIGNATURE & SHA-256 SEAL" : "FIRMA DIGITAL EN PANTALLA TÁCTIL CON SELLO SHA-256",
    language === 'en' ? "MASS EXCEL IMPORT & KARDEX TRACEABILITY" : "IMPORTACIÓN MASIVA EXCEL & TRAZABILIDAD KARDEX",
    language === 'en' ? "PUBLIC QR INSPECTION WITHOUT PASSWORD" : "PORTAL PÚBLICO DE AUDITORÍA ART SIN CONTRASEÑA",
  ];

  return (
    <div className="py-3.5 bg-emerald-950/40 border-y border-emerald-500/20 overflow-hidden relative backdrop-blur-md">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-3 mx-6 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4-STEP INTERACTIVE SIMULATOR (FULL OPERATIONAL WORKFLOW) ─────────────────
function FourStepInteractiveSimulator() {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [scanned, setScanned] = useState(false);

  // Auto cycle simulator steps every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 4) as any);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      sub: language === 'en' ? "CENTRALIZED MULTI-SITE INVENTORY" : "CONTROL MULTI-SEDE CENTRALIZADO",
      title: language === 'en' ? "1. Multi-Site Stock & IRAM Catalog" : "1. Stock por Sedes & Catálogo IRAM",
      desc: language === 'en'
        ? "Real-time stock across Central Depots, Worksites, and Mining Camps. Automated minimum stock alerts & replenishment."
        : "Visualizá el stock en tiempo real en Base Central, Obras y Yacimientos. Configurá stock mínimo con alertas automáticas de reposición.",
      icon: Building2,
    },
    {
      id: 1,
      sub: language === 'en' ? "INTER-SITE DISPATCHES & TRANSFERS" : "TRANSFERENCIAS Y DESPACHOS ENTRE SEDES",
      title: language === 'en' ? "2. Digital Dispatches & QR Tracking" : "2. Remitos Digitales con Código QR",
      desc: language === 'en'
        ? "Generate digital waybills between plants. Tracks carrier, dispatch status (Draft -> In Transit -> Received), and movement kardex."
        : "Generá remitos de despacho con chofer, origen y destino. Seguimiento en vivo con estados Borrador, En Tránsito y Recibido.",
      icon: Truck,
    },
    {
      id: 2,
      sub: language === 'en' ? "OPTICAL CAMERA SCAN IN THE FIELD" : "ESCANEO ÓPTICO IN-SITU EN CELULAR",
      title: language === 'en' ? "3. Mobile Field Intake via Camera" : "3. Recepción en Terreno con Cámara",
      desc: language === 'en'
        ? "Storekeepers and site supervisors scan transfer QR codes with their phone camera. Instantly validates and adds items to local stock."
        : "Los pañoleros y supervisores escanean el remito con la cámara de su celular. Acredita los elementos al stock de obra al instante.",
      icon: Smartphone,
    },
    {
      id: 3,
      sub: language === 'en' ? "LEGAL COMPLIANCE & SHA-256 SEAL" : "BLINDAJE JURÍDICO & SELLO SHA-256",
      title: language === 'en' ? "4. Touch E-Signature & Res. SRT 299/11" : "4. Firma Táctil & Formulario SRT 299/11",
      desc: language === 'en'
        ? "Workers sign on mobile/tablet. Captures GPS, IP, and timestamp to generate official SRT 299/11 PDF with public QR verification."
        : "El operario firma en pantalla táctil con captura de GPS e IP. Genera la constancia oficial homologada por la SRT con sello inalterable.",
      icon: FileSignature,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
      
      {/* Left Column: Interactive Step Selector Buttons */}
      <div className="lg:col-span-6 space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <motion.div
              key={step.id}
              onClick={() => setActiveStep(step.id as any)}
              whileHover={{ scale: 1.02, x: 6 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/70 shadow-2xl shadow-emerald-500/20"
                  : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeStepIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                  isActive
                    ? "bg-emerald-500/25 border border-emerald-500/50 text-emerald-400 scale-110 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-950 border border-slate-800 text-slate-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                    {step.sub}
                  </span>
                  <h3 className={`text-base font-heading font-bold transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs font-sans text-slate-400 leading-relaxed pt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Column: Dynamic Interactive Terminal / Visual Canvas */}
      <div className="lg:col-span-6">
        <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          <BorderBeam size={180} duration={6} colorFrom="#10b981" colorTo="#06b6d4" />

          {/* Window Header */}
          <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="ml-2 text-xs font-mono text-slate-400">ifsinrem_ops_center.app</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SISTEMA ACTIVO</span>
            </div>
          </div>

          {/* Dynamic Interactive Stage Screen */}
          <div className="p-6 sm:p-8 flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-[#040814] via-[#02050c] to-[#040814] text-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* STEP 0: Multi-Site Stock Control */}
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-md"
                >
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-heading font-black text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        INVENTARIO POR SEDES & PAÑOLES
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        SINCRONIZADO
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {/* Sede 1 */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Warehouse className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-[11px]">Base Central Logística</span>
                            <span className="text-[9px] text-slate-400">Almacén Principal</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold text-xs block">450 u.</span>
                          <span className="text-[9px] text-emerald-500">Stock Óptimo</span>
                        </div>
                      </div>

                      {/* Sede 2 */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Factory className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-[11px]">Obra Yacimiento Norte</span>
                            <span className="text-[9px] text-slate-400">Pañol de Campo</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold text-xs block">18 u.</span>
                          <span className="text-[9px] text-amber-400 font-bold">⚠️ Bajo Mínimo</span>
                        </div>
                      </div>

                      {/* Sede 3 */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-[11px]">Depósito Puerto Seco</span>
                            <span className="text-[9px] text-slate-400">Distribución</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-bold text-xs block">120 u.</span>
                          <span className="text-[9px] text-slate-400">Normal</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Artículos IRAM Catalogados: <b className="text-white">64</b></span>
                      <span className="text-emerald-400 font-bold">✓ Alertas Activas</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Inter-Site Dispatches & QR Waybill */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-md"
                >
                  <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 text-left space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-heading font-black text-white">REMITO DE DESPACHO #REM-2026-8941</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold animate-pulse">
                        EN TRÁNSITO
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                        <span>Base Central</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-bold">Obra Yacimiento</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          initial={{ width: "20%" }}
                          animate={{ width: "80%" }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-white font-medium">📦 Casco Dieléctrico 3M (Cert. IRAM)</span>
                        <span className="text-emerald-400 font-bold">x 30 u.</span>
                      </div>
                      <div className="flex justify-between text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-white font-medium">🥾 Calzado Seguridad N°42 Puntera</span>
                        <span className="text-emerald-400 font-bold">x 20 u.</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Chofer: Juan Ramos (Camión #14)</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5" /> QR Emitido
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Mobile Field Camera Reception */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-xs"
                >
                  <div className="relative mx-auto rounded-3xl border-2 border-slate-700 bg-slate-900 p-4 shadow-2xl space-y-3">
                    {/* Mobile notch & header */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <ScanLine className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Recepción Móvil
                      </span>
                      <span className="text-emerald-400">● Cámara Activa</span>
                    </div>

                    {/* Camera Viewfinder */}
                    <div className="h-36 rounded-2xl bg-slate-950 border border-emerald-500/50 relative overflow-hidden flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-600 opacity-60" />
                      
                      {/* Laser scanning line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400"
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Viewfinder Target Brackets */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>

                    {/* Instant intake confirmation badge */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-heading font-black text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>¡REMITO #8941 RECIBIDO!</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-300">
                        +50 unidades acreditadas a Obra Yacimiento
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Touch E-Signature & Form 299/11 SRT */}
              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-md"
                >
                  <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 text-left space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-heading font-black text-white">FORMULARIO OFICIAL SRT 299/11</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        FIRMADO & SELLADO
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300 font-semibold border-b border-slate-800/60 pb-1">
                        <span>Constancia Digital:</span>
                        <span className="text-emerald-400">#EPP-2026-4892</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Trabajador:</span>
                        <span className="text-white font-medium">Martín Pérez (Legajo #4820)</span>
                      </div>
                    </div>

                    {/* Touch Signature Preview Sheet */}
                    <div className="h-20 bg-white rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-inner">
                      <span className="text-slate-400 text-[9px] font-mono absolute top-1 left-2">Firma Operario:</span>
                      <svg className="w-56 h-16 stroke-slate-950 fill-none stroke-2">
                        <motion.path
                          d="M 15 35 Q 35 10, 75 30 T 140 18 T 195 40"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                        />
                      </svg>
                      <div className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ SHA-256 MATCH
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>GPS: 24.7859° S, 65.4117° W</span>
                      <span className="text-emerald-400 font-bold">✓ Homologado SRT</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Bar Info */}
          <div className="bg-slate-900/70 p-3.5 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between px-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Plataforma operativa integral sin fisuras de auditoría</span>
            </span>
            <span className="text-emerald-400 font-bold">Paso {activeStep + 1} de 4</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function Index() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Background Glow Mesh & Animated Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px] animate-glow-pulse" />
        <div className="absolute top-[35%] -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[70%] -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* ─── HEADER BAR ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#02050e]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-emerald-500/40 flex items-center justify-center bg-slate-950 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400 transition-colors">
                <img src="/logo.png" alt="IfsinRem" className="h-full w-full object-cover" />
              </div>
              <span className="text-2xl font-display font-black text-white tracking-tight">
                ifsin<span className="text-emerald-400">rem</span>
              </span>
            </Link>

            {/* Center Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-semibold text-slate-300">
              <a href="#modulos" className="hover:text-emerald-400 transition-colors">
                {language === 'en' ? "Platform Modules" : "Módulos"}
              </a>
              <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">
                {language === 'en' ? "How it Works" : "Cómo funciona"}
              </a>
              <a href="#sectores" className="hover:text-emerald-400 transition-colors">
                {language === 'en' ? "Industries" : "Sectores"}
              </a>
              <a href="#seguridad-criptografica" className="hover:text-emerald-400 transition-colors">
                {language === 'en' ? "Legal Security" : "Seguridad & SRT"}
              </a>
              <a href="#prensa-historia" className="hover:text-emerald-400 transition-colors">
                {language === 'en' ? "Press & Story" : "Prensa & Historia"}
              </a>
              <a href="#agendar-demo" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                {language === 'en' ? "Demo" : "Agendar Demo"}
              </a>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-4">
              <LanguageSelector />

              <Link
                to="/auth"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-heading font-bold text-sm transition-colors shadow-md hover:border-emerald-500/50"
              >
                {t('header.login')}
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Marquee Ticker */}
      <MarqueeTicker />

      <main className="relative z-10">
        
        {/* ─── HERO SECTION WITH KINETIC GRID & FLOATING GLASS BADGES ─────── */}
        <KineticGrid globalColor="emerald" className="pt-16 pb-20 sm:pt-24 sm:pb-28 text-center border-b border-slate-800/80">
          
          {/* Floating Glass Micro Badges */}
          <div className="hidden lg:block pointer-events-none">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-28 left-8 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono text-slate-200 z-20 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-white">Logística Multi-Sede</span>
                <span className="text-[10px] text-emerald-400">Stock & Remitos QR en Vivo</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-36 right-8 p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/30 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono text-slate-200 z-20 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-white">Res. SRT N° 299/11</span>
                <span className="text-[10px] text-teal-300">Firma Táctil & Sello SHA-256</span>
              </div>
            </motion.div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            
            <FadeIn>
              <ShimmerBadge className="mb-8 font-mono text-xs tracking-wider">
                {language === 'en'
                  ? "FULL ENTERPRISE OPERATIONS | MULTI-DEPOT LOGISTICS & LEGAL SAFETY"
                  : "PLATAFORMA OPERATIVA INTEGRAL | LOGÍSTICA MULTI-SEDE & FIRMA DIGITAL SRT 299/11"
                }
              </ShimmerBadge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-white tracking-tight leading-[1.08] mb-6">
                {language === 'en' ? (
                  <>
                    Full control of multi-site stock, QR dispatches &{" "}
                    <span className="font-serif italic font-normal text-emerald-400 border-b-2 border-emerald-400/30 pb-0.5">
                      PPE delivery with legal validity.
                    </span>
                  </>
                ) : (
                  <>
                    Control total de stock por sedes, remitos QR y{" "}
                    <span className="font-serif italic font-normal text-emerald-400 border-b-2 border-emerald-400/30 pb-0.5">
                      entregas con firma legal inalterable.
                    </span>
                  </>
                )}
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed mb-8">
                {language === 'en'
                  ? "Centralize multi-depot inventory, track inter-site transfers via QR waybills, scan receipts on mobile in the field, and issue official SRT 299/11 certificates signed on touch screens."
                  : "Centralizá el inventario de múltiples bases y obras, despachá remitos digitales con código QR, recibí mercadería en campo con la cámara de tu celular y emití constancias oficiales SRT 299/11 firmadas en pantalla táctil."
                }
              </p>
            </FadeIn>

            {/* Quick Enterprise Badges Bar */}
            <FadeIn delay={0.25}>
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono font-semibold text-slate-300">
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "Multi-Site Inventory" : "Gestión Multi-Sede"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "QR Digital Dispatches" : "Remitos Digitales QR"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "Mobile Camera Scanner" : "Recepción Móvil en Campo"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "Res. SRT N° 299/11" : "Res. SRT N° 299/11 Oficial"}</span>
                </div>
              </div>
            </FadeIn>

          </div>
        </KineticGrid>

        {/* ─── SECCIÓN SEPARADA: IFSinRem EN OPERACIONES REALES ─── */}
        <section id="obras-destacadas" className="py-16 bg-[#02050e] border-b border-slate-800/80 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <FadeIn>
              <div className="rounded-3xl border border-slate-800/90 bg-[#060a17]/90 p-8 sm:p-12 shadow-2xl space-y-8 backdrop-blur-xl">
                
                {/* Header Title & Subtitle */}
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
                    {language === 'en' ? "IFSinRem in real operations" : "IFSinRem en operaciones reales"}
                  </h2>
                  <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed">
                    {language === 'en'
                      ? "IFSinRem was used in worksites of the following companies to digitize personnel management, generate QR credentials, and record operational documentation."
                      : "IFSinRem fue utilizado en obras de las siguientes empresas para digitalizar la gestión del personal, generar credenciales con código QR y registrar documentación operativa."
                    }
                  </p>
                </div>

                {/* 2-Column Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Card 1: TECHINT & SACDE */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#030611] p-6 flex items-center justify-center min-h-[150px] shadow-lg group hover:border-slate-700 transition-colors">
                    <img
                      src="/logos/logo-techint-sacde.png"
                      alt="TECHINT & SACDE"
                      className="max-h-12 sm:max-h-14 max-w-[220px] object-contain filter grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>

                  {/* Card 2: SAMJIN BMI UTE */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#030611] p-6 flex items-center justify-center min-h-[150px] shadow-lg group hover:border-slate-700 transition-colors">
                    <img
                      src="/logos/logo-samjin-bmi.png"
                      alt="SAMJIN BMI UTE"
                      className="max-h-12 sm:max-h-14 max-w-[220px] object-contain filter grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>

                </div>

              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── SECCIÓN: METRICAS Y PRUEBA SOCIAL EN TERRENO REAL ───────────────── */}
        <section id="prueba-social" className="py-20 bg-slate-950/90 border-y border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <FadeIn className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                {language === 'en' ? "OPERATIONAL METRICS" : "METRICAS DE OPERACIÓN"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-4 mb-4">
                {language === 'en' ? (
                  <>
                    Battle-tested performance in{" "}
                    <span className="font-serif italic font-normal text-emerald-400">demanding operations</span>
                  </>
                ) : (
                  <>
                    Desempeño verificado en{" "}
                    <span className="font-serif italic font-normal text-emerald-400">operaciones de campo</span>
                  </>
                )}
              </h2>
              <p className="text-slate-400 font-sans text-base sm:text-lg">
                {language === 'en'
                  ? "Designed for mining and construction environments where zero paper loss and audit safety are essential."
                  : "Diseñado para yacimientos y obras donde la velocidad, la cero pérdida de papeles y la seguridad ante inspecciones son esenciales."
                }
              </p>
            </FadeIn>

            {/* Metrics Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  metric: "+400",
                  label: language === 'en' ? "Active Workers per Site" : "Operarios Activos en Obra",
                  desc: language === 'en' ? "Simultaneous signature collection without server lag or bottlenecks." : "Gestión simultánea de firmas en obras y yacimientos sin latencia ni cuellos de botella."
                },
                {
                  metric: "+200",
                  label: language === 'en' ? "Signed PPE Receipts" : "Constancias EPP Firmadas",
                  desc: language === 'en' ? "Legally validated receipts with touch signature, GPS coordinates, and IP." : "Constancias de indumentaria y protección con firma táctil, IP y GPS inalterable."
                },
                {
                  metric: "100%",
                  label: language === 'en' ? "ART & SRT Compliance" : "Validez Legal SRT 299/11",
                  desc: language === 'en' ? "Approved by labor inspectors and insurance auditors via instant QR scan." : "Cumplimiento garantizado ante la Superintendencia de Riesgos del Trabajo y ART."
                },
                {
                  metric: "0.4s",
                  label: language === 'en' ? "Voice Dictation Speed" : "Dictado por Voz en Campo",
                  desc: language === 'en' ? "Hands-free field equipment logging without manual typing." : "Carga ultra rápida por voz de cascos, calzado y marcas sin escribir a mano."
                },
              ].map((stat, idx) => (
                <FadeIn key={idx} delay={0.08 * idx}>
                  <TiltCard
                    spotlightColor="rgba(16, 185, 129, 0.25)"
                    borderColor="rgba(16, 185, 129, 0.35)"
                    className="p-6 h-full flex flex-col justify-between space-y-4 bg-slate-900/60 border-slate-800"
                  >
                    <div>
                      <div className="text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight mb-2">
                        {stat.metric}
                      </div>
                      <h3 className="text-base font-heading font-bold text-white mb-2">{stat.label}</h3>
                      <p className="text-slate-400 font-sans text-xs leading-relaxed">{stat.desc}</p>
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>

          </div>
        </section>

        {/* ─── SECCIÓN: PRENSA iProUP & HISTORIA DEL FUNDADOR ───────────────── */}
        <PressStorySection />

        {/* ─── SECCIÓN: MÓDULOS OPERATIVOS DE LA PLATAFORMA (BENTO GRID) ──── */}
        <section id="modulos" className="py-24 border-b border-slate-800/80 bg-gradient-to-b from-[#02050e] via-[#040918] to-[#02050e]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                {language === 'en' ? "COMPLETE PLATFORM ARCHITECTURE" : "ARQUITECTURA MODULAR OPERATIVA"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-4 mb-6">
                {language === 'en' ? (
                  <>
                    An integrated ecosystem for{" "}
                    <span className="font-serif italic font-normal text-emerald-400">total operational control</span>
                  </>
                ) : (
                  <>
                    Un ecosistema integrado para el{" "}
                    <span className="font-serif italic font-normal text-emerald-400">control operativo total</span>
                  </>
                )}
              </h2>
              <p className="text-slate-400 font-sans text-base sm:text-lg">
                {language === 'en'
                  ? "From central warehouses to remote worksite sign-offs: complete digital tracking with zero paper loss."
                  : "Desde el depósito central hasta la firma in-situ en el yacimiento: trazabilidad punta a punta sin pérdida de papeles."
                }
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Warehouse,
                  tag: language === 'en' ? "MULTI-SITE LOGISTICS" : "LOGÍSTICA MULTI-SEDE",
                  title: language === 'en' ? "Real-Time Multi-Depot Stock" : "Stock por Sedes & Almacenes",
                  desc: language === 'en'
                    ? "Manage inventory across base stations, mining projects, and satellite tool rooms. Set automatic minimum thresholds and restocking alerts."
                    : "Controlá existencias en tiempo real por base central, obras y pañoles remotos. Configurá puntos de reorden y alertas automáticas de stock mínimo.",
                  badges: [language === 'en' ? "Depots & Worksites" : "Bases & Obras", language === 'en' ? "Auto Reorder" : "Puntos de Reorden", language === 'en' ? "Live Sync" : "Stock en Vivo"]
                },
                {
                  icon: Truck,
                  tag: language === 'en' ? "INTER-SITE TRANSFERS" : "DESPACHOS & TRANSFERENCIAS",
                  title: language === 'en' ? "Digital Dispatches with QR" : "Remitos Digitales con QR",
                  desc: language === 'en'
                    ? "Issue official digital waybills between facilities. Track carrier, vehicle, itemized manifest, and live status (Draft -> In Transit -> Delivered)."
                    : "Emití remitos electrónicos entre sedes con asignación de transportista, vehículo y manifiesto detallado. Trazabilidad Borrador, En Tránsito y Recibido.",
                  badges: [language === 'en' ? "QR Waybills" : "Remito con QR", language === 'en' ? "Status Tracking" : "Estados en Vivo", language === 'en' ? "Kardex Movement" : "Kardex Inalterable"]
                },
                {
                  icon: ScanLine,
                  tag: language === 'en' ? "MOBILE FIELD INTAKE" : "RECEPCIÓN MÓVIL EN CAMPO",
                  title: language === 'en' ? "Optical Camera Scanner" : "Recepción con Cámara Móvil",
                  desc: language === 'en'
                    ? "Site supervisors scan transfer QR codes directly using their phone or tablet camera. Instantly validates contents and credits local stock."
                    : "Los pañoleros en obra escanean el QR del remito con la cámara de su celular. Valida la carga recibida e ingresa automáticamente el stock sin tipear.",
                  badges: [language === 'en' ? "Camera Optical Scan" : "Escaneo Óptico", language === 'en' ? "Instant In-Situ Intake" : "Ingreso Inmediato", language === 'en' ? "Zero Manual Entry" : "0 Carga Manual"]
                },
                {
                  icon: FileSignature,
                  tag: language === 'en' ? "LEGAL COMPLIANCE" : "VALIDEZ LEGAL SRT 299/11",
                  title: language === 'en' ? "Touch E-Sign & SHA-256 Seal" : "Firma Táctil & Planilla Oficial",
                  desc: language === 'en'
                    ? "Official Resolution SRT 299/11 grid format. Captures touch signature, site IP, GPS coordinates, and binds an immutable SHA-256 hash."
                    : "Planilla oficial con cuadrícula obligatoria de la Resolución SRT 299/11. Firma manuscrita en pantalla, geolocalización GPS y sello criptográfico SHA-256.",
                  badges: [language === 'en' ? "Res. SRT 299/11" : "Res. SRT N° 299/11", language === 'en' ? "SHA-256 Hash" : "Sello Criptográfico", language === 'en' ? "Public QR Audit" : "Portal QR Público"]
                },
                {
                  icon: Users,
                  tag: language === 'en' ? "WORKFORCE MANAGEMENT" : "PADRÓN DE OPERARIOS",
                  title: language === 'en' ? "Worker Profile & Delivery Log" : "Padrón & Historial por Legajo",
                  desc: language === 'en'
                    ? "Centralized worker database with assigned depot, job role, apparel sizes, and full historical log of delivered safety gear and renewals."
                    : "Ficha digital de cada trabajador con sede asignada, puesto, talles de indumentaria y trazabilidad completa de todos los EPPs entregados.",
                  badges: [language === 'en' ? "Digital File" : "Ficha por Legajo", language === 'en' ? "Size Management" : "Control de Talles", language === 'en' ? "Renewal Reminders" : "Alertas de Recambio"]
                },
                {
                  icon: FileSpreadsheet,
                  tag: language === 'en' ? "INTEGRATIONS & EXCEL" : "IMPORTACIÓN & REPORTES",
                  title: language === 'en' ? "Mass Excel Import & Reports" : "Carga Masiva Excel & Reportes",
                  desc: language === 'en'
                    ? "Download ready-to-use templates to upload hundreds of inventory items or workers in 1 click. Export legal audit books in PDF and Excel."
                    : "Descargá plantillas oficiales para cargar cientos de artículos o personal en segundos. Exportá libros de entrega y planillas listas para la ART.",
                  badges: [language === 'en' ? "Excel Templates" : "Plantillas Excel", language === 'en' ? "1-Click Bulk Upload" : "Carga en 1 Clic", language === 'en' ? "PDF/XLS Exports" : "Exportación Oficial"]
                },
              ].map((mod, idx) => (
                <FadeIn key={idx} delay={0.08 * idx}>
                  <TiltCard
                    spotlightColor="rgba(16, 185, 129, 0.25)"
                    borderColor="rgba(16, 185, 129, 0.4)"
                    className="p-7 h-full flex flex-col justify-between space-y-5 bg-slate-900/60 border-slate-800"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <mod.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                          {mod.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-heading font-bold text-white">{mod.title}</h3>
                      <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">{mod.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {mod.badges.map((b, bi) => (
                        <span key={bi} className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>

          </div>
        </section>

        {/* ─── SECCIÓN: SECTORES INDUSTRIALES (MINERÍA, CONSTRUCCIÓN, ENERGÍA) ──── */}
        <section id="sectores" className="py-24 border-b border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                {language === 'en' ? "INDUSTRY FOCUS" : "SECTORES DE APLICACIÓN"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-4 mb-6">
                {language === 'en' ? (
                  <>
                    Engineered for{" "}
                    <span className="font-serif italic font-normal text-emerald-400">high-rigor industries</span>
                  </>
                ) : (
                  <>
                    Construido para sectores de{" "}
                    <span className="font-serif italic font-normal text-emerald-400">alta exigencia</span>
                  </>
                )}
              </h2>
              <p className="text-slate-400 font-sans text-base sm:text-lg">
                {language === 'en'
                  ? "Where physical paperwork fails and legal accountability demands bulletproof technology."
                  : "Donde el papel físico falla y la responsabilidad legal requiere tecnología blindada."
                }
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: HardHat,
                  tag: language === 'en' ? "MINING & EXTRACTION" : "MINERÍA Y YACIMIENTOS",
                  title: language === 'en' ? "High-altitude & Off-grid Mining Operations" : "Minería y Operaciones de Altura",
                  desc: language === 'en'
                    ? "Works seamlessly in remote mining operations and field camps. Registrations sync receipts automatically when connected."
                    : "Operatividad ininterrumpida en campamentos remotos. Permite registrar entregas y firmas de forma rápida con sincronización automática.",
                  badges: [language === 'en' ? "Mobile Field Sync" : "Sincronización en Terreno", language === 'en' ? "Hands-free Voice" : "Dictado por Voz", language === 'en' ? "GPS Seal" : "GPS Inalterable"]
                },
                {
                  icon: Building2,
                  tag: language === 'en' ? "LARGE SCALE CONSTRUCTION" : "OBRAS Y CONSTRUCCIÓN",
                  title: language === 'en' ? "Heavy Construction & 400+ Worker Worksites" : "Obras y Construcción de Gran Envergadura",
                  desc: language === 'en'
                    ? "Eliminate queues at site entry. Supervisors issue footwear and helmets in seconds, generating instant digital forms."
                    : "Eliminá las filas de entrega en el ingreso a obra. Los supervisores emiten calzado e indumentaria en segundos con firma táctil.",
                  badges: [language === 'en' ? "Mass Upload" : "Control Masivo", language === 'en' ? "Instant Forms" : "Firma en Tablet", language === 'en' ? "0 Bottlenecks" : "Sin Demoras"]
                },
                {
                  icon: Factory,
                  tag: language === 'en' ? "HEAVY INDUSTRY & MANUFACTURING" : "INDUSTRIA PESADA Y MANUFACTURA",
                  title: language === 'en' ? "Manufacturing Plants & Certification Control" : "Plantas Industriales y Control IRAM/IQC",
                  desc: language === 'en'
                    ? "Strict tracking of dielectric boots, respirators, and harnesses certificates. Prevent expired equipment usage with preventive alerts."
                    : "Seguimiento estricto de números de certificado IRAM e IQC para cascos, arneses y antiparras. Prevení el uso de elementos vencidos.",
                  badges: [language === 'en' ? "IRAM Tracking" : "Certificados IRAM", language === 'en' ? "Expiration Alerts" : "Alerta de Vencimiento", language === 'en' ? "Audit Trail" : "Trazabilidad Total"]
                },
                {
                  icon: Zap,
                  tag: language === 'en' ? "ENERGY & UTILITIES" : "ENERGÍA Y PETRÓLEO",
                  title: language === 'en' ? "Energy & Public Services Infrastructure" : "Energía, Gas y Servicios Públicos",
                  desc: language === 'en'
                    ? "Pass labor audits instantly. Auditors scan printed or digital QR codes to verify authenticity in real time without calling IT."
                    : "Superá auditorías de ART y SRT en segundos. Los inspectores escanean el QR público y validan la autenticidad sin requerir clave.",
                  badges: [language === 'en' ? "Public QR Portal" : "Portal QR Público", language === 'en' ? "SRT Audit Ready" : "Aprobado ART/SRT", language === 'en' ? "SHA-256 Seal" : "Hash Criptográfico"]
                },
              ].map((sec, idx) => (
                <FadeIn key={idx} delay={0.1 * idx}>
                  <TiltCard
                    spotlightColor="rgba(16, 185, 129, 0.2)"
                    borderColor="rgba(16, 185, 129, 0.35)"
                    className="p-8 h-full flex flex-col justify-between space-y-6 bg-slate-900/50 border-slate-800"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <sec.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                          {sec.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-heading font-bold text-white">{sec.title}</h3>
                      <p className="text-slate-300 font-sans text-sm leading-relaxed">{sec.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {sec.badges.map((b, bi) => (
                        <span key={bi} className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>

          </div>
        </section>

        {/* ─── SECCIÓN: CÓMO FUNCIONA (SIMULADOR DE 4 PASOS) ────────────────── */}
        <section id="como-funciona" className="py-24 bg-slate-950/80 border-b border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                {language === 'en' ? "SIMULATION DEMO" : "EXPERIENCIA INTERACTIVA EN VIVO"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-4 mb-6">
                {language === 'en' ? (
                  <>
                    How does IfsinRem work{" "}
                    <span className="font-serif italic font-normal text-emerald-400">in the field?</span>
                  </>
                ) : (
                  <>
                    ¿Cómo funciona IfsinRem{" "}
                    <span className="font-serif italic font-normal text-emerald-400">en el terreno?</span>
                  </>
                )}
              </h2>
              <p className="text-slate-400 font-sans text-base sm:text-lg">
                {language === 'en'
                  ? "Designed for field operators and executive directors. Select each module to test the interactive simulation."
                  : "Diseñado para supervisores de obra y directores corporativos. Seleccioná cada módulo para probar la simulación."
                }
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <FourStepInteractiveSimulator />
            </FadeIn>
          </div>
        </section>

        {/* ─── SECCIÓN: BLINDAJE CRIPTOGRÁFICO Y SEGURIDAD LEGAL ───────────────── */}
        <section id="seguridad-criptografica" className="py-24 bg-gradient-to-b from-[#02050e] via-[#050c1e] to-[#02050e] border-b border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <FadeIn>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "ENTERPRISE SECURITY & LEGAL SHIELD" : "BLINDAJE CRIPTOGRÁFICO Y AUDITORÍA"}
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight mt-4">
                    {language === 'en' ? (
                      <>
                        Unshakeable legal evidence &{" "}
                        <span className="font-serif italic font-normal text-emerald-400">maximum digital traceability</span>
                      </>
                    ) : (
                      <>
                        Evidencia legal inalterable y{" "}
                        <span className="font-serif italic font-normal text-emerald-400">máxima trazabilidad digital</span>
                      </>
                    )}
                  </h2>
                  <p className="text-slate-300 font-sans text-base leading-relaxed">
                    {language === 'en'
                      ? "Every signed receipt generates an immutable SHA-256 hash containing timestamp, geolocation, IP, and worker ID. Public QR code verification lets auditors inspect authenticity without user credentials."
                      : "Cada planilla firmada genera un Hash SHA-256 inmutable que concatena sello de tiempo, coordenadas GPS, IP y metadata del trabajador. El código QR permite a inspectores certificar autenticidad sin necesidad de claves."
                    }
                  </p>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        title: language === 'en' ? "SHA-256 Digital Hashing" : "Sello Criptográfico SHA-256",
                        desc: language === 'en' ? "Generates a unique fingerprint for each receipt, preventing post-signature modifications." : "Genera una huella digital única e inmodificable por cada constancia de entrega."
                      },
                      {
                        title: language === 'en' ? "Open QR Public Inspection Portal" : "Portal QR de Verificación Pública",
                        desc: language === 'en' ? "Inspectors scan the PDF QR code to view the live verification badge on an official URL." : "Los inspectores escanean el QR del PDF impreso y comprueban la insignia verde de validez en tiempo real."
                      },
                      {
                        title: language === 'en' ? "Multi-Tenant Row Level Security (RLS)" : "Aislamiento de Datos Multi-Tenant (RLS)",
                        desc: language === 'en' ? "Strict PostgreSQL database policies guarantee your company data remains isolated." : "Políticas strictly de base de datos PostgreSQL garantizan el aislamiento absoluto entre empresas."
                      },
                    ].map((secItem, sidx) => (
                      <div key={sidx} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-heading font-bold text-white">{secItem.title}</h4>
                          <p className="text-xs font-sans text-slate-400 leading-relaxed mt-0.5">{secItem.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>

              <div className="lg:col-span-6">
                <FadeIn delay={0.3}>
                  <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
                    <BorderBeam size={180} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-mono font-bold text-white">REPORTE_CRIPTOGRAFICO_SRT29911.PDF</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 font-bold">
                        VERIFICADO
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs text-slate-300">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase">HASH SHA-256 PAYLOAD:</span>
                        <p className="text-emerald-400 break-all text-[11px]">
                          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">TIMESTAMP UTC:</span>
                          <span className="text-white font-semibold">2026-08-13 12:24:10</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">COORDENADAS GPS:</span>
                          <span className="text-white font-semibold">24.7859° S, 65.4117° W</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">RESOLUCIÓN OFICIAL SRT:</span>
                        <span className="text-emerald-400 font-bold">Res. SRT N° 299/11</span>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-xs font-mono text-slate-400">
                        {language === 'en'
                          ? "✓ Validador público accesible sin instalar software adicional"
                          : "✓ Validador público accesible desde cualquier teléfono o computadora"
                        }
                      </span>
                    </div>
                  </div>
                </FadeIn>
              </div>

            </div>

          </div>
        </section>

        {/* ─── SECCIÓN: ANIMATED BEAM DATA PIPELINE IFSINREM ───────────────── */}
        <AnimatedBeamIfsinrem />

        {/* ─── SECCIÓN DEDICADA: AGENDAR DEMO / ASESORÍA CON CAL.COM (INLINE EMBED) ─── */}
        <section id="agendar-demo" className="py-24 bg-[#040816] border-b border-slate-800/80 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <FadeIn>
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-[#040816] p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
                <BorderBeam size={220} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />
                
                <div className="space-y-2 text-center max-w-2xl mx-auto">
                  <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                    {language === 'en' ? "INTERACTIVE SCHEDULING" : "ASESORÍA PERSONALIZADA"}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
                    {language === 'en' ? "Schedule a live demo on Cal.com" : "Agendá una reunión o demo en vivo"}
                  </h2>
                  <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
                    {language === 'en'
                      ? "Coordinate a 1-on-1 session with our engineering team directly below."
                      : "Coordiná una sesión 1-a-1 con nuestro equipo técnico seleccionando fecha y horario directamente aquí abajo."
                    }
                  </p>
                </div>

                {/* Embedded Cal.com Calendar Widget */}
                <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#080c14] shadow-inner min-h-[620px]">
                  <iframe
                    src="https://cal.com/ifsinrem?embed=true"
                    className="w-full h-[620px] border-0"
                    title="Agendar Asesoría en Cal.com"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── SECCIÓN: CTA FINAL PARA INGRESAR A LA PLATAFORMA ───────────────── */}
        <section id="acceso-plataforma" className="py-24 bg-gradient-to-b from-[#02050e] to-[#040918]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-[#040918] border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
              <BorderBeam size={200} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

              <div className="space-y-4">
                <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                  {language === 'en' ? "DIGITAL MANAGEMENT PLATFORM" : "GESTIÓN DOCUMENTAL DIGITAL"}
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
                  {language === 'en' ? (
                    <>
                      Ready to digitize{" "}
                      <span className="font-serif italic font-normal text-emerald-400">your company's safety?</span>
                    </>
                  ) : (
                    <>
                      ¿Listo para digitalizar{" "}
                      <span className="font-serif italic font-normal text-emerald-400">la seguridad de tu empresa?</span>
                    </>
                  )}
                </h2>
                <p className="text-slate-300 font-sans text-base sm:text-lg max-w-xl mx-auto">
                  {language === 'en'
                    ? "Access the platform with your corporate credentials to manage personnel and PPE deliveries."
                    : "Ingresá a la plataforma con tus credenciales corporativas para la gestión digital de personal y entregas de EPP."
                  }
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-heading font-black text-base px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 hover:scale-105"
                >
                  {language === 'en' ? "Access Platform" : "Ingresar a la Plataforma"} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "Res. SRT N° 299/11 Official" : "Cumplimiento Res. SRT N° 299/11"}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "SHA-256 Crypto Seal" : "Sello Criptográfico Inalterable"}</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "Data isolation & encryption" : "Aislamiento y cifrado de datos"}</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
