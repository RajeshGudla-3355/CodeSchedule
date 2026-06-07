import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 1400, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const tick = (t: number) => {
      if (startTime.current === null) startTime.current = t;
      const elapsed = t - startTime.current;
      const p = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      startTime.current = null;
    };
  }, [target, durationMs, start]);

  return value;
}
