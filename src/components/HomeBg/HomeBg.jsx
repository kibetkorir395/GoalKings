import { useEffect, useRef } from 'react';
import './HomeBg.scss';

export default function HomeBg({ opacity = 0.15 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext('2d');

    let frameId = null;
    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const nw = rect ? Math.floor(rect.width * window.devicePixelRatio) : window.innerWidth;
      const nh = rect ? Math.floor(rect.height * window.devicePixelRatio) : window.innerHeight;
      if (w !== nw || h !== nh) {
        canvas.width = nw;
        canvas.height = nh;
        w = nw; h = nh;
      }
    };

    const N = 512;
    const points = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    }));

    let a = 1.7, b = 1.7, c = 0.6, d = 1.2;

    function step(time) {
      resize();
      a = 1.7 + Math.sin(time * 0.0003) * 0.2;
      b = 1.7 + Math.cos(time * 0.0003) * 0.2;

      for (const p of points) {
        const x = Math.sin(a * p.y) + c * Math.cos(a * p.x);
        const y = Math.sin(b * p.x) + d * Math.cos(b * p.y);
        p.x = x;
        p.y = y;
      }

      cx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      cx.fillRect(0, 0, w, h);
      cx.fillStyle = 'rgba(5, 146, 18, 0.3)';
      cx.save();
      cx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      cx.translate(cw / 2, ch / 2);
      for (const p of points) {
        cx.fillRect(p.x * Math.min(cw, ch) * 0.45, p.y * Math.min(cw, ch) * 0.45, 1, 1);
      }
      cx.restore();

      frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ opacity, position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }} />;
}
