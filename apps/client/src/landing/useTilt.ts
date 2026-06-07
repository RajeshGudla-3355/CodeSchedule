import { useRef, useCallback } from 'react';

export function useTilt(intensity = 12) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(0)`;
    },
    [intensity]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}
