import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Send, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { openCalDemo } from "@/utils/cal";

export default function Contact() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto a la brevedad.");
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    }, 1000);
  };

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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <Mail className="w-3.5 h-3.5" /> Contacto Comercial
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Hablemos sobre la digitalización de tu empresa
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              Nuestro equipo comercial y técnico está disponible para responder todas tus inquietudes o coordinar una demostración en vivo.
            </p>
          </motion.div>
        </section>

        {/* Contact Form & Direct Info */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Col: Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-white">¿Preferís agendar directo?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Podés elegir el día y hora que mejor te quede para reunirnos por videollamada mediante nuestra agenda en Cal.com.
                </p>
                <a
                  href="/#agendar-demo"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl text-sm shadow-md transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Ir al Calendario Embebido en la Landing
                </a>
              </div>

              <div className="space-y-6 px-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Email Comercial</h4>
                    <p className="text-slate-400 text-sm">contacto@ifsinrem.site</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Soporte Técnico</h4>
                    <p className="text-slate-400 text-sm">soporte@ifsinrem.site</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ubicación</h4>
                    <p className="text-slate-400 text-sm">Salta, Argentina 🇦🇷</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-5">
                <h3 className="text-xl font-bold text-white mb-2">Envianos un mensaje</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Nombre completo *</label>
                    <Input
                      required
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Email corporativo *</label>
                    <Input
                      required
                      type="email"
                      placeholder="juan@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Empresa</label>
                    <Input
                      placeholder="Nombre de tu empresa"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Teléfono / WhatsApp</label>
                    <Input
                      placeholder="+54 9 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">¿En qué podemos ayudarte? *</label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Contanos sobre las necesidades de tu empresa..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-6 rounded-xl cursor-pointer"
                >
                  {submitting ? "Enviando..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
