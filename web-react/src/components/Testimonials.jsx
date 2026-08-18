import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap';

export default function Testimonials() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion() || !videoRef.current) return;
    
    // Play the video when the section enters the viewport, pause when it leaves
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => videoRef.current.play(),
      onLeave: () => videoRef.current.pause(),
      onEnterBack: () => videoRef.current.play(),
      onLeaveBack: () => videoRef.current.pause(),
    });
  }, { scope: sectionRef });

  return (
    <section className="testimonials" id="testimonials" ref={sectionRef}>
      <div className="testi-inner">
        <div className="section-header reveal-up">
          <p className="eyebrow-line"><span className="eyebrow-dash"></span> Experience <span className="eyebrow-dash"></span></p>
          <h2 className="section-heading">Tequila takes you to <em>another world</em></h2>
        </div>

        <div className="video-container reveal-up" style={{ marginTop: '40px', maxWidth: '600px', margin: '40px auto 0' }}>
          <video
            ref={videoRef}
            src="/assets/videos/tequila_white.mp4"
            muted
            loop
            playsInline
            style={{ 
              width: '100%', 
              height: 'auto', 
              borderRadius: 'var(--radius-lg)', 
              display: 'block',
              mixBlendMode: 'multiply',
              clipPath: 'inset(0 0 12% 0)'
            }}
          />
        </div>
      </div>
    </section>
  );
}
