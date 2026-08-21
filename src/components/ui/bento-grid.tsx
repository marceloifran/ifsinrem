import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href?: string;
  cta?: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      className,
    )}
  >
    <div className="absolute inset-0 z-0">{background}</div>

    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 group-hover:-translate-y-1">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-heading font-bold text-white tracking-tight">
        {name}
      </h3>
      <p className="max-w-lg text-xs font-sans text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>

    {href && cta && (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-20",
        )}
      >
        <Button
          variant="ghost"
          asChild
          className="pointer-events-auto text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-0 h-auto font-semibold flex items-center gap-1"
        >
          <a href={href}>
            {cta}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    )}

    {/* Soft overlay gradient on hover */}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-emerald-500/[0.02]" />
  </div>
);

export { BentoCard, BentoGrid };
