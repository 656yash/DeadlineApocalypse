import { useEffect, useRef } from "react";

export default function ParticleCanvas({ animEnabled }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let rafId = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(55, (window.innerWidth / 20) | 0);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        v: Math.random() * 0.3 + 0.08,
        a: Math.random() * 0.5 + 0.15,
        h: Math.random() < 0.5 ? "139,92,246" : "34,211,238"
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animEnabled) {
        particles.forEach((p) => {
          p.y -= p.v;
          if (p.y < -5) {
            p.y = canvas.height + 5;
            p.x = Math.random() * canvas.width;
          }
          ctx.fillStyle = `rgba(${p.h},${p.a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [animEnabled]);

  return <canvas id="bg" ref={canvasRef} />;
}
