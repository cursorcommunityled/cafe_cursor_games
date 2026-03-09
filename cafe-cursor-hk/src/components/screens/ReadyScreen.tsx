'use client';

import Button from '../ui/Button';
import CursorBlink from '../ui/CursorBlink';
import styles from './ReadyScreen.module.css';

interface ProfileData {
  name: string;
  wearing: string;
  funFact: string;
  interests: string[];
}

interface ReadyScreenProps {
  profile: ProfileData;
  onMeet: () => void;
  onEditProfile: () => void;
}

export default function ReadyScreen({ profile, onMeet, onEditProfile }: ReadyScreenProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <img
          src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/Frame%204.png"
          alt="Cafe Cursor HK"
          className={styles.icon}
        />
        <h1 className={styles.title}>Ready to<br />meet<br />someone?</h1>
        <p className={styles.desc}>
          Tap below when you&apos;re open to connecting. We&apos;ll match you with another guest who&apos;s also ready.
        </p>
        <div className={styles.summary} onClick={onEditProfile} role="button" tabIndex={0}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryName}>
              {profile.name || 'Your Name'} <CursorBlink />
            </div>
            <span className={styles.summaryEdit}>Edit ✎</span>
          </div>
          <div className={styles.summaryDetail}>
            ▮ {profile.wearing || 'Not set'}<br />
            ★ {profile.funFact || 'Not set'}<br />
            ◎ {profile.interests.join(', ') || 'Not set'}
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <Button onClick={onMeet} icon="●">I&apos;m open to meeting</Button>
      </div>
    </div>
  );
}
