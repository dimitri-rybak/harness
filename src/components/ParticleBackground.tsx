import { useEffect, useRef } from 'react';

/**
 * Canvas-based particle background that reacts to mouse movement.
 * Particles drift gently, connect with nearby particles via thin lines,
 * and gently repel from the cursor for an "alive" feel.
 */
export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLight = !document.documentElement.classList.contains('dark');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.max(40, Math.min(90, Math.floor((width * height) / 22000)));
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
      a: Math.random() * 0.5 + 0.2,
    }));

    const onMouseMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onMouseLeave = () => {
      mouse.current.active = false;
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerleave', onMouseLeave);

    const base = isLight ? '#0a192f' : '#64ffda';
    const link = isLight ? 'rgba(10,25,47,0.08)' : 'rgba(100,255,218,0.10)';
    const linkStrong = isLight ? 'rgba(10,25,47,0.16)' : 'rgba(100,255,218,0.22)';

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // mouse repel
        if (mouse.current.active) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 140 * 140 && dist2 > 0) {
            const f = (140 * 140 - dist2) / (140 * 140);
            p.vx += (dx / Math.sqrt(dist2)) * f * 0.12;
            p.vy += (dy / Math.sqrt(dist2)) * f * 0.12;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(20,40,70,${p.a})`
          : `rgba(100,255,218,${p.a})`;
        ctx.fill();
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) {
            const alpha = 1 - Math.sqrt(d2) / 130;
            ctx.strokeStyle = mouse.current.active ? linkStrong : link;
            ctx.globalAlpha = alpha * 0.6;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
    />
  );
};