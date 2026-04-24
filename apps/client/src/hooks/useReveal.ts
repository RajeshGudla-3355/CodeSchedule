import { useEffect } from 'react';

/**
 * Adds an `is-visible` class to any element with a `.reveal` class
 * once it scrolls into view. Uses IntersectionObserver and watches
 * an optional scroll container (defaults to the nearest scrollable ancestor).
 *
 * Call this once per page (e.g. inside the Landing page component).
 */
export function useReveal(rootSelector?: string) {
  useEffect(() => {
    const root = rootSelector ? document.querySelector(rootSelector) : null;
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!els.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { root, threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootSelector]);
}
