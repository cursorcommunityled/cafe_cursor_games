'use client';

import Button from '../ui/Button';
import Animate from '../ui/Animate';
import styles from './RewardScreen.module.css';

interface RewardScreenProps {
  conversationCount: number;
  rewardCode?: string | null;
  onBackToStart: () => void;
}

export default function RewardScreen({ conversationCount, rewardCode, onBackToStart }: RewardScreenProps) {
  return (
    <div className={styles.screen}>
      <div className="grid-bg" />
      <div className={styles.main}>
        <Animate delay={100}>
          <div className={styles.coffeeIcon}>☕</div>
        </Animate>
        <Animate delay={300}>
          <h1 className={styles.title}>
            You&apos;ve earned<br />
            <em className={styles.titleEm}>free coffee.</em>
          </h1>
        </Animate>
        <Animate delay={450}>
          <p className={styles.desc}>
            Show this code at the counter to redeem<br />
            your bag of Cursor coffee beans.
          </p>
        </Animate>
        <Animate delay={600}>
          <div className={styles.code}>{rewardCode || 'CCR-???-????'}</div>
        </Animate>
        <Animate delay={700}>
          <div className={styles.validity}>Valid until end of month · Single use</div>
        </Animate>
        <Animate delay={850}>
          <div className={styles.summaryBox}>
            <span className={styles.summaryTitle}>
              You had {conversationCount} conversation{conversationCount !== 1 ? 's' : ''} 🎉
            </span>
            You met some amazing people —<br />hope they gave you something to think about.
          </div>
        </Animate>
        <Animate delay={1000}>
          <div style={{ width: '100%' }}>
            <Button onClick={onBackToStart} icon="↺">Back to start</Button>
          </div>
        </Animate>
      </div>
    </div>
  );
}
