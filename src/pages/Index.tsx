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
  FileSpreadsheet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { openCalDemo } from "@/utils/cal";

// Amicro Micro-interaction Components
import { TiltCard } from "@/components/ui/amicro/TiltCard";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";
import { ShimmerBadge } from "@/components/ui/amicro/ShimmerBadge";
import KineticGrid from "@/components/ui/amicro/KineticGrid";

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
    language === 'en' ? "RESOLUTION SRT N° 299/11 COMPLIANT" : "RESOLUCIÓN SRT N° 299/11 OFICIAL",
    language === 'en' ? "IN-SITU TABLET DIGITAL SIGNATURE" : "FIRMA DIGITAL EN PANTALLA TÁCTIL",
    language === 'en' ? "SHA-256 CRYPTOGRAPHIC SEAL" : "SELLO CRIPTOGRÁFICO SHA-256 INMUTABLE",
    language === 'en' ? "PROVEN IN +400 WORKER WORKSITES" : "PROBADO EN OBRAS DE +400 OPERARIOS",
    language === 'en' ? "PUBLIC QR AUDIT INSPECTION" : "CÓDIGO QR PÚBLICO DE VERIFICACIÓN",
    language === 'en' ? "INSTANT FIELD MOBILE SYNC" : "SINCRONIZACIÓN INSTANTÁNEA EN CAMPO",
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

// ─── 4-STEP INTERACTIVE SIMULATOR WITH TALENTUM-INSPIRED FLOATING PIPELINE ──────
function FourStepInteractiveSimulator() {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [scanned, setScanned] = useState(false);

  // Auto cycle simulator steps every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 4) as any);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      sub: language === 'en' ? "HANDS-FREE FIELD LOGGING" : "CARGA RÁPIDA EN CAMPO",
      title: language === 'en' ? "1. Voice & Equipment Selection" : "1. Selección de EPP o Dictado",
      desc: language === 'en'
        ? "Supervisors pick items from inventory or speak naturally. System fills sizes, brand, and certificate numbers instantly."
        : "El supervisor selecciona calzado, cascos o dicta por voz. El sistema autocompleta marcas y certificados IRAM.",
      icon: Mic,
    },
    {
      id: 1,
      sub: language === 'en' ? "TOUCH SIGNATED AUDIT TRAIL" : "FIRMA TÁCTIL E IP GEOLOCALIZADA",
      title: language === 'en' ? "2. E-Signature & Audit Trail" : "2. Firma en Pantalla & Audit Trail",
      desc: language === 'en'
        ? "The worker signs directly on screen. GPS coordinates, site IP address, device specs, and timestamp are captured."
        : "El operario dibuja su firma táctil. Se capturan coordenadas GPS de la obra, IP del dispositivo y fecha/hora inalterable.",
      icon: FileSignature,
    },
    {
      id: 2,
      sub: language === 'en' ? "OFFICIAL PDF GENERATION" : "EMISIÓN AUTOMÁTICA DE CONSTANCIA",
      title: language === 'en' ? "3. Form 299/11 SRT Official" : "3. Formulario 299/11 Oficial SRT",
      desc: language === 'en'
        ? "Generates official PDF format compliant with Superintendencia de Riesgos del Trabajo (SRT) and ART requirements."
        : "Genera el PDF oficial homologado con la cuadrícula reglamentaria de la SRT para indumentaria y protección laboral.",
      icon: FileCheck,
    },
    {
      id: 3,
      sub: language === 'en' ? "SHA-256 CRYPTOGRAPHIC QR" : "INMUNIDAD DIGITAL Y VERIFICACIÓN QR",
      title: language === 'en' ? "4. Public QR Code Audit" : "4. Código QR & Validación Pública",
      desc: language === 'en'
        ? "Printed receipts contain a unique QR. Labor inspectors scan it to verify authenticity live without password."
        : "Cada planilla incluye un código QR único. Inspectores de la SRT o ART escanean el comprobante e inspeccionan la validez en tiempo real.",
      icon: QrCode,
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
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
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
        <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden min-h-[480px] flex flex-col">
          <BorderBeam size={180} duration={6} colorFrom="#10b981" colorTo="#06b6d4" />

          {/* Window Header */}
          <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="ml-2 text-xs font-mono text-slate-400">ifsinrem_control_center.app</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SRT N° 299/11 VALIDO</span>
            </div>
          </div>

          {/* Dynamic Interactive Stage Screen */}
          <div className="p-8 flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-[#040814] via-[#02050c] to-[#040814] text-center relative">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 w-full max-w-sm"
                >
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 relative z-10 shadow-xl shadow-emerald-500/20">
                      <Mic className="w-10 h-10 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      ▲ Carga Interactiva por Voz o Selección
                    </span>
                    <p className="text-sm font-heading font-bold text-white pt-2">
                      "Casco Dieléctrico + Calzado de Seguridad N° 42 para operario en yacimiento"
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      Certificación IRAM #48293 autocompletada
                    </p>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                      <span className="font-heading font-bold text-white">Captura de Firma Digital</span>
                      <span className="text-emerald-400 font-mono">IP: 190.220.42.18</span>
                    </div>

                    <div className="h-28 bg-slate-950 rounded-xl border border-slate-800/90 flex items-center justify-center relative overflow-hidden">
                      <span className="text-slate-600 text-[10px] font-mono absolute top-2 left-2">Firma Táctil Operario:</span>
                      <svg className="w-56 h-20 stroke-emerald-400 fill-none stroke-2">
                        <motion.path
                          d="M 15 45 Q 35 15, 75 40 T 140 25 T 195 50"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                        />
                      </svg>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>GPS: 24.7859° S, 65.4117° W</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">INMUTABLE</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 text-left space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-heading font-black text-white">FORMULARIO SRT 299/11</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">PDF GENERADO</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300 font-semibold border-b border-slate-800/60 pb-1">
                        <span>Constancia N°:</span>
                        <span className="font-mono text-emerald-400">#EPP-2026-4892</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Trabajador:</span>
                        <span className="text-white font-medium">Martín Pérez (Legajo #4820)</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Empresa:</span>
                        <span className="text-white font-medium">Industrial & Constructora S.A.</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">Homologación:</span>
                      <span className="text-emerald-400 font-bold">✓ Cumple Res. 299/11 SRT</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    onClick={() => setScanned(!scanned)}
                    className="w-36 h-36 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 p-3 flex flex-col items-center justify-center mx-auto shadow-2xl cursor-pointer relative group"
                  >
                    <QrCode className="w-20 h-20 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1.5 uppercase tracking-wider">
                      {scanned ? "✓ AUDITADO Y VALIDO" : "TOCÁ PARA ESCANEAR"}
                    </span>
                  </motion.div>

                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>PUBLIC VERIFICATION PORTAL</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 pt-1">
                      Hash SHA-256: 9a4f8b2c1e8d7f6a5b4c...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Bar Info */}
          <div className="bg-slate-900/70 p-3.5 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between px-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Verificación libre sin contraseña para inspectores</span>
            </span>
            <span className="text-emerald-400 font-bold">Módulo {activeStep + 1} de 4</span>
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
          
          {/* Talentum-style Floating Glass Micro Badges */}
          <div className="hidden lg:block pointer-events-none">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-28 left-8 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono text-slate-200 z-20 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-white">Res. SRT N° 299/11</span>
                <span className="text-[10px] text-emerald-400">✓ Homologado Oficial</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-36 right-8 p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/30 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono text-slate-200 z-20 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-white">Sello SHA-256</span>
                <span className="text-[10px] text-teal-300">Inalterabilidad Criptográfica</span>
              </div>
            </motion.div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            
            <FadeIn>
              <ShimmerBadge className="mb-8 font-mono text-xs tracking-wider">
                {language === 'en'
                  ? "PROVEN IN REAL OPERATIONS | MINING, CONSTRUCTION & HEAVY INDUSTRY"
                  : "PROBADO EN ENTORNOS REALES | MINERÍA, CONSTRUCCIÓN E INDUSTRIA PESADA"
                }
              </ShimmerBadge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-white tracking-tight leading-[1.08] mb-6">
                {language === 'en' ? (
                  <>
                    Digitize your PPE delivery{" "}
                    <span className="font-serif italic font-normal text-emerald-400 border-b-2 border-emerald-400/30 pb-0.5">
                      with unalterable legal validity.
                    </span>
                  </>
                ) : (
                  <>
                    Digitalizá la entrega de EPP{" "}
                    <span className="font-serif italic font-normal text-emerald-400 border-b-2 border-emerald-400/30 pb-0.5">
                      con validez legal inalterable.
                    </span>
                  </>
                )}
              </h1>
            </FadeIn>

            {/* Quick Enterprise Badges Bar */}
            <FadeIn delay={0.25}>
              <div className="pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono font-semibold text-slate-300">
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "Res. SRT N° 299/11 Official" : "Res. SRT N° 299/11 Oficial"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "SHA-256 Crypto Seal" : "Sello Criptográfico SHA-256"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "100% Mobile & Tablet Ready" : "100% Funciona en Celulares y Tablets"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                  <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? "Open QR Public Inspection" : "Verificación QR Pública"}</span>
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
