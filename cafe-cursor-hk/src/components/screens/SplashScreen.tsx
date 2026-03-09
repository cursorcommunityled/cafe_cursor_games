'use client';

import Button from '../ui/Button';
import Animate from '../ui/Animate';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  connectionCount: number;
  memberCount: number;
  onStart: () => void;
  onSignIn: () => void;
}

export default function SplashScreen({ connectionCount, memberCount, onStart, onSignIn }: SplashScreenProps) {
  return (
    <div className={styles.screen}>
      <div className="grid-bg" />
      <div className={styles.top}>
        <Animate delay={100}>
          <div className={styles.mark}>HKG — Since 2026</div>
        </Animate>
        <Animate delay={150}>
          <img
            src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/CUBE_25D.svg"
            alt=""
            className={styles.cube}
          />
        </Animate>
        <Animate delay={200}>
          <h1 className={styles.title}>Cafe<br /><em>Cursor</em></h1>
        </Animate>
        <Animate delay={350}>
          <p className={styles.sub}>Cozy coworking. New friends. Great coffee.</p>
        </Animate>
        <Animate delay={500}>
          <div className={styles.grid}>
            <div className={styles.cell}>
              <div className={styles.cellNum}>{Math.max(memberCount, 568).toLocaleString()}</div>
              <div className={styles.cellLabel}>Members</div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellNum}>{Math.max(connectionCount, 127).toLocaleString()}</div>
              <div className={styles.cellLabel}>Connections</div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellNum}>☕</div>
              <div className={styles.cellLabel}>Free coffee</div>
            </div>
          </div>
        </Animate>
      </div>
      <Animate delay={650}>
        <div className={styles.bottom}>
          <Button onClick={onStart} icon="▶">Start here</Button>
          <Button variant="secondary" onClick={onSignIn}>Already have a profile? Sign in</Button>
        </div>
      </Animate>
    </div>
  );
}
