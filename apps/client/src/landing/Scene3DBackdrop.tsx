import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const Scene3D = lazy(() => import('./Scene3D'));

/**
 * Sticks behind the entire landing page. Position-fixed to the viewport
 * (body is locked at 100vh in this app, so fixed is correct here).
 *
 * The canvas stays at full opacity the entire scroll — sections sit on top
 * as glass cards. Readability is handled per-section via translucent dark
 * scrims + card-level backdrop blurs (in styles.css), not by hiding the canvas.
 */
export default function Scene3DBackdrop() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Tiny delay so first paint isn't blocked by spinning up WebGL.
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  if (reduced) {
    return <div className="landing3d-backdrop landing3d-backdrop-fallback" aria-hidden="true" />;
  }

  return (
    <div className="landing3d-backdrop" aria-hidden="true">
      {mounted && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}
    </div>
  );
}
