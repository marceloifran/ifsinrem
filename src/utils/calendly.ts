import { openCalDemo } from './cal';

/**
 * Legacy wrapper: Redirects Calendly calls to Cal.com for seamless transition.
 */
export const openCalendly = (e?: any) => {
  openCalDemo(e);
};
