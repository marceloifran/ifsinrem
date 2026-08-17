"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollBurnTextProps {
  /**
   * The blocks, read in order. Each one comes up out of the dark, passes the
   * lens and burns off, uncovering the next one standing behind it.
   */
  sections: string[];
  /** Line shown on the opening frame, before the first block is close enough to read. Fades out on the first flick of scroll. */
  hint?: React.ReactNode;
  /** Scroll distance each block gets. Taller is slower. Default `"160vh"`. */
  runway?: string;
  /** Scrollable ancestor to track instead of the page — pass this when pinning inside a bounded panel. */
  container?: React.RefObject<HTMLElement | null>;
  className?: string;
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='gamma' exponent='4'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

const BURN_AT = 0.62;
const BURN_SPAN = 0.38;
const LEAD = 0.7;
const DIM = 0.3;
const OPEN = 0.22;
const FAR = 4;
const NEAR = 0.25;
const RAMP = 0.09;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  return reduce;
}

export function ScrollBurnText({
  sections,
  hint = "DESPLAZATE HACIA ABAJO PARA CONTINUAR",
  runway = "150vh",
  container,
  className,
}: ScrollBurnTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const runwayRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const hintRef = React.useRef<HTMLDivElement>(null);
  const blockRefs = React.useRef<(HTMLParagraphElement | null)[]>([]);

  const count = sections.length;
  const total = React.useRef(count);
  total.current = count;

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const el = runwayRef.current;
    if (!el) return;
    const containerEl = container?.current ?? null;
    const win = el.ownerDocument.defaultView ?? window;
    const scroller: HTMLElement | Window = containerEl ?? win;

    const measure = () => {
      blockRefs.current.forEach((block) => {
        if (!block) return;
        const w = block.offsetWidth || 1;
        const h = block.offsetHeight || 1;
        (Array.from(block.children) as HTMLElement[]).forEach((node) => {
          const x = (node.offsetLeft + node.offsetWidth / 2) / w;
          const y = (node.offsetTop + node.offsetHeight / 2) / h;
          const blob =
            0.5 +
            0.28 * Math.sin(x * 11.3 + y * 6.1 + 1.7) +
            0.22 * Math.sin(x * 5.7 - y * 13.9 + 4.2);
          const middle = Math.hypot(x - 0.5, (y - 0.5) * 1.15) / 0.62;
          node.style.setProperty(
            "--t",
            `${clamp01(0.05 + 0.55 * middle + 0.45 * blob)}`,
          );
        });
      });
    };

    const burnt: number[] = [];
    let active = -1;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const viewport = containerEl ? containerEl.clientHeight : win.innerHeight;
      const top = containerEl
        ? rect.top - containerEl.getBoundingClientRect().top
        : rect.top;
      const p = clamp01(-top / (rect.height - viewport || 1));

      const count = total.current;
      const t = -LEAD + p * (count - 1 + LEAD + BURN_AT);
      let front = 0;

      blockRefs.current.forEach((block, i) => {
        const wrap = block?.parentElement;
        if (!block || !wrap) return;
        const q = t - i;
        if (q > 1) front = Math.min(i + 1, count - 1);

        const alpha =
          clamp01((q + LEAD + OPEN) / 0.45) *
          (DIM + (1 - DIM) * clamp01(q / 0.45));

        if (alpha <= 0 || q > 1) {
          wrap.style.visibility = "hidden";
          return;
        }
        wrap.style.visibility = "visible";
        wrap.style.opacity = `${alpha}`;

        const depth = Math.max(
          FAR - ((FAR - NEAR) * (q + LEAD)) / (1 + LEAD),
          NEAR,
        );
        wrap.style.transform = `scale(${1 / depth})`;

        const burn = clamp01((q - BURN_AT) / BURN_SPAN) * (1 + RAMP);
        if (burnt[i] !== burn) {
          burnt[i] = burn;
          block.style.setProperty("--b", `${burn}`);
          block.style.setProperty("--ab", `${0.35 + burn * 2.8}`);
        }
      });

      if (hintRef.current) {
        hintRef.current.style.opacity = `${clamp01(1 - p / 0.08)}`;
      }
      if (active !== front) {
        active = front;
        if (counterRef.current) {
          counterRef.current.textContent = `${String(front + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = win.requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onResize);
    const ro = containerEl ? new ResizeObserver(onResize) : null;
    if (containerEl && ro) ro.observe(containerEl);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (raf) win.cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion, container]);

  const column =
    "relative w-[min(88vw,46rem)] text-center text-[clamp(1.2rem,4.5vw,2.35rem)] font-heading font-black leading-[1.2] tracking-tight text-white";

  if (prefersReducedMotion) {
    return (
      <div className={cn("w-full bg-[#02050e] px-6 py-20", className)}>
        <div className="mx-auto grid max-w-3xl gap-10">
          {sections.map((body, i) => (
            <p key={i} className={cn(column, "w-full text-left")}>
              {body}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-[#02050e]", className)}>
      <div
        ref={runwayRef}
        style={{ height: `calc(${runway} * ${count})` }}
        className="w-full relative"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#02050e] flex items-center justify-center">
          
          {/* Top subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Counter Badge */}
          <div
            ref={counterRef}
            className="pointer-events-none absolute bottom-8 left-8 z-20 text-[0.75rem] font-mono font-bold uppercase tracking-[0.25em] tabular-nums text-emerald-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-lg backdrop-blur-md"
          />

          {/* Hint Arrow/Text */}
          {hint ? (
            <div
              ref={hintRef}
              className="pointer-events-none absolute inset-x-0 bottom-16 z-20 text-center"
            >
              <span className="relative text-[0.7rem] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400/80 after:absolute after:left-1/2 after:top-full after:mt-2.5 after:h-7 after:w-px after:bg-gradient-to-b after:from-emerald-400 after:to-transparent after:content-['']">
                {hint}
              </span>
            </div>
          ) : null}

          {/* Section text blocks */}
          {sections.map((body, i) => (
            <div
              key={i}
              style={{ visibility: "hidden" }}
              className="absolute inset-0 grid place-items-center px-4 will-change-transform"
              aria-hidden
            >
              <p
                ref={(node) => {
                  blockRefs.current[i] = node;
                }}
                className={column}
                style={
                  {
                    "--b": 0,
                    "--ab": 0.35,
                    textShadow:
                      "calc(var(--ab) * -1.5px) 0 rgb(16 185 129 / 0.9), calc(var(--ab) * 1.5px) 0 rgb(6 182 212 / 0.9)",
                  } as React.CSSProperties
                }
              >
                {Array.from(body).map((ch, k) =>
                  ch === " " ? (
                    " "
                  ) : (
                    <span
                      key={k}
                      className="opacity-[calc((var(--t,1)_+_0.09_-_var(--b,0))*11)]"
                    >
                      {ch}
                    </span>
                  ),
                )}
              </p>
            </div>
          ))}

          {/* Film grain overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35 mix-blend-overlay z-10"
            style={{ backgroundImage: GRAIN, backgroundSize: "180px" }}
          />

          <p className="sr-only">{sections.join(" ")}</p>
        </div>
      </div>
    </div>
  );
}

export default ScrollBurnText;
