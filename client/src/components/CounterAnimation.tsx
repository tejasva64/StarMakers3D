import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CounterAnimationProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function CounterAnimation({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
}: CounterAnimationProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const counterObj = useRef({ value: 0 });

  useEffect(() => {
    const counter = counterRef.current;
    if (!counter) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      counter.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
      return;
    }

    gsap.to(counterObj.current, {
      value: end,
      duration,
      scrollTrigger: {
        trigger: counter,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        const value = counterObj.current.value.toFixed(decimals);
        counter.textContent = `${prefix}${value}${suffix}`;
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [end, duration, prefix, suffix, decimals]);

  return <span ref={counterRef}>0</span>;
}
