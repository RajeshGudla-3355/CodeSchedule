import { createContext, useContext, type RefObject } from 'react';

/**
 * The landing page renders inside a `.page-scroll` <main>, NOT the window.
 * Anything that needs to react to scroll (framer-motion's whileInView/useInView,
 * useScroll, IntersectionObservers) has to point at that element as the root.
 *
 * Landing.tsx creates a ref to that <main>, then wraps the tree in this Provider.
 * Children read it with useScrollRoot() and pass it to viewport.root / container.
 */
export const LandingScrollContext = createContext<RefObject<HTMLElement> | null>(null);

export function useScrollRoot(): RefObject<HTMLElement> | null {
  return useContext(LandingScrollContext);
}
