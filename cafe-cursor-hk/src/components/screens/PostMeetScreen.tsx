'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import styles from './PostMeetScreen.module.css';

interface PostMeetScreenProps {
  matchName: string;
  onSubmit: (reflection: string) => void;
}

export default function PostMeetScreen({ matchName, onSubmit }: PostMeetScreenProps) {
  const [reflection, setReflection] = useState('');

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className={styles.emoji}>💬</span>
        <h1 className={styles.title}>What did<br />you learn?</h1>
        <p className={styles.subtitle}>One interesting thing about {matchName}</p>
      </div>
      <div className={styles.scroll}>
        <div className={styles.fieldGroup}>
          <textarea
            className={styles.textarea}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={`Something interesting about ${matchName}...`}
          />
        </div>
        <div className={styles.hint}>
          This stays private — it&apos;s just to help you reflect and remember.
          You&apos;ll earn <span className={styles.highlight}>+10 XP</span> for logging it.
        </div>
      </div>
      <div className={styles.bottomAction}>
        <Button onClick={() => onSubmit(reflection)} icon="+10">Submit + earn 10 XP</Button>
      </div>
    </div>
  );
}
