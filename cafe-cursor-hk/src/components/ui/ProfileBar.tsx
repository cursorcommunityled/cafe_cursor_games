'use client';

import styles from './ProfileBar.module.css';

interface ProfileBarProps {
  name: string;
  xp: number;
  targetXP: number;
  onEditProfile: () => void;
  onHome?: () => void;
  onXPClick?: () => void;
}

export default function ProfileBar({ name, xp, targetXP, onEditProfile, onHome, onXPClick }: ProfileBarProps) {
  const percentage = Math.min((xp / targetXP) * 100, 100);

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {onHome && (
          <button className={styles.logoBtn} onClick={onHome} aria-label="Back to home">
            <img
              src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/LOCKUP_HORIZONTAL_25D_DARK.svg"
              alt="Cursor"
              className={styles.logo}
            />
          </button>
        )}
      </div>
      <div className={styles.right}>
        <button className={styles.xpBtn} onClick={onXPClick || onEditProfile}>
          <span className={styles.xpValue}>{xp} XP</span>
          <div className={styles.xpTrack}>
            <div className={styles.xpFill} style={{ width: `${percentage}%` }} />
          </div>
        </button>
        <button className={styles.avatarBtn} onClick={onEditProfile} aria-label="Edit profile">
          <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
}
