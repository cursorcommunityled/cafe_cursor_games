'use client';

import { useEffect, useState } from 'react';
import styles from './StatusBar.module.css';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.bar}>
      <span>{time}</span>
      <span>●●●</span>
    </div>
  );
}
