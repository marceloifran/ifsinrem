import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, Shield, Sparkles, Building2, CheckCircle2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { openCalDemo } from "@/utils/cal";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-grow pt-12 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <Building2 className="w-3.5 h-3.5" /> Sobre IfsinRem
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Transformando la gestión documental corporativa en Latinoamérica
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Nacimos con el propósito de eliminar la burocracia del papel en las empresas, permitiendo a los equipos enfocarse en lo que realmente importa mediante firma electrónica, inteligencia artificial y automatización documental.
            </p>
          </motion.div>
        </section>

        {/* Origin & Founder Story */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-24">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Fundador de IfsinRem"
                      className="w-full h-full object-cover p-6"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Nuestra Historia</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  De la observación en planta a una solución integral
                </h2>
                <p className="text-slate-350 leading-relaxed text-sm sm:text-base">
                  IfsinRem nació tras observar durante años la enorme cantidad de documentación en papel acumulada en los departamentos de Recursos Humanos, Operaciones y Seguridad en empresas industriales y de servicios.
                </p>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  Firmas extraviadas, auditorías estresantes y miles de horas desperdiciadas impulsaron la creación de una plataforma SaaS moderna. Hoy, IfsinRem permite a las organizaciones digitalizar 100% de sus comprobantes, firmas y planillas de control en segundos.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <div>
                    <h4 className="text-white font-bold text-base">Equipo IfsinRem</h4>
                    <p className="text-slate-500 text-xs">Salta, Argentina 🇦🇷</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Nuestros Pilares</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Principios que guían el desarrollo continuo de nuestra plataforma empresarial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resultados sobre Procesos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diseñamos software para resolver problemas concretos: reducir 90% del tiempo administrativo y garantizar disponibilidad total de la información.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Validez & Respaldo Legal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Todas las firmas electrónicas capturadas por nuestra tecnología cumplen con los estándares de trazabilidad y evidencia digital.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Inteligencia sin Fricción</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                La Inteligencia Artificial está integrada de manera natural para buscar documentos, alertar vencimientos y asistir a los administradores.
              </p>
            </div>
          </div>
        </section>

        {/* Corporate CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Quieres conocer más sobre cómo trabajamos?
            </h2>
            <p className="text-slate-350 text-sm sm:text-base max-w-xl mx-auto">
              Agendá una sesión personalizada de 15 minutos con nuestro equipo para evaluar cómo IfsinRem se adapta a tu empresa.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/#agendar-demo"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Ir al Calendario en la Landing
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
