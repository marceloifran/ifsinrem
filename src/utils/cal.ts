/**
 * Cal.com integration utility for scheduling product demos inline without redirecting away.
 */

export const openCalDemo = (e?: React.MouseEvent | Event) => {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  // Inject Cal script dynamically if not present
  if (typeof window !== 'undefined' && !(window as any).Cal) {
    (function (C: any, A: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () { let cal = C.Cal; let args = arguments; if (!cal.q) { cal.q = []; } p(cal, args); };
      let s = d.createElement("script");
      s.async = true;
      s.src = A;
      d.head.appendChild(s);
    })(window, "https://app.cal.com/embed/embed.js");
  }

  const windowCal = (window as any).Cal;
  if (typeof windowCal === 'function') {
    try {
      windowCal("init", { origin: "https://cal.com" });
      windowCal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#10b981" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      windowCal("modal", {
        calLink: "ifsinrem",
      });
      return;
    } catch (err) {
      console.warn("Cal.com popup modal error, falling back to direct window open", err);
    }
  }

  // Fallback: direct popup / tab open
  window.open('https://cal.com/ifsinrem', '_blank', 'noopener,noreferrer');
};
