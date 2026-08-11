import { useEffect, useRef, useState, useCallback } from 'react';

export default function HeaderBottleCap({ isUncorked, setIsUncorked, onStreamOriginChange, navbarScrolled }) {
  const neckRef = useRef(null);
  const capRef = useRef(null);

  // States
  const [isNearCap, setIsNearCap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isNearDropTarget, setIsNearDropTarget] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [corkTooltip, setCorkTooltip] = useState('🍾 Move cursor near & scroll or click to uncork!');

  // Measure bottle neck position on header
  const updateStreamOrigin = useCallback(() => {
    if (neckRef.current) {
      const rect = neckRef.current.getBoundingClientRect();
      onStreamOriginChange({
        x: rect.right - 8,
        y: rect.top + rect.height / 2,
      });
    }
  }, [onStreamOriginChange]);

  useEffect(() => {
    updateStreamOrigin();
    window.addEventListener('resize', updateStreamOrigin);
    window.addEventListener('scroll', updateStreamOrigin, { passive: true });
    return () => {
      window.removeEventListener('resize', updateStreamOrigin);
      window.removeEventListener('scroll', updateStreamOrigin);
    };
  }, [updateStreamOrigin, navbarScrolled]);

  // Uncork / Open Bottle action
  const openBottle = useCallback(() => {
    if (isUncorked) return;
    setIsUncorked(true);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 900);

    // Initial floating position near top right of screen
    const initialX = Math.max(80, window.innerWidth - 180);
    const initialY = 120;
    setDragPos({ x: initialX, y: initialY });
    setCorkTooltip('👇 Drag cap back to bottle neck to seal!');
  }, [isUncorked, setIsUncorked]);

  // Seal / Close Bottle action
  const closeBottle = useCallback(() => {
    setIsUncorked(false);
    setIsDragging(false);
    setIsNearDropTarget(false);
    setCorkTooltip('🍾 Move cursor near & scroll or click to uncork!');
  }, [setIsUncorked]);

  // Proximity & Scroll Listener: if cursor is near bottle cap AND user scrolls -> open bottle!
  useEffect(() => {
    function onMouseMove(e) {
      if (!neckRef.current || isUncorked) return;
      const rect = neckRef.current.getBoundingClientRect();
      const capCenterX = rect.left + rect.width / 2;
      const capCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - capCenterX, e.clientY - capCenterY);
      // Proximity threshold: 85px
      const near = dist < 85;
      setIsNearCap(near);
    }

    function onScroll() {
      if (isNearCap && !isUncorked) {
        openBottle();
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isNearCap, isUncorked, openBottle]);

  // Mouse & Touch Dragging Handlers for Floating Cork Cap
  const startDrag = (e) => {
    if (!isUncorked) return;
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      setDragPos({ x: clientX - 20, y: clientY - 20 });

      // Check distance to bottle neck drop target
      if (neckRef.current) {
        const neckRect = neckRef.current.getBoundingClientRect();
        const neckCenterX = neckRect.left + neckRect.width / 2;
        const neckCenterY = neckRect.top + neckRect.height / 2;

        const dist = Math.hypot(clientX - neckCenterX, clientY - neckCenterY);
        setIsNearDropTarget(dist < 95);
      }
    }

    function handleEnd() {
      setIsDragging(false);

      // Check if released within drop target radius
      if (neckRef.current) {
        const neckRect = neckRef.current.getBoundingClientRect();
        const neckCenterX = neckRect.left + neckRect.width / 2;
        const neckCenterY = neckRect.top + neckRect.height / 2;

        const dist = Math.hypot(dragPos.x + 20 - neckCenterX, dragPos.y + 20 - neckCenterY);
        if (dist < 95 || isNearDropTarget) {
          closeBottle();
        }
      }
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragPos, isNearDropTarget, closeBottle]);

  return (
    <div className="header-bottle-assembly" ref={neckRef}>
      {/* Bottle Neck Socket / Opening on Header Navbar */}
      <div
        className={`bottle-neck-socket ${isUncorked ? 'pouring' : ''} ${isNearDropTarget ? 'target-glow' : ''}`}
        onClick={openBottle}
        title={corkTooltip}
      >
        <div className="bottle-neck-ring"></div>
        {/* Pouring liquid spout animation */}
        {isUncorked && (
          <div className="spout-flow-glow">
            <span className="spout-drop d1"></span>
            <span className="spout-drop d2"></span>
            <span className="spout-drop d3"></span>
          </div>
        )}
      </div>

      {/* Sealed Cork Cap (attached flush to neck when bottle is closed) */}
      {!isUncorked && (
        <button
          className={`sealed-cork-cap ${isNearCap ? 'pulse-hover' : ''}`}
          onClick={openBottle}
          aria-label="Uncork Bottle"
        >
          <div className="cork-body">
            <span className="cork-stripes"></span>
            <span className="cork-foil"></span>
          </div>
          <span className={`cork-tooltip-pop ${isNearCap ? 'show' : ''}`}>
            🍾 {isNearCap ? 'Scroll or click to Uncork!' : 'Hover & Scroll to Open'}
          </span>
        </button>
      )}

      {/* Sparkling Cork Pop Particle Explosion */}
      {showSparkles && (
        <div className="cork-pop-burst">
          <span className="spark p1">✨</span>
          <span className="spark p2">🍾</span>
          <span className="spark p3">💥</span>
          <span className="spark p4">✨</span>
          <span className="spark p5">💧</span>
        </div>
      )}

      {/* Floating Draggable Cork Cap (when bottle is OPEN) */}
      {isUncorked && (
        <div
          ref={capRef}
          className={`floating-cork-cap ${isDragging ? 'dragging' : ''} ${isNearDropTarget ? 'magnetic-pull' : ''}`}
          style={{
            position: 'fixed',
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            zIndex: 10000,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          title="Drag cap onto bottle neck to close"
        >
          <div className="cork-body floating">
            <span className="cork-stripes"></span>
            <span className="cork-foil"></span>
            <span className="cork-aura"></span>
          </div>
          <div className="cork-drag-badge">
            <span>👇 Drag to Bottle Neck</span>
          </div>
        </div>
      )}

      {/* Drop Target Visual Guide Ring on Navbar when dragging cork near */}
      {isUncorked && (
        <div className={`cork-drop-target-ring ${isNearDropTarget ? 'active' : ''}`}>
          <span>{isNearDropTarget ? 'RELEASE TO SEAL 🔒' : 'DROP HERE TO SEAL 🍾'}</span>
        </div>
      )}
    </div>
  );
}
