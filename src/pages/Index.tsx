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
  Bot,
  Globe,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

// Amicro Micro-interaction Components
import { TiltCard } from "@/components/ui/amicro/TiltCard";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";
import { ShimmerBadge } from "@/components/ui/amicro/ShimmerBadge";

// Smooth FadeIn with customizable animation
function FadeIn({
  children,
  delay = 0,
  y = 16,
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
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── 4-Step Interactive System Simulator (As requested by user) ────────────────
function FourStepInteractiveSimulator() {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Auto cycle simulator steps every 6 seconds if user doesn't click
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 4) as any);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      sub: language === 'en' ? "HANDS-FREE FIELD DICTATION" : "DICTADO EN CAMPO SIN TIPEAR",
      title: language === 'en' ? "1. Smart Voice Input" : "1. Carga Inteligente por Voz",
      desc: language === 'en'
        ? "The supervisor presses a button and speaks naturally. Our AI interprets names, sizes, and protective equipment in real time."
        : "El supervisor presiona un botón y habla de forma natural. Nuestra IA interpreta nombres, talles y elementos de protección en tiempo real.",
      icon: Mic,
    },
    {
      id: 1,
      sub: language === 'en' ? "IP, GPS & AUDIT SEAL" : "IP, GEOLOCALIZACIÓN GPS Y REGISTRO MUESTRA",
      title: language === 'en' ? "2. Digital Signature & Audit Trail" : "2. Firma Digital & Audit Trail",
      desc: language === 'en'
        ? "The worker draws a touch signature. The system logs site IP, GPS location, timestamp, and unalterability seal."
        : "El operario dibuja su firma táctil. El sistema registra la IP de la obra, ubicación GPS y sello de inalterabilidad.",
      icon: FileSignature,
    },
    {
      id: 2,
      sub: language === 'en' ? "AUTOMATIC LEGAL COMPLIANCE" : "CUMPLIMIENTO LEGAL AUTOMÁTICO",
      title: language === 'en' ? "3. Official Form 299/11" : "3. Planilla 299/11 Oficial",
      desc: language === 'en'
        ? "The system instantly generates the official PDF in the exact format required by the Labor & Risk Authorities."
        : "El sistema genera al instante el PDF oficial con el formato exacto exigido por la Superintendencia de Riesgos del Trabajo (SRT).",
      icon: FileCheck,
    },
    {
      id: 3,
      sub: language === 'en' ? "SHA-256 CRYPTOGRAPHIC SEAL" : "SELLO CRIPTOGRÁFICO SHA-256 E INSPECCIÓN ART",
      title: language === 'en' ? "4. QR Code & Public Verification" : "4. Código QR & Verificación Pública",
      desc: language === 'en'
        ? "Each receipt includes a unique QR code. Anyone can scan it to validate authenticity in real time without password."
        : "Cada planilla incluye un código QR único. Al escanearlo desde cualquier teléfono, se valida la constancia inalterable en tiempo real ante la SRT/ART.",
      icon: QrCode,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
      
      {/* Left Column: 4 Interactive Moment Cards */}
      <div className="lg:col-span-6 space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id as any)}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-emerald-950/60 to-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10"
                  : "bg-slate-900/40 border-slate-800/70 hover:border-slate-700/80 hover:bg-slate-900/60"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-400" />
              )}

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-slate-950 border border-slate-800 text-slate-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                    {step.sub}
                  </span>
                  <h3 className={`text-base font-bold transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Live Interactive Window Simulator Screen */}
      <div className="lg:col-span-6">
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden min-h-[460px] flex flex-col">
          <BorderBeam size={160} duration={6} colorFrom="#10b981" colorTo="#06b6d4" />

          {/* Window Header */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="ml-2 text-xs font-mono text-slate-400">simulador_ifsinrem.exe</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="text-emerald-400">VALIDACIÓN QR & HASH SHA-256</span>
              <span>Trazabilidad SRT</span>
            </div>
          </div>

          {/* Dynamic Simulator Screen Content */}
          <div className="p-8 flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-[#050914] to-[#02050c] text-center relative">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 w-full max-w-sm"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                    <Mic className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      IA Escuchando Dictado en Vivo...
                    </span>
                    <p className="text-sm font-semibold text-white pt-2">
                      "Casco de seguridad Dieléctrico Amarillo + Calzado N° 42 para Martín Pérez"
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Procesando lenguaje natural en 0.4s
                    </p>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                      <span>Firma Táctil Registrada</span>
                      <span className="text-emerald-400 font-mono">IP: 190.220.42.18</span>
                    </div>

                    <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                      <span className="text-slate-700 text-xs absolute top-2 left-2">Firma Operario:</span>
                      <svg className="w-48 h-16 stroke-emerald-400 fill-none stroke-2">
                        <path d="M 10 30 Q 30 10, 60 35 T 120 20 T 170 40" />
                      </svg>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>GPS: 24.7859° S, 65.4117° W</span>
                      <span className="text-emerald-400 font-semibold">Inalterable</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">RESOLUCIÓN SRT N° 299/11</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PDF OFICIAL</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-300 font-semibold">Constancia de Entrega de Ropa de Trabajo y EPP</p>
                      <p className="text-slate-400 text-[11px]">Trabajador: Martín Pérez | DNI: 35.842.109</p>
                      <p className="text-slate-400 text-[11px]">Empresa: Industrial Salta S.A.</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">✓ Formato Aprobado SRT</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="w-32 h-32 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 p-3 flex flex-col items-center justify-center mx-auto shadow-xl">
                    <QrCode className="w-16 h-16 text-emerald-400" />
                    <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">ESCANEABLE ART</span>
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" /> CONSTANCIA AUTÉNTICA 299/11
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 pt-1">
                      Hash: 9a4f8b2c1e8d7f6a5b4c...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Bar Info */}
          <div className="bg-slate-900/60 p-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between px-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Acceso Público: Cualquier inspector valida sin contraseña
            </span>
            <span className="font-mono text-slate-500">Paso {activeStep + 1} de 4</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Interactive AI Playground ────────────────────────────────────────────────
function InteractiveAIPlayground() {
  const { language } = useLanguage();
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const prompts = [
    {
      q: language === 'en'
        ? "Which safety training certificates expire in the next 10 days?"
        : "¿Cuáles capacitaciones de seguridad vencen en los próximos 10 días?",
      a: language === 'en'
        ? "Analysis complete: 2 'Work at Heights' certificates expiring on Aug 18 in Maintenance. Automated notices scheduled."
        : "Análisis completado: Se identificaron 2 capacitaciones de 'Trabajo en Altura' que vencen el 18 de Agosto en el Sector Mantenimiento. Las notificaciones automáticas ya han sido programadas.",
    },
    {
      q: language === 'en'
        ? "Generate compliance summary report for labor inspection"
        : "Generar resumen de cumplimiento para auditoría de la SRT",
      a: language === 'en'
        ? "Report generated: 100% PPE delivery receipts with valid digital signatures and immutable QR code. 0 pending forms."
        : "Informe generado: 100% de entregas de EPP y calzado con firma digital válida y código QR inmutable. 0 planillas pendientes de firma.",
    },
    {
      q: language === 'en'
        ? "Which workers have dielectric footwear delivery pending?"
        : "¿Qué operarios tienen entrega de calzado dieléctrico pendiente?",
      a: language === 'en'
        ? "Search finished: 1 pending delivery for worker Carlos Gómez (Logistics). Receipt form prepared for mobile dispatch."
        : "Búsqueda finalizada: Se registra 1 entrega pendiente para el operario Carlos Gómez (Sector Logística). Formulario preparado para enviar a celular.",
    },
  ];

  return (
    <div className="bg-slate-900/70 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <BorderBeam size={160} duration={6} colorFrom="#10b981" colorTo="#38bdf8" />
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              {language === 'en' ? "AI Copilot - Interactive Demo" : "IA Copilot - Demo Intercativa"}
            </h4>
            <span className="text-xs text-emerald-400">
              {language === 'en' ? "Click a query to test AI motor live" : "Hacé clic en una pregunta para probar el motor de IA en tiempo real"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {language === 'en' ? "Try a query:" : "Probá una consulta:"}
        </span>
        <div className="grid grid-cols-1 gap-2">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPrompt(idx)}
              className={`p-3.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer flex items-center justify-between ${
                selectedPrompt === idx
                  ? "bg-emerald-500/20 border-emerald-500/50 text-white shadow-md"
                  : "bg-slate-950/80 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span>{p.q}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedPrompt === idx ? "rotate-90 text-emerald-400" : "text-slate-600"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 text-xs sm:text-sm space-y-2 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Sparkles className="w-4 h-4" /> {language === 'en' ? "AI Generated Output:" : "Respuesta generada por la IA:"}
        </div>
        <p className="text-slate-200 leading-relaxed font-mono">
          {prompts[selectedPrompt].a}
        </p>
      </div>
    </div>
  );
}

export default function Index() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Background Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[45%] -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[75%] -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* ─── HEADER BAR ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#02050e]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-emerald-500/40 flex items-center justify-center bg-slate-950 shadow-lg shadow-emerald-500/10">
                <img src="/logo.png" alt="IfsinRem" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                ifsin<span className="text-emerald-400">rem</span>
              </span>
            </Link>



            {/* Header Right Actions: Language Selector + Login */}
            <div className="flex items-center gap-4">
              <LanguageSelector />

              <Link
                to="/auth"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-colors shadow-md"
              >
                {t('header.login')}
              </Link>
            </div>

          </div>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            
            <FadeIn>
              <ShimmerBadge className="mb-8">
                {language === 'en'
                  ? "SaaS Document Digitalization Platform & Enterprise AI"
                  : "Plataforma SaaS de Digitalización Documental & IA Empresarial"
                }
              </ShimmerBadge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
                {language === 'en'
                  ? "Digitize your company's document processes."
                  : "Digitalizá los procesos documentales de tu empresa."
                }
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal mb-10">
                {language === 'en'
                  ? "Electronic signatures, AI, QR traceability, and automation to eliminate paper and save hundreds of administrative hours."
                  : "Firmas electrónicas, IA, trazabilidad mediante QR y automatización para eliminar el papel y ahorrar cientos de horas administrativas."
                }
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex items-center justify-center gap-4 mb-16">
                <a
                  href="#agendar-demo"
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-base px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {language === 'en' ? "Schedule Demo Below" : "Agendar Demo Abajo"}
                </a>

                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-base transition-colors"
                >
                  {language === 'en' ? "See how it works" : "Ver cómo funciona"} <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </FadeIn>

          </div>
        </section>

        {/* ─── SECCIÓN: CÓMO FUNCIONA (4 MOMENTOS INTERACTIVOS CON SIMULADOR) ─── */}
        <section id="como-funciona" className="py-24 bg-slate-950/80 border-y border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {language === 'en' ? "INTERACTIVE EXPERIENCE" : "EXPERIENCIA INTERACTIVA"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-6">
                {language === 'en' ? "How does IfsinRem work?" : "¿Cómo funciona IfsinRem?"}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {language === 'en'
                  ? "Designed for field and enterprise operations. Select each moment to test live."
                  : "Diseñado para trabajo en campo y gestión empresarial. Tocá cada momento para probar en vivo."
                }
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <FourStepInteractiveSimulator />
            </FadeIn>
          </div>
        </section>

        {/* ─── SECCIÓN 1: EL PROBLEMA ──────────────────────────────────────────── */}
        <section id="problema" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-rose-400 font-bold text-xs uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {language === 'en' ? "Operational Challenge" : "El Desafío Operativo"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-6">
                {language === 'en' ? "The high cost of staying trapped in paper" : "El alto costo de seguir atrapado en el papel"}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {language === 'en'
                  ? "Paper friction exposes your company to financial losses, internal delays, and legal risks."
                  : "La ineficiencia del papel expone a tu empresa a pérdidas financieras, fricción interna y riesgos legales."
                }
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: language === 'en' ? "Lost or damaged records" : "Documentos perdidos o deteriorados",
                  desc: language === 'en'
                    ? "Printed forms get lost or damaged, making it impossible to demonstrate compliance during labor audits."
                    : "Las planillas impresas se traspapelan, estropean y destruyen la evidencia necesaria para responder ante reclamos laborales o inspecciones.",
                  icon: AlertTriangle
                },
                {
                  title: language === 'en' ? "Hundreds of wasted hours" : "Cientos de horas desperdiciadas",
                  desc: language === 'en'
                    ? "Teams waste time on repetitive manual tasks: searching physical binders, tracking down signatures."
                    : "El equipo pierde tiempo valioso en tareas repetitivas: buscar carpetas físicas, solicitar firmas presenciales y archivar folios.",
                  icon: Clock
                },
                {
                  title: language === 'en' ? "Slow and stressful audits" : "Auditorías estresantes y lentas",
                  desc: language === 'en'
                    ? "Locating forms from previous years demands days of stressful manual searching."
                    : "Localizar planillas de años anteriores demanda días de trabajo intenso y expone a sanciones por falta de trazabilidad.",
                  icon: FileText
                },
              ].map((item, idx) => (
                <FadeIn key={idx} delay={0.1 * idx}>
                  <TiltCard
                    spotlightColor="rgba(244, 63, 94, 0.2)"
                    borderColor="rgba(244, 63, 94, 0.3)"
                    className="p-8 h-full space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 2: BENEFICIOS (RESULTADOS CLAVE) ────────────────────────── */}
        <section id="beneficios" className="py-24 bg-slate-950/60 border-t border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {language === 'en' ? "Immediate Results" : "Resultados Inmediatos"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-6">
                {language === 'en' ? "Measurable benefits from day one" : "Beneficios medibles desde el primer día"}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {language === 'en'
                  ? "Designed to accelerate operations and simplify corporate governance."
                  : "Diseñado para acelerar procesos y simplificar la gestión corporativa."
                }
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: language === 'en' ? "Less admin time" : "Menos tiempo administrativo",
                  desc: language === 'en' ? "Save up to 90% of the time spent collecting and filing forms." : "Ahorrá hasta 90% del tiempo de recolección y archivo de planillas."
                },
                {
                  title: language === 'en' ? "All info centralized" : "Toda la información centralizada",
                  desc: language === 'en' ? "Access records from any screen in real time." : "Consultá constancias y legajos desde cualquier pantalla de forma inmediata."
                },
                {
                  title: language === 'en' ? "Instant e-signature" : "Firma electrónica instantánea",
                  desc: language === 'en' ? "Touch screen signature with timestamp and device metadata." : "Firma en pantalla táctil con sello de tiempo e información del dispositivo."
                },
                {
                  title: language === 'en' ? "Fast audit reports" : "Auditorías ágiles y sin sorpresas",
                  desc: language === 'en' ? "Excel and PDF reports generated in seconds." : "Reportes en Excel y PDF generados en segundos para fiscalizaciones."
                },
                {
                  title: language === 'en' ? "24/7 Cloud availability" : "Disponibilidad 24/7 en la nube",
                  desc: language === 'en' ? "Secure cloud storage with automatic backups." : "Almacenamiento seguro con respaldos automáticos e infalibilidad de datos."
                },
                {
                  title: language === 'en' ? "100% QR Traceability" : "Trazabilidad 100% digital con QR",
                  desc: language === 'en' ? "Every receipt includes a public QR code for instant audit." : "Cada comprobante cuenta con su código QR para validación pública."
                },
              ].map((ben, idx) => (
                <FadeIn key={idx} delay={0.08 * idx}>
                  <TiltCard className="p-8 h-full flex flex-col justify-between space-y-4">
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{ben.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{ben.desc}</p>
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 3: INTELIGENCIA ARTIFICIAL ──────────────────────────────── */}
        <section id="ia" className="py-24 bg-gradient-to-b from-[#030818] via-[#02050c] to-[#030818] border-y border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <FadeIn>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "Integrated Artificial Intelligence" : "Inteligencia Artificial Integrada"}
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mt-4">
                    {language === 'en' ? "AI Copilot for Document Management" : "Copilot de IA para la gestión de documentos"}
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed">
                    {language === 'en'
                      ? "IfsinRem's AI analyzes expiration dates, answers natural language queries, and prepares automatic reports."
                      : "La Inteligencia Artificial de IfsinRem analiza vencimientos, responde consultas en lenguaje natural y prepara informes automáticos para la toma de decisiones."
                    }
                  </p>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        title: language === 'en' ? "Smart Search" : "Búsqueda Inteligente",
                        desc: language === 'en' ? "Query records, dates, or pending signatures using natural language." : "Preguntale al sistema por legajos, fechas o firmas pendientes sin usar filtros complicados."
                      },
                      {
                        title: language === 'en' ? "Expiration Alert System" : "Alertador de Vencimientos",
                        desc: language === 'en' ? "Preventive notifications before safety certificates or deliveries expire." : "Notificaciones preventivas ante vencimiento de capacitaciones o entregas."
                      },
                      {
                        title: language === 'en' ? "Executive Summaries" : "Resúmenes Ejecutivo Automáticos",
                        desc: language === 'en' ? "Synthesized metrics ready for board or management presentations." : "Métricas sintetizadas listas para presentar a dirección o gerencia."
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>

              <div className="lg:col-span-6">
                <FadeIn delay={0.3}>
                  <InteractiveAIPlayground />
                </FadeIn>
              </div>

            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 4: MÓDULOS DEL SISTEMA ──────────────────────────────────── */}
        <section id="modulos" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {language === 'en' ? "Comprehensive Solution" : "Solución Integral"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-6">
                {language === 'en' ? "SaaS System Modules" : "Módulos del Sistema SaaS"}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {language === 'en' ? "A complete architecture to digitize every company process." : "Una arquitectura completa para digitalizar cada proceso de la empresa."}
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Boxes, title: language === 'en' ? "PPE & Equipment Delivery" : "Entrega de EPP & Equipos", desc: language === 'en' ? "Digital receipts for clothing and protection with signatures." : "Comprobantes digitales de indumentaria y protección con firma." },
                { icon: FileText, title: language === 'en' ? "Document Management" : "Gestión Documental", desc: language === 'en' ? "Centralization of files, contracts, and company records." : "Centralización de archivos, contratos y legajos empresariales." },
                { icon: FileSignature, title: language === 'en' ? "Digital Signature" : "Firma Electrónica", desc: language === 'en' ? "Touch screen or mobile signatures with legal validity." : "Firma en pantalla táctil o dispositivo móvil con validez legal." },
                { icon: QrCode, title: language === 'en' ? "QR Traceability" : "Trazabilidad por QR", desc: language === 'en' ? "Public and unalterable verification of receipts via QR." : "Validación pública e infalsificable de constancias mediante QR." },
                { icon: Sparkles, title: language === 'en' ? "Artificial Intelligence" : "Inteligencia Artificial", desc: language === 'en' ? "Assistant for queries, summaries, and executive reports." : "Asistente para búsquedas, resúmenes e informes ejecutivos." },
                { icon: TrendingUp, title: language === 'en' ? "Reports & Metrics" : "Reportes & Métricas", desc: language === 'en' ? "Excel and PDF exports for audits and inspections." : "Exportación a Excel y PDF para auditorías e inspecciones." },
                { icon: Clock, title: language === 'en' ? "Expiration Alerting" : "Alertador de Vencimientos", desc: language === 'en' ? "Preventive automatic notices for expiring items or signatures." : "Avisos preventivos automáticos ante la caducidad de insumos o firmas." },
                { icon: Users, title: language === 'en' ? "Training & Policies" : "Capacitaciones & Normativas", desc: language === 'en' ? "Digital attendance log and policy acceptance." : "Registro digital de asistencia y aceptación de normas." },
                { icon: Building2, title: language === 'en' ? "Contractor Control" : "Control de Contratistas", desc: language === 'en' ? "Unified management for vendors and external staff." : "Gestión unificada para proveedores y personal externo." },
              ].map((mod, idx) => (
                <FadeIn key={idx} delay={0.05 * idx}>
                  <TiltCard className="p-6 h-full space-y-4 hover:border-emerald-500/40 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                      <mod.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 6: HISTORIA & CONFIANZA CORPORATIVA ─────────────────────── */}
        <section className="py-24 bg-slate-950/60 border-t border-slate-800/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <FadeIn>
              <div className="bg-gradient-to-r from-slate-900 to-[#060e1e] border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-4 flex justify-center">
                    <div className="w-44 h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-4 flex items-center justify-center">
                      <img src="/logo.png" alt="IfsinRem" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                      {language === 'en' ? "Our Vision" : "Nuestra Visión"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {language === 'en' ? "Designed to give time back to companies" : "Diseñado para devolverle tiempo a las empresas"}
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {language === 'en'
                        ? "IfsinRem was born after years of observing paper overload and lost signatures in HR and Safety departments."
                        : "IfsinRem nació al observar durante años la gran acumulación de papeles y firmas perdidas en departamentos de Recursos Humanos y Seguridad."
                      }
                    </p>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                      {language === 'en'
                        ? "We built this platform to turn that inefficiency into fast, secure, and intelligent digital processes."
                        : "Construimos esta plataforma para transformar esa ineficiencia en procesos digitales rápidos, seguros e inteligentes."
                      }
                    </p>
                    <div className="pt-2">
                      <Link to="/nosotros" className="text-sm font-bold text-emerald-400 hover:underline inline-flex items-center gap-1">
                        {language === 'en' ? "Learn more about our company →" : "Conoce más sobre nuestra historia →"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── SECCIÓN 7: CTA FINAL CON EMBED DIRECTO DE CAL.COM ───────────────── */}
        <section id="agendar-demo" className="py-24 bg-gradient-to-b from-[#02050e] to-[#040918]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-[#040918] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
              <BorderBeam size={200} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {language === 'en' ? "Ready to leave paper behind?" : "¿Listo para dejar atrás el papel?"}
                </h2>
                <p className="text-slate-350 text-base sm:text-lg max-w-xl mx-auto">
                  {language === 'en'
                    ? "Schedule your commercial demo directly below without leaving the page."
                    : "Agendá tu demostración comercial directamente a continuación sin salir de la página."
                  }
                </p>
              </div>

              {/* Inline Embedded Cal.com Calendar Widget */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950/90 shadow-2xl max-w-3xl mx-auto">
                <iframe
                  src="https://cal.com/ifsinrem?embed=true"
                  title="Agendar demo en Cal.com"
                  className="w-full h-[620px] border-0 bg-slate-950"
                />
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "No obligation" : "Sin compromiso"}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {language === 'en' ? "Personalized consulting" : "Asesoramiento personalizado"}</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
