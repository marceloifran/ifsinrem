import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = "",
  size = 150,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = "#10b981", // emerald-500
  colorTo = "#14b8a6", // teal-500
  delay = 0,
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        "--size": `${size}px`,
        "--duration": `${duration}s`,
        "--anchor": "90deg",
        "--border-width": `${borderWidth}px`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `-${delay}s`,
      } as React.CSSProperties}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] animate-border-beam rounded-full bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent"
        style={{
          offsetPath: "rect(0 auto auto 0 round var(--border-width))",
          animationDelay: "var(--delay)",
        }}
      />
    </div>
  );
};

export default BorderBeam;
