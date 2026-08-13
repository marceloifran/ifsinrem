import { Linkedin, Mail, Calendar, Instagram, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#02050b] border-t border-slate-800/80 text-slate-400 font-sans">
      <div className="container mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">

          {/* Brand & Corporate Description */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden shadow-md border border-emerald-500/30 flex items-center justify-center bg-slate-950/80">
                <img src="/logo.png" alt="IfsinRem Logo" className="h-full w-full object-cover rounded-xl" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                ifsin<span className="text-emerald-400">rem</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed font-normal max-w-sm">
              Plataforma SaaS para digitalizar procesos documentales empresariales mediante Inteligencia Artificial, firma electrónica, códigos QR y automatización.
            </p>

            <div className="pt-2 flex items-center gap-3">
              {[
                { icon: Instagram, href: 'https://www.instagram.com/ifsinrem/', label: 'Instagram' },
                { icon: Linkedin, href: 'https://www.linkedin.com/company/ifsint/', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:contacto@ifsinrem.site', label: 'Email' },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  <s.icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              Plataforma
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#como-funciona" className="hover:text-emerald-400 transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="/#modulos" className="hover:text-emerald-400 transition-colors">
                  Módulos SaaS
                </a>
              </li>
              <li>
                <a href="/#ia" className="hover:text-emerald-400 transition-colors">
                  Inteligencia Artificial
                </a>
              </li>
              <li>
                <a href="/#beneficios" className="hover:text-emerald-400 transition-colors">
                  Beneficios empresariales
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              Empresa & Seguridad
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/nosotros" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/seguridad" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Seguridad & Cumplimiento
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-emerald-400 transition-colors">
                  Contacto Comercial
                </Link>
              </li>
              <li>
                <Link to="/recursos" className="hover:text-emerald-400 transition-colors">
                  Recursos & Casos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Access Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              Acceso a la Plataforma
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresá con tus credenciales corporativas o agendá directamente en el calendario embebido de la landing page.
            </p>
            <div className="space-y-2 pt-1">
              <Link
                to="/auth"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/10"
              >
                Ingresar a la Plataforma →
              </Link>
              
              <a
                href="/#agendar-demo"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Ir al Calendario Embebido
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} IfsinRem Technologies. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/seguridad" className="hover:text-slate-400 transition-colors">Privacidad & Seguridad</Link>
            <Link to="/contacto" className="hover:text-slate-400 transition-colors">Contacto</Link>
            <span>Salta, Argentina 🇦🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
