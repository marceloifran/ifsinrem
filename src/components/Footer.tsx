import { Linkedin, Mail, Calendar, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { openCalendly } from '@/utils/calendly';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#04060a] border-t border-slate-900 text-slate-400">
      {/* main footer content */}
      <div className="container mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md border border-emerald-500/30 flex items-center justify-center bg-slate-950/80">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-xl" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">ifsin<span className="text-emerald-400">rem</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs font-medium">
              {t('footer.description')}
            </p>
          </div>

          {/* links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              {language === 'en' ? 'Navigation' : 'Navegación'}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('footer.home'), href: '#' },
                { label: language === 'en' ? 'How it works' : 'Cómo funciona', href: '#como-funciona' },
                { label: t('header.scheduleDemo'), href: 'https://calendly.com/ifsinrem', external: true, onClick: openCalendly },
              ].map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={l.onClick}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              {t('footer.contact')}
            </h3>
            <div className="flex gap-3">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/ifsint/', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:contacto@ifsinrem.site', label: 'Email' },
                { icon: Calendar, href: 'https://calendly.com/ifsinrem', label: 'Demo', onClick: openCalendly },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={s.onClick}
                  aria-label={s.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-all shadow-sm cursor-pointer"
                >
                  <s.icon size={16} />
                </motion.a>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 font-medium">soporte@ifsinrem.site</p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            © {year} ifsinrem by{' '}
            <a
              href="https://www.linkedin.com/company/ifsint/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ifsinrem
            </a>
            . {t('footer.copyright')}
          </p>
          <p className="text-xs text-slate-600 font-medium">{language === 'en' ? 'Made in Salta, Argentina 🇦🇷' : 'Hecho en Salta, Argentina 🇦🇷'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
