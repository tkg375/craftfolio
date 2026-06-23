'use client';
import { useRef, MouseEvent, CSSProperties, ReactNode, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
}

export default function TiltCard({ children, className = '', style = {}, intensity = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(12px)`;
    el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(202,138,4,0.18), 0 8px 32px rgba(0,0,0,0.4)`;
  }

  function onMouseLeave() {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: 'transform 0.18s ease, box-shadow 0.18s ease', willChange: isTouch ? 'auto' : 'transform' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
