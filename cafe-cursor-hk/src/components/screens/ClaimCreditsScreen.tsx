'use client';

import Button from '../ui/Button';
import Animate from '../ui/Animate';
import styles from './ClaimCreditsScreen.module.css';

interface ClaimCreditsScreenProps {
  creditUrl?: string | null;
  loading?: boolean;
  onBack: () => void;
  onRetry?: () => void;
}

export default function ClaimCreditsScreen({
  creditUrl,
  loading,
  onBack,
  onRetry,
}: ClaimCreditsScreenProps) {
  const handleOpen = () => {
    if (creditUrl) {
      window.open(creditUrl, '_blank', 'noopener');
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <Animate delay={100}>
          <div className={styles.iconWrap}>
            <img
              src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/CUBE_25D.svg"
              alt="Cursor"
              className={styles.logo}
            />
          </div>
        </Animate>

        <Animate delay={200}>
          <h1 className={styles.title}>Your Cursor<br />Credits</h1>
        </Animate>

        <Animate delay={350}>
          <p className={styles.desc}>
            Tap the button below to open your unique referral link and redeem your Cursor credits.
          </p>
        </Animate>

        <Animate delay={450}>
          <div className={styles.codeBox}>
            <div className={styles.codeLabel}>Your link</div>
            {loading ? (
              <div className={styles.code}>Loading…</div>
            ) : creditUrl ? (
              <>
                <button className={styles.urlButton} onClick={handleOpen}>
                  Open referral link ↗
                </button>
                <div className={styles.codeHint}>One-time use · opens in new tab</div>
              </>
            ) : (
              <>
                <div className={styles.code}>Unavailable</div>
                <div className={styles.codeHint}>No credits available right now</div>
                {onRetry && (
                  <button className={styles.retryButton} onClick={onRetry}>
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        </Animate>
      </div>

      <div className={styles.bottom}>
        <Button variant="secondary" onClick={onBack}>← Back to home</Button>
      </div>
    </div>
  );
}
