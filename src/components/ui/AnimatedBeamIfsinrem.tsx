import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileSignature,
  HardHat,
  ShieldCheck,
  Sparkles,
  Bell,
  Lock,
  FileCheck,
  QrCode,
  Award,
  Zap,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; label?: string; sublabel?: string }
>(({ className, children, label, sublabel }, ref) => {
  return (
    <div className="flex items-center gap-3 group">
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20",
          className
        )}
      >
        {children}
      </div>
      {label && (
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-heading font-bold text-white group-hover:text-emerald-400 transition-colors">
            {label}
          </span>
          {sublabel && (
            <span className="text-[10px] font-mono text-slate-400">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamIfsinrem({
  className,
}: {
  className?: string;
}) {
  const { language } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-[#02050e] border-y border-slate-800/80 relative overflow-hidden">
      
      {/* Background Mesh Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12),transparent_70%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center relative z-10 space-y-12">
        
        {/* Header Title & Subtitle */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
            <Zap className="w-4 h-4 text-emerald-400" />
            {language === 'en' ? "DATA PIPELINE ARCHITECTURE" : "ARQUITECTURA DE FLUJO Y TRAZABILIDAD"}
          </span>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
            {language === 'en' ? (
              <>
                Integrated Operational Flow{" "}
                <span className="font-serif italic font-normal text-emerald-400">in Real Time</span>
              </>
            ) : (
              <>
                Flujo Operativo Integrado{" "}
                <span className="font-serif italic font-normal text-emerald-400">en Tiempo Real</span>
              </>
            )}
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg leading-relaxed">
            {language === 'en'
              ? "Multiple field data inputs flow through IfsinRem's cryptographic engine to issue instant legally compliant receipts and public QR audit portals."
              : "Múltiples fuentes de campo convergen en la bóveda criptográfica de IfsinRem para la emisión de constancias SRT 299/11 y validación QR instantánea."
            }
          </p>
        </div>

        {/* Animated Beam Stage Box */}
        <div className="relative rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
          <BorderBeam size={220} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

          <div
            className={cn(
              "relative flex h-[480px] w-full items-center justify-center overflow-hidden p-2 sm:p-6",
              className
            )}
            ref={containerRef}
          >
            <div className="flex size-full max-w-4xl flex-row items-stretch justify-between gap-6 sm:gap-12 z-10">
              
              {/* Left Column: 5 System Data Inputs */}
              <div className="flex flex-col justify-center gap-5">
                <Circle
                  ref={div1Ref}
                  label={language === 'en' ? "Touch E-Signature" : "Firma Táctil Operario"}
                  sublabel="Legajo & Georeferencia"
                  className="border-emerald-500/30 text-emerald-400"
                >
                  <FileSignature className="size-5" />
                </Circle>

                <Circle
                  ref={div2Ref}
                  label={language === 'en' ? "PPE & Stock Catalog" : "Entrega EPP & Stock"}
                  sublabel="Cascos, Calzado, IRAM"
                  className="border-teal-500/30 text-teal-400"
                >
                  <HardHat className="size-5" />
                </Circle>

                <Circle
                  ref={div3Ref}
                  label={language === 'en' ? "GPS & Device IP Seal" : "GPS & IP Dispositivo"}
                  sublabel="Auditoría Inalterable"
                  className="border-cyan-500/30 text-cyan-400"
                >
                  <ShieldCheck className="size-5" />
                </Circle>

                <Circle
                  ref={div4Ref}
                  label={language === 'en' ? "AI Legal Assistant" : "Asistente IA Normativo"}
                  sublabel="Leyes SRT & Consultas"
                  className="border-purple-500/30 text-purple-400"
                >
                  <Sparkles className="size-5" />
                </Circle>

                <Circle
                  ref={div5Ref}
                  label={language === 'en' ? "Due Date Notifications" : "Alertas & Notificaciones"}
                  sublabel="WhatsApp / Resend Email"
                  className="border-amber-500/30 text-amber-400"
                >
                  <Bell className="size-5" />
                </Circle>
              </div>

              {/* Center Column: IfsinRem Cryptographic Core Hub */}
              <div className="flex flex-col justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                  <Circle
                    ref={div6Ref}
                    className="size-20 border-2 border-emerald-400 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-emerald-400 shadow-2xl shadow-emerald-500/30"
                  >
                    <Lock className="size-9 animate-pulse" />
                  </Circle>
                  <div className="text-center pt-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 block uppercase tracking-wider">
                      IFSINREM
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Hash SHA-256 & RLS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Output Destination */}
              <div className="flex flex-col justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                  <Circle
                    ref={div7Ref}
                    className="size-16 border-emerald-500/50 bg-slate-900 text-emerald-400 shadow-xl"
                  >
                    <FileCheck className="size-7" />
                  </Circle>
                  <div className="text-center pt-2">
                    <span className="text-xs font-heading font-bold text-white block">
                      {language === 'en' ? "Form 299/11 PDF & QR Portal" : "Constancia SRT 299/11 & QR"}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
                      ✓ Inspección Pública
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Animated Beams from 5 inputs -> Central Hub */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div1Ref}
              toRef={div6Ref}
              gradientStartColor="#10b981"
              gradientStopColor="#14b8a6"
              duration={3}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div2Ref}
              toRef={div6Ref}
              gradientStartColor="#14b8a6"
              gradientStopColor="#06b6d4"
              duration={3.4}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div3Ref}
              toRef={div6Ref}
              gradientStartColor="#06b6d4"
              gradientStopColor="#10b981"
              duration={2.8}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div4Ref}
              toRef={div6Ref}
              gradientStartColor="#a855f7"
              gradientStopColor="#10b981"
              duration={3.6}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div5Ref}
              toRef={div6Ref}
              gradientStartColor="#f59e0b"
              gradientStopColor="#10b981"
              duration={3.2}
            />

            {/* Animated Beam from Central Hub -> Final Output */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={div6Ref}
              toRef={div7Ref}
              gradientStartColor="#10b981"
              gradientStopColor="#06b6d4"
              duration={2.5}
            />
          </div>

          {/* Bottom Summary Bar */}
          <div className="bg-slate-900/80 p-3.5 border-t border-slate-800 rounded-b-2xl flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 px-6 gap-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Flujo de datos cifrado de extremo a extremo sin latencia</span>
            </span>
            <span className="text-emerald-400 font-bold">
              ✓ Resolución SRT N° 299/11 Homologada
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}

export default AnimatedBeamIfsinrem;
