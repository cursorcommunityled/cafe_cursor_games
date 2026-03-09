'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Animate.module.css';

interface AnimateProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

export default function Animate({ children, delay = 0, direction = 'up', className = '' }: AnimateProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${visible ? styles.visible : ''} ${styles[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
