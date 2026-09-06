import { motion } from "framer-motion";
import { ArrowLeft, Target, Shield, Sparkles, Building2, ExternalLink, Award, MapPin, Quote, Newspaper, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";
import { TiltCard } from "@/components/ui/amicro/TiltCard";

export default function AboutUs() {
  const navigate = useNavigate();
  const iproupUrl = "https://www.iproup.com/startups/71259-startup-saltena-digitaliza-entregas-de-elementos-de-seguridad-y-se-expande-por-el-mundo";

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header />

      <main className="flex-grow pt-10 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 text-sm pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <Building2 className="w-3.5 h-3.5" /> Sobre IfsinRem
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-tight mb-6">
              Reemplazando el papel en la seguridad industrial con tecnología de clase mundial
            </h1>
            <p className="text-lg text-slate-350 leading-relaxed max-w-2xl mx-auto">
              Nacimos en Salta con un propósito claro: erradicar la burocracia documental y el riesgo legal en las empresas a través de firmas táctiles inalterables, sello criptográfico e inteligencia artificial.
            </p>
          </motion.div>
        </section>

        {/* Origin & Founder Story */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-20">
          <div className="bg-gradient-to-br from-[#060b18] via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <BorderBeam size={220} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 blur-sm opacity-60 group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl">
                    <img
                      src="/images/marcelo-ifran-iproup.webp"
                      alt="Marcelo Ifrán Singh - Fundador de IfsinRem"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                </div>
                <div className="text-center mt-4 space-y-0.5">
                  <h4 className="text-white font-bold text-base">Marcelo Ifrán Singh</h4>
                  <p className="text-emerald-400 text-xs font-mono">Fundador & Desarrollador Principal</p>
                  <p className="text-slate-400 text-xs font-mono flex items-center justify-center gap-1 pt-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> General Güemes, Salta 🇦🇷
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <span className="text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                  Nuestra Historia
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                  De la observación cotidiana en el hogar a un SaaS industrial
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  La idea de IfsinRem surgió en General Güemes, Salta, a partir de una situación cotidiana y real. Marcelo veía a su madre llegar exhausta de trabajar con carpetas repletas de fotocopias, planillas de entrega de EPP y pilas de comprobantes para cumplir con la normativa SRT 299/11.
                </p>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  El problema implicaba horas interminables persiguiendo firmas manuscritas de los operarios, archivando biblioratos y enfrentando el estrés permanente de buscar registros en caso de una auditoría laboral o un peritaje judicial.
                </p>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  Decidió transformar esa problemática en un producto tecnológico de alta precisión. Tras sus primeras implementaciones exitosas en empresas del Parque Industrial de General Güemes, IfsinRem escaló a más de 400 operarios activos y hoy lidera la digitalización para minería, obras de construcción pesada e industrias en todo el país.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Media & Press Feature Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-24">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-[#070d1e] to-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/logos/logo-iproup.png"
                  alt="iProUP"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-bold text-white">
                  "Startup salteña digitaliza entregas de elementos de seguridad y se expande por el mundo"
                </h3>
                <p className="text-xs text-slate-400">Publicado en Startups & Innovación de iProUP</p>
              </div>
            </div>

            <a
              href={iproupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0 hover:scale-105"
            >
              <span>Leer nota en iProUP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-4">Nuestros Pilares</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Principios tecnológicos y operativos que guían cada línea de código de IfsinRem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Operatividad en Terreno</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diseñamos software para soportar condiciones reales de obra: carga por voz en segundos, sincronización en campo y cero tiempos muertos en la entrega de EPP.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Blindaje Criptográfico</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cada comprobante se sella con Hash SHA-256 inmutable, geolocalización GPS, IP y validación QR abierta para inspectores de SRT y peritos de ART.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Innovación & IA Práctica</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Inteligencia artificial orientada a reducir pasos: interpretación automática de dictado por voz, alertas predictivas de vencimiento y búsqueda documental instantánea.
              </p>
            </div>
          </div>
        </section>

        {/* Corporate CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              ¿Querés conocer cómo adaptar IfsinRem a tu empresa?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Agendá una sesión personalizada de 15 minutos con nuestro equipo técnico para evaluar tu flujo de entrega de EPP.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/#agendar-demo"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black px-8 py-4 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
              >
                <Calendar className="w-4 h-4" /> Agendar Asesoría en la Landing
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
