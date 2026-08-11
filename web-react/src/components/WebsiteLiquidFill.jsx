import { useEffect, useRef, useState } from 'react';

export default function WebsiteLiquidFill({ isUncorked, onClose, streamOrigin }) {
  const canvasRef = useRef(null);
  const [fillLevel, setFillLevel] = useState(0); // 0 to 100 percentage
  const [isVisible, setIsVisible] = useState(false);

  // Sync visibility and target fill level
  useEffect(() => {
    if (isUncorked) {
      setIsVisible(true);
    }
  }, [isUncorked]);

  // Liquid level progression and drainage logic
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    function updateLevel(now) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setFillLevel((prev) => {
        if (isUncorked) {
          // Fill slowly up to 88%
          const next = Math.min(88, prev + delta * 4.5);
          return next;
        } else {
          // Drain when closed down to 0
          const next = Math.max(0, prev - delta * 15);
          if (next === 0 && !isUncorked) {
            setIsVisible(false);
          }
          return next;
        }
      });

      if (isUncorked || fillLevel > 0) {
        animId = requestAnimationFrame(updateLevel);
      }
    }

    animId = requestAnimationFrame(updateLevel);
    return () => cancelAnimationFrame(animId);
  }, [isUncorked, fillLevel]);

  // Render liquid canvas physics (surface wave, bubbles, stream, splash)
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let phase = 0;

    // Generate random rising bubbles inside liquid
    const bubbles = Array.from({ length: 35 }, () => ({
      x: Math.random() * (window.innerWidth || 1200),
      y: (window.innerHeight || 800) * (0.3 + Math.random() * 0.7),
      radius: 1.5 + Math.random() * 3.5,
      speed: 0.6 + Math.random() * 1.4,
      wobble: Math.random() * Math.PI * 2,
      opacity: 0.2 + Math.random() * 0.5,
    }));

    // Splash particles at stream contact point
    const splashParticles = Array.from({ length: 18 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 2,
      size: 1.5 + Math.random() * 3,
      alpha: 1,
    }));

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function render(time) {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const targetY = h - (h * (fillLevel / 100));
      phase += 0.04;

      // 1. Draw Liquid Fill Body if fillLevel > 0
      if (fillLevel > 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, h);

        // Sine wave liquid surface
        const waveAmp = isUncorked ? 7 : 3;
        const waveFreq = 0.008;
        for (let x = 0; x <= w; x += 10) {
          const y = targetY + Math.sin(x * waveFreq + phase) * waveAmp + Math.cos(x * 0.015 - phase * 0.8) * (waveAmp * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        // Luxury tequila/spirit amber gradient fill
        const grad = ctx.createLinearGradient(0, targetY - 20, 0, h);
        grad.addColorStop(0, 'rgba(255, 195, 60, 0.42)'); // Glowing liquid surface gold
        grad.addColorStop(0.15, 'rgba(212, 130, 10, 0.32)'); // Golden Tequila tone
        grad.addColorStop(0.65, 'rgba(168, 15, 15, 0.36)');  // Deep Red Agave spirit tone
        grad.addColorStop(1, 'rgba(70, 2, 8, 0.45)');       // Rich dark base

        ctx.fillStyle = grad;
        ctx.fill();

        // 2. Draw Golden Wave Highlight Line on Top Edge
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = targetY + Math.sin(x * waveFreq + phase) * waveAmp + Math.cos(x * 0.015 - phase * 0.8) * (waveAmp * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 250, 205, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Second subtle highlight line
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = targetY + 3 + Math.sin(x * waveFreq + phase + 0.5) * waveAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 180, 40, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Render Floating Spirits Bubbles inside the liquid
        bubbles.forEach((b) => {
          b.y -= b.speed;
          b.wobble += 0.05;
          const bubbleX = b.x + Math.sin(b.wobble) * 2;

          // Wrap bubble when reaching liquid surface
          if (b.y < targetY) {
            b.y = h - Math.random() * 20;
            b.x = Math.random() * w;
          }

          ctx.beginPath();
          ctx.arc(bubbleX, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 180, ${b.opacity})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 200, 80, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      }

      // 4. Render Pouring Stream from Header Bottle Neck if Uncorked
      if (isUncorked) {
        const startX = streamOrigin?.x || (window.innerWidth - 30);
        const startY = streamOrigin?.y || 40;
        const impactY = Math.min(h, Math.max(startY + 20, targetY));

        // Liquid stream main golden beam
        const streamGrad = ctx.createLinearGradient(startX, startY, startX, impactY);
        streamGrad.addColorStop(0, 'rgba(255, 240, 170, 0.95)');
        streamGrad.addColorStop(0.3, 'rgba(235, 160, 20, 0.85)');
        streamGrad.addColorStop(0.8, 'rgba(200, 110, 10, 0.8)');
        streamGrad.addColorStop(1, 'rgba(255, 220, 100, 0.9)');

        ctx.beginPath();
        // Dynamic wiggling stream path
        const streamWobble = Math.sin(phase * 2) * 3;
        ctx.moveTo(startX - 3, startY);
        ctx.bezierCurveTo(
          startX - 2 + streamWobble, (startY + impactY) / 2,
          startX - 4 - streamWobble, impactY - 10,
          startX - 6, impactY
        );
        ctx.lineTo(startX + 6, impactY);
        ctx.bezierCurveTo(
          startX + 4 - streamWobble, impactY - 10,
          startX + 2 + streamWobble, (startY + impactY) / 2,
          startX + 3, startY
        );
        ctx.closePath();
        ctx.fillStyle = streamGrad;
        ctx.fill();

        // Stream outer glowing aura
        ctx.shadowColor = '#ffb700';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(255, 230, 120, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Liquid droplets falling along stream
        for (let i = 0; i < 5; i++) {
          const dropProgress = ((phase * 2.5 + i * 0.2) % 1);
          const dropY = startY + dropProgress * (impactY - startY);
          const dropX = startX + Math.sin(dropProgress * Math.PI * 4 + phase) * 2;
          ctx.beginPath();
          ctx.arc(dropX, dropY, 2 + Math.random() * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 245, 190, 0.9)';
          ctx.fill();
        }

        // 5. Render Splash Ripples & Particles at impact point
        ctx.beginPath();
        ctx.ellipse(startX, impactY, 14 + Math.sin(phase * 4) * 4, 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 245, 200, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();

        splashParticles.forEach((sp) => {
          if (sp.alpha <= 0.05) {
            sp.x = startX;
            sp.y = impactY;
            sp.vx = (Math.random() - 0.5) * 8;
            sp.vy = -Math.random() * 6 - 2;
            sp.alpha = 0.9;
          }
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.3; // gravity
          sp.alpha -= 0.03;

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 120, ${Math.max(0, sp.alpha)})`;
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isVisible, isUncorked, fillLevel, streamOrigin]);

  if (!isVisible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="website-liquid-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9990,
        }}
      />
      {/* Floating HUD status bar */}
      <div className={`liquid-fill-hud ${fillLevel > 5 ? 'visible' : ''}`}>
        <div className="hud-badge">
          <span className="hud-icon">🍾</span>
          <span className="hud-text">
            <strong>Spirit Fill Level:</strong> {Math.round(fillLevel)}%
          </span>
        </div>
        <p className="hud-instruction">
          ✨ <strong>Interactive Bottle Open:</strong> Drag the floating bottle cap back onto the header bottle neck to seal it shut!
        </p>
        <button className="hud-seal-btn" onClick={onClose} aria-label="Seal Bottle Now">
          🔒 Seal Bottle
        </button>
      </div>
    </>
  );
}
