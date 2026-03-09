'use client';

import CursorBlink from '../ui/CursorBlink';
import styles from './WaitingScreen.module.css';

interface WaitingScreenProps {
  onHome: () => void;
}

export default function WaitingScreen({ onHome }: WaitingScreenProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.inner}>
        <div className={styles.pulseRing}>
          <img
            src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/AVATAR_CIRCLE_DARK.png"
            alt="Cursor"
            className={styles.pulseCenter}
          />
        </div>
        <h1 className={styles.title}>Looking<br />for a match</h1>
        <p className={styles.sub}>
          Finding someone nearby<br />who&apos;s also open to a conversation<CursorBlink variant="gray" />
        </p>
        <div className={styles.dots}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
        <button className={styles.cancelBtn} onClick={onHome}>
          Cancel
        </button>
      </div>
    </div>
  );
}
