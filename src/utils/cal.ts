/**
 * Cal.com integration utility for scheduling product demos inline without redirecting away.
 */

export const openCalDemo = (e?: React.MouseEvent | Event) => {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const windowCal = (window as any).Cal;
  if (windowCal) {
    try {
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
      console.warn("Cal.com popup modal failed", err);
    }
  }

  // Fallback if global script fails: open in modal or tab
  window.open('https://cal.com/ifsinrem', '_blank', 'noopener,noreferrer');
};
