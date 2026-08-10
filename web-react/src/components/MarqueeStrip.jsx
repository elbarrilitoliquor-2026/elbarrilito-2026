import { useRef } from 'react';

const WORDS = ['Tequila', 'Mezcal', 'Cerveza', 'Whiskey', 'Bourbon', 'Vodka', 'Ron', 'Vino', 'Añejo', 'Reposado', 'Blanco', 'Cristalino'];

export default function MarqueeStrip() {
  const trackRef = useRef(null);

  function pause() {
    if (trackRef.current) trackRef.current.style.animationPlayState = 'paused';
  }
  function resume() {
    if (trackRef.current) trackRef.current.style.animationPlayState = 'running';
  }

  return (
    <div className="marquee-strip" id="marquee-strip" onMouseEnter={pause} onMouseLeave={resume}>
      <div className="marquee-track" id="marquee-track" ref={trackRef}>
        {WORDS.map((w) => <span key={`a-${w}`}>• {w}</span>)}
        {WORDS.map((w) => <span key={`b-${w}`}>• {w}</span>)}
      </div>
    </div>
  );
}
