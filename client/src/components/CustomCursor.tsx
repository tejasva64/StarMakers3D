import { useEffect, useRef, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const targetRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Check if device supports touch
    const hasTouch = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0))) ||
        false
      );
    };
    
    setIsTouchDevice(hasTouch());
  }, []);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    const handleMouseDown = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add('scale-75');
      }
    };

    const handleMouseUp = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('scale-75');
      }
    };

    // Smooth cursor animation loop
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.2,
        y: prev.y + (targetRef.current.y - prev.y) * 0.2,
      }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTouchDevice]);

  // Hide cursor on touch devices
  if (isTouchDevice) {
    return null;
  }

  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`fixed w-6 h-6 pointer-events-none z-50 transition-all duration-100 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: `${position.x - 12}px`,
        top: `${position.y - 12}px`,
      }}
    >
      {/* Main cursor ring */}
      <div className="w-full h-full rounded-full border-2 border-cyan-400/60 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md" />

      {/* Trail dots */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
          style={{
            left: `${6 - (i + 1) * 2}px`,
            top: `${6 - (i + 1) * 2}px`,
            opacity: 0.4 - i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
