import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, FileText, Sparkles, ArrowRight, Shield, CheckCircle2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { openCalDemo } from "@/utils/cal";

const articles = [
  {
    category: "Guía Práctica",
    title: "Cómo eliminar 100% el papel en la gestión de comprobantes de entrega",
    description: "Paso a paso para migrar planillas físicas a constancias digitales con firma en pantalla y validación QR infalsificable.",
    readTime: "5 min de lectura",
  },
  {
    category: "Casos de Uso",
    title: "Auditorías de trabajo sin estrés: Trazabilidad documental en tiempo real",
    description: "Descubrí cómo las inspecciones y auditorías externas pasan de durar días a resolverse en minutos mediante reportes digitales exportables.",
    readTime: "7 min de lectura",
  },
  {
    category: "Inteligencia Artificial",
    title: "IA aplicada a la gestión de vencimientos y normativas empresariales",
    description: "Cómo la Inteligencia Artificial de IfsinRem analiza vencimientos de capacitaciones, entregas de EPP y vigencia documental para prevenir multas.",
    readTime: "4 min de lectura",
  },
];

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <BookOpen className="w-3.5 h-3.5" /> Recursos & Artículos
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Conocimiento y guías para digitalizar tu empresa
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Artículos, metodologías y mejores prácticas sobre transformación digital documental, firmas electrónicas e IA aplicada a procesos.
            </p>
          </motion.div>
        </section>

        {/* Articles List */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      {art.category}
                    </span>
                    <span className="text-slate-500">{art.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {art.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Leer artículo completo <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Callout */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">¿Querés asesoramiento para tu caso específico?</h2>
            <p className="text-slate-350 text-sm">Agendá una breve sesión comercial para ver la plataforma en funcionamiento.</p>
            <a
              href="/#agendar-demo"
              className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-md"
            >
              <Calendar className="w-4 h-4 mr-2" /> Ir al Calendario Embebido
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
