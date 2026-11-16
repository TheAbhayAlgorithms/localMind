import React, { useEffect, useRef, useState } from 'react';

interface KineticCharTextProps {
  text: string;
  className?: string;
  gradient?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

export const KineticCharText: React.FC<KineticCharTextProps> = ({
  text,
  className = '',
  gradient = false,
  as: Component = 'span',
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if reduced motion is preferred
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalChars = text.length;

  return (
    <Component
      ref={ref as any}
      className={`inline-block ${isVisible ? 'is-visible' : ''} ${
        gradient ? 'gradient-text' : ''
      } ${className}`}
      style={{
        '--w': `${totalChars}ch`,
      } as React.CSSProperties}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="char"
          style={{
            '--i': index,
            '--x': `${index}ch`,
          } as React.CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Component>
  );
};
