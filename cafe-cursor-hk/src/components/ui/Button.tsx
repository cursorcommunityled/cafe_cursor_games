'use client';

import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({ children, icon, variant = 'primary', onClick, className = '', disabled }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      {icon && <span>{icon}</span>}
    </button>
  );
}
