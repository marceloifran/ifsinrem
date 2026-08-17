import { Linkedin, Mail, Instagram, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-slate-400 font-sans border-t border-slate-900 py-16">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          {/* Left Column: Brand, Description, Contact Details */}
          <div className="space-y-6 max-w-md">
            
            {/* Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md border border-emerald-500/30 flex items-center justify-center bg-slate-950">
                <img src="/logo.png" alt="IfsinRem Logo" className="h-full w-full object-cover rounded-xl" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                ifsin<span className="text-emerald-400">rem</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Reimaginando la gestión de personal, control de entregas de EPP y cumplimiento legal en la era digital.
            </p>

            {/* Contact Details List (Email, Phone, Location with Icons) */}
            <div className="space-y-3 pt-2 text-sm">
              <div>
                <a
                  href="mailto:contacto@ifsinrem.site"
                  className="font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  contacto@ifsinrem.site
                </a>
              </div>

              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <a href="tel:+5493874681205" className="hover:text-emerald-400 transition-colors">
                  +54 9 387 468-1205
                </a>
              </div>

              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span>Salta, Argentina</span>
              </div>
            </div>

          </div>

          {/* Right Column: Social Icons Aligned Top Right */}
          <div className="flex items-center gap-5 pt-2 md:pt-0">
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
                whileHover={{ scale: 1.15, y: -2 }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <s.icon size={20} />
              </motion.a>
            ))}
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-900 mt-14 pt-8 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {year} IfsinRem Technologies. Todos los derechos reservados.</p>
          <Link to="/seguridad" className="hover:text-slate-400 transition-colors">Privacidad & Seguridad</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
