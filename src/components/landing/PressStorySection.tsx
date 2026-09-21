import React from "react";
import { ExternalLink, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BorderBeam } from "@/components/ui/amicro/BorderBeam";

export const PressStorySection: React.FC = () => {
  const { language } = useLanguage();

  const iproupUrl = "https://www.iproup.com/startups/71259-startup-saltena-digitaliza-entregas-de-elementos-de-seguridad-y-se-expande-por-el-mundo";

  return (
    <section id="prensa-historia" className="py-16 bg-[#02050e] border-b border-slate-800/80 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Sleek, minimal press spotlight card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#070d1e] via-[#040816] to-[#070d1e] border border-slate-800/90 p-6 sm:p-10 shadow-2xl overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <BorderBeam size={180} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left: iProUP Logo & Founder Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0 text-center sm:text-left">
              
              {/* Photo Avatar */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl shrink-0">
                <img
                  src="/images/marcelo-ifran-iproup.webp"
                  alt="Marcelo Ifrán Singh"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              </div>

              {/* Media Brand & Category */}
              <div className="space-y-1.5 flex flex-col items-center sm:items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-200">
                  <img
                    src="/logos/logo-iproup.png"
                    alt="iProUP"
                    className="h-6 sm:h-7 w-auto object-contain"
                  />
                </div>
                
                <div className="text-xs font-mono text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'en' ? "Press Feature" : "Entrevista Destacada"}</span>
                </div>
              </div>

            </div>

            {/* Right: Headline & CTA Button */}
            <div className="space-y-4 text-center md:text-left flex-grow">
              <h3 className="text-lg sm:text-xl font-display font-bold text-white leading-snug">
                {language === 'en'
                  ? '"Startup digitizes PPE delivery compliance and expands across industries"'
                  : '"Startup salteña digitaliza la entrega de equipos de seguridad y se expande por el mundo"'
                }
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                {language === 'en'
                  ? "iProUP interviewed founder Marcelo Ifrán Singh about eliminating paper binders and automating official SRT 299/11 records."
                  : "iProUP entrevistó al fundador Marcelo Ifrán Singh sobre cómo IfsinRem elimina las carpetas de papel y digitaliza las actas oficiales de la SRT."
                }
              </p>

              <div>
                <a
                  href={iproupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-105"
                >
                  <span>{language === 'en' ? "Read article on iProUP" : "Leer nota en iProUP"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PressStorySection;
