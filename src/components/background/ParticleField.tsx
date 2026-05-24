/* ═══════════════════════════════════════════════════════
   ParticleField — Atmospheric void background canvas
   ≤80 particles, pink/cyan palette, slow drift.
   ═══════════════════════════════════════════════════════ */

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  isPink: boolean;
}

const PARTICLE_COUNT = 72; // hard cap well below 80
const MAX_SPEED = 0.22;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * MAX_SPEED;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 0.8 + 1.0,          // 1.0–1.8 px
        alpha: Math.random() * 0.3 + 0.4,            // 0.4–0.7
        isPink: Math.random() < 0.30,                 // ~30% pink, rest cyan
      });
    }
    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const particles = particlesRef.current;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -2) p.x = w + 2;
      if (p.x > w + 2) p.x = -2;
      if (p.y < -2) p.y = h + 2;
      if (p.y > h + 2) p.y = -2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      // pink = rgba(224,64,123,…) | cyan = rgba(34,211,184,…)
      ctx.fillStyle = p.isPink
        ? `rgba(224,64,123,${p.alpha})`
        : `rgba(34,211,184,${p.alpha * 0.85})`;
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
