import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock, KeyRound, Server, FileCheck, CheckCircle2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { openCalDemo } from "@/utils/cal";

export default function Security() {
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
              <ShieldCheck className="w-3.5 h-3.5" /> Seguridad & Cumplimiento
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Seguridad de grado empresarial para tus documentos
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Protegemos la integridad, autenticidad y privacidad de la documentación corporativa con los más altos estándares de cifrado y cumplimiento legal.
            </p>
          </motion.div>
        </section>

        {/* Pillars Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Encriptación de Punto a Punto</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Todos los datos transmitidos entre tus dispositivos y nuestros servidores están cifrados mediante HTTPS/TLS 1.3. Los documentos almacenados en repositorios están protegidos mediante cifrado AES-256 en reposo.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Validez Legal & Firma Electrónica</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Las firmas recolectadas generan un comprobante con sello de tiempo (timestamp), trazabilidad IP, dispositivo y verificación mediante código QR infalsificable con código de validación único.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Infraestructura Nube de Alta Disponibilidad</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Alojado sobre la infraestructura segura de Supabase y centros de datos certificados ISO 27001 con respaldos automáticos diarios e insolubilidad frente a pérdidas físicas de papel.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Control de Acceso Basado en Roles (RBAC)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Asignación de permisos finos por rol (Dueño, Administrador, Supervisor, Operario). Garantizá que cada miembro del equipo acceda únicamente a la información pertinente a su función.
              </p>
            </div>
          </div>
        </section>

        {/* Security Checklist */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mb-20 bg-slate-900/30 border border-slate-800 rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Protocolos de Cumplimiento Incorporados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Cifrado en tránsito (TLS 1.3) y en reposo (AES-256)",
              "Trazabilidad de auditoría inmutable en cada documento",
              "Respaldos automáticos continuos en la nube",
              "Aislamiento estricto multitenant por empresa",
              "Verificación instantánea por QR de comprobantes",
              "Conformidad con regulaciones de protección de datos personales"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Security CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">¿Tenés dudas sobre seguridad o requisitos técnicos?</h2>
            <p className="text-slate-400 text-sm">Agendá una llamada con nuestro equipo técnico para resolver inquietudes antes de iniciar.</p>
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
