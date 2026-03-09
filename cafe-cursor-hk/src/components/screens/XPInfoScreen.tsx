'use client';

import Animate from '../ui/Animate';
import Button from '../ui/Button';
import styles from './XPInfoScreen.module.css';

interface XPInfoScreenProps {
  xp: number;
  targetXP: number;
  onBack: () => void;
}

const REWARDS = [
  {
    icon: '📌',
    title: 'Cursor Pin',
    threshold: 15,
    description: 'A limited-edition Cursor enamel pin. Redeem at the counter.',
    limit: '1 per person',
  },
  {
    icon: '☕',
    title: 'Bag of Cursor Coffee',
    threshold: 40,
    description: 'A full bag of coffee to take home — fuel for when you\'re locking in.',
    limit: '1 per person',
  },
];

const XP_ACTIONS = [
  { action: 'Complete your profile', xp: '+5 XP' },
  { action: 'Meet someone & log it', xp: '+10 XP' },
  { action: 'Submit your first worst dev story', xp: '+5 XP' },
  { action: 'Vote on a worst dev story', xp: '+1 XP each' },
  { action: 'Get votes on your worst dev story', xp: '+5 XP each' },
];

export default function XPInfoScreen({
  xp,
  targetXP,
  onBack,
}: XPInfoScreenProps) {
  const percentage = Math.min((xp / targetXP) * 100, 100);

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <Animate delay={100}>
          <div className={styles.header}>
            <div className={styles.xpBig}>{xp}</div>
            <div className={styles.xpLabel}>XP earned</div>
          </div>
        </Animate>

        <Animate delay={200}>
          <div className={styles.progressSection}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
            </div>
            <div className={styles.progressCaption}>{xp} / {targetXP} XP</div>
          </div>
        </Animate>

        <Animate delay={300}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>What is XP?</h2>
            <p className={styles.sectionBody}>
              XP is how Cafe Cursor says thanks. Every time you show up, meet someone new, or share a story — you earn experience points toward real rewards.
            </p>
          </div>
        </Animate>

        <Animate delay={400}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>How to earn</h2>
            <div className={styles.earnList}>
              {XP_ACTIONS.map((item) => (
                <div key={item.action} className={styles.earnRow}>
                  <span className={styles.earnAction}>{item.action}</span>
                  <span className={styles.earnXP}>{item.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </Animate>

        <Animate delay={500}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Rewards</h2>
            <div className={styles.rewardsList}>
              {REWARDS.map((reward) => {
                const unlocked = xp >= reward.threshold;
                return (
                  <div
                    key={reward.title}
                    className={`${styles.rewardCard} ${unlocked ? styles.unlocked : ''}`}
                  >
                    <div className={styles.rewardTop}>
                      <span className={styles.rewardIcon}>{reward.icon}</span>
                      <div className={styles.rewardInfo}>
                        <div className={styles.rewardTitle}>{reward.title}</div>
                        <div className={styles.rewardThreshold}>{reward.threshold} XP</div>
                      </div>
                      {unlocked && <span className={styles.rewardUnlocked}>Unlocked</span>}
                    </div>
                    <p className={styles.rewardDesc}>{reward.description}</p>
                    <div className={styles.rewardLimit}>{reward.limit}</div>
                  </div>
                );
              })}
            </div>
            <p className={styles.suppliesNote}>While supplies last.</p>
          </div>
        </Animate>

        <Animate delay={600}>
          <div className={styles.backAction}>
            <Button variant="secondary" onClick={onBack} icon="←">Back</Button>
          </div>
        </Animate>
      </div>
    </div>
  );
}
