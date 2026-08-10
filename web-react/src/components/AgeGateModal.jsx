import { useEffect, useState } from 'react';

export default function AgeGateModal() {
  const [hidden, setHidden] = useState(true); // start hidden, decide on mount to avoid SSR flash mismatches

  useEffect(() => {
    setHidden(sessionStorage.getItem('age-ok') === '1');
  }, []);

  function handleYes() {
    try {
      sessionStorage.setItem('age-ok', '1');
    } catch (e) {
      /* ignore */
    }
    setHidden(true);
  }

  function handleNo() {
    window.location.href = 'https://www.responsibility.org/';
  }

  return (
    <div className={`age-modal${hidden ? ' hidden' : ''}`} id="age-modal">
      <div className="age-inner">
        <img src="/assets/images/eb-logo.png" alt="El Barrilito Logo" className="age-logo-img" />
        <p className="age-eyebrow">El Barrilito</p>
        <h2>Age Verification</h2>
        <p className="age-desc">You must be 21 years of age or older to enter. Please confirm your age to continue.</p>
        <div className="age-btns">
          <button className="btn-yes" id="age-yes" onClick={handleYes}>I Am 21 or Older</button>
          <button className="btn-no" id="age-no" onClick={handleNo}>I Am Under 21</button>
        </div>
      </div>
    </div>
  );
}
