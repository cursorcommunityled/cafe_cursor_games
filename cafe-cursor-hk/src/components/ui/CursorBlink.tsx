'use client';

import styles from './CursorBlink.module.css';

interface CursorBlinkProps {
  variant?: 'white' | 'black' | 'gray';
}

export default function CursorBlink({ variant = 'white' }: CursorBlinkProps) {
  return <span className={`${styles.cursor} ${styles[variant]}`} />;
}
