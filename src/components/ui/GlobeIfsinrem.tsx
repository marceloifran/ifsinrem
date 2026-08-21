import React from "react";
import { Globe } from "@/components/ui/globe";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, Globe as GlobeIcon, Sparkles } from "lucide-react";

export function GlobeIfsinrem() {
  const { language } = useLanguage();

  return (
    <section className="relative w-full py-20 overflow-hidden bg-[#02050e] border-y border-slate-800/80">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.18),transparent_70%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center relative z-10">
        
        {/* Badge & Logo Header */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <GlobeIcon className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>{language === 'en' ? "GLOBAL LEGAL COMPLIANCE" : "COBERTURA GLOBAL Y TRAZABILIDAD"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex items-center justify-center bg-slate-950 shadow-xl shadow-emerald-500/20">
              <img src="/logo.png" alt="IfsinRem" className="h-full w-full object-cover" />
            </div>
            <span className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              ifsin<span className="text-emerald-400">rem</span>
            </span>
          </div>
        </div>

        {/* Resumen / Frase Principal en Grande estilo Magic UI */}
        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400/70 tracking-tight leading-[1.15]">
            {language === 'en' ? (
              <>
                Document Digitalization &{" "}
                <span className="text-emerald-400 font-serif italic font-normal">Immutable Legal Traceability</span>{" "}
                Without Borders.
              </>
            ) : (
              <>
                Digitalización Documental y{" "}
                <span className="text-emerald-400 font-serif italic font-normal">Trazabilidad Criptográfica</span>{" "}
                sin Fronteras.
              </>
            )}
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {language === 'en'
              ? "Connecting field operations, touch e-signatures, SRT Res. 299/11 compliance, and instant public QR audit inspection worldwide."
              : "Conectando operaciones de terreno, firmas en pantalla, homologación SRT Res. 299/11 y verificación pública por QR en tiempo real."
            }
          </p>
        </div>

        {/* Globe Canvas Container */}
        <div className="relative w-full max-w-2xl mx-auto h-[380px] sm:h-[450px] flex items-center justify-center overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-950/60 shadow-2xl backdrop-blur-md">
          
          {/* Big Floating Watermark Text */}
          <span className="pointer-events-none select-none absolute top-8 font-display font-black text-7xl sm:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-400/20 via-slate-800/10 to-transparent uppercase opacity-60">
            IFSINREM
          </span>

          {/* Interactive 3D WebGL Globe Component */}
          <Globe className="top-16 sm:top-12 scale-110 sm:scale-125" />

          {/* Bottom Gradient Fade */}
          <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_180%,rgba(16,185,129,0.25),transparent_70%)]" />

          {/* Overlay Status Bar */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 backdrop-blur-md">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-semibold">Nodos Activos: Argentina, Chile, Perú & Global</span>
            </span>
            <span className="text-emerald-400 font-bold hidden sm:inline">✓ SHA-256 Verified</span>
          </div>

        </div>

      </div>
    </section>
  );
}

export default GlobeIfsinrem;
