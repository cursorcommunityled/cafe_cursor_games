'use client';

import Animate from '../ui/Animate';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  name: string;
  onClaimCredits: () => void;
  onViewMenu: () => void;
  onMeetFriend: () => void;
  onWorstStory: () => void;
}

const ACTIONS = [
  { key: 'credits', label: 'Claim cursor credits', icon: '/cursor-cube.svg', badge: null },
  { key: 'menu', label: 'View menu', icon: '📋', badge: null },
  { key: 'meet', label: 'Meet a new friend', icon: '👋', badge: '+10 XP' },
  { key: 'story', label: 'Submit a worst dev story', icon: '💀', badge: '+5 XP' },
] as const;

export default function WelcomeScreen({
  name,
  onClaimCredits,
  onViewMenu,
  onMeetFriend,
  onWorstStory,
}: WelcomeScreenProps) {
  const handlers: Record<string, () => void> = {
    credits: onClaimCredits,
    menu: onViewMenu,
    meet: onMeetFriend,
    story: onWorstStory,
  };

  const firstName = name.split(' ')[0];

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <Animate delay={100}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>
              Welcome,<br />{firstName}.
            </h1>
            <p className={styles.subtitle}>
              Grab a seat, grab a coffee. Cowork in
              <br />
              good company or meet a new friend.
            </p>
          </div>
        </Animate>

        <div className={styles.actions}>
          {ACTIONS.map((action, i) => (
            <Animate key={action.key} delay={250 + i * 100}>
              <button
                className={styles.actionCard}
                onClick={handlers[action.key]}
              >
                <span className={styles.actionIcon}>
                  {action.icon.startsWith('/') ? (
                    <img src={action.icon} alt="" className={styles.actionIconImg} />
                  ) : (
                    action.icon
                  )}
                </span>
                <span className={styles.actionLabel}>{action.label}</span>
                {action.badge && (
                  <span className={styles.actionBadge}>{action.badge}</span>
                )}
                <span className={styles.actionArrow}>→</span>
              </button>
            </Animate>
          ))}
        </div>
      </div>

      <Animate delay={700}>
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Brought to you by your friendly neighborhood cursor ambassadors{' '}
            <a href="https://x.com/itzdgofficial" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Devansh</a> & <a href="https://linkedin.com/in/rebeccayip" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Rebecca</a>
          </p>
        </div>
      </Animate>
    </div>
  );
}
