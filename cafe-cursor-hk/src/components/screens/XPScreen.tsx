'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import CursorBlink from '../ui/CursorBlink';
import Animate from '../ui/Animate';
import styles from './XPScreen.module.css';

interface XPScreenProps {
  currentXP: number;
  xpGained: number;
  targetXP: number;
  onMeetAnother: () => void;
  onViewReward: () => void;
}

export default function XPScreen({ currentXP, xpGained, targetXP, onMeetAnother, onViewReward }: XPScreenProps) {
  const [progressWidth, setProgressWidth] = useState(0);
  const remaining = targetXP - currentXP;
  const percentage = Math.min((currentXP / targetXP) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(percentage);
    }, 600);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={styles.screen}>
      <div className={styles.center}>
        <Animate delay={100}>
          <div className={styles.circle}>
            <div className={styles.plus}>+{xpGained}</div>
            <div className={styles.labelSmall}>XP earned</div>
          </div>
        </Animate>
        <Animate delay={300}>
          <h1 className={styles.title}>Well done.</h1>
        </Animate>
        <Animate delay={450}>
          <p className={styles.sub}>
            Every conversation you have makes<br />Cafe Cursor a little more alive<CursorBlink variant="gray" />
          </p>
        </Animate>

        <Animate delay={600}>
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Your XP</span>
              <span>{currentXP} / {targetXP}</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            {remaining > 0 && (
              <div className={styles.progressHint}>
                {remaining} more XP to unlock free Cursor coffee
              </div>
            )}
          </div>
        </Animate>

        <Animate delay={750}>
          <div className={styles.rewardHint}>
            <div className={styles.rewardIcon}>☕</div>
            <div>
              <div className={styles.rewardTitle}>Cursor Coffee Reward</div>
              <div className={styles.rewardSub}>Collect {targetXP} XP → get a free bag of beans</div>
            </div>
          </div>
        </Animate>

        <Animate delay={900}>
          <div className={styles.actions}>
            <Button onClick={onMeetAnother} icon="→">Meet another person</Button>
            {currentXP >= targetXP ? (
              <Button variant="secondary" onClick={onViewReward}>
                Claim your reward →
              </Button>
            ) : (
              <Button variant="secondary" onClick={onViewReward}>
                Preview: {targetXP} XP reward screen →
              </Button>
            )}
          </div>
        </Animate>
      </div>
    </div>
  );
}
