'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import styles from './ProfileScreen.module.css';

interface ProfileData {
  email: string;
  name: string;
  wearing: string;
  funFact: string;
  interests: string[];
}

interface ProfileScreenProps {
  mode?: 'signup' | 'signin';
  profile: ProfileData;
  onUpdateProfile: (profile: ProfileData) => void;
  onSignIn?: (email: string) => Promise<boolean>;
  onCheckEmail?: (email: string) => Promise<boolean>;
  onContinue: () => void;
  onBack: () => void;
  onSignOut?: () => void;
}

const CODEWORD = 'Welcome2Cursor';
const INTEREST_OPTIONS = ['Good conversation', 'Networking', 'Creative collab', 'Just curious'];

export default function ProfileScreen({ mode = 'signup', profile, onUpdateProfile, onSignIn, onCheckEmail, onContinue, onBack, onSignOut }: ProfileScreenProps) {
  const isReturningUser = !!profile.name;
  const [step, setStep] = useState<1 | 2>(isReturningUser ? 2 : 1);
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [codeword, setCodeword] = useState('');
  const [codewordError, setCodewordError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [signInError, setSignInError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignIn = mode === 'signin';

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = async () => {
    setSignInError('');
    setEmailError('');

    if (isSignIn && onSignIn) {
      if (!formData.email) {
        setSignInError('Please enter your email address.');
        return;
      }
      setLoading(true);
      const found = await onSignIn(formData.email);
      setLoading(false);
      if (!found) {
        setSignInError('No account found with that email. Try signing up instead.');
      }
      return;
    }

    if (!formData.email) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (codeword !== CODEWORD) {
      setCodewordError(true);
      return;
    }
    setCodewordError(false);

    if (onCheckEmail) {
      setLoading(true);
      const allowed = await onCheckEmail(formData.email);
      setLoading(false);
      if (!allowed) {
        setEmailError('This email is not on the guest list. Please check with an organiser.');
        return;
      }
    }

    setStep(2);
  };

  const handleContinue = () => {
    onUpdateProfile(formData);
    onContinue();
  };

  const handleBackFromStep2 = () => {
    if (isReturningUser) {
      onBack();
    } else {
      setStep(1);
    }
  };

  if (step === 1) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <h1 className={styles.title}>{isSignIn ? <>Sign<br />In</> : <>Sign<br />Up</>}</h1>
          <p className={styles.subtitle}>{isSignIn ? 'Welcome back!' : 'Takes 60 seconds. We promise.'}</p>
        </div>
        <div className={styles.formBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email address</label>
            <input
              className={`${styles.fieldInput} ${formData.email ? styles.filled : ''} ${emailError ? styles.fieldError : ''}`}
              type="email"
              value={formData.email}
              onChange={(e) => { updateField('email', e.target.value); setEmailError(''); }}
              placeholder="you@email.com"
            />
            {emailError ? (
              <div className={styles.errorHint}>{emailError}</div>
            ) : (
              <div className={styles.fieldHint}>{isSignIn ? 'The email you signed up with' : 'Use the email you registered for the event with'}</div>
            )}
          </div>
          {!isSignIn && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Codeword</label>
              <input
                className={`${styles.fieldInput} ${codeword ? styles.filled : ''} ${codewordError ? styles.fieldError : ''}`}
                type="text"
                value={codeword}
                onChange={(e) => { setCodeword(e.target.value); setCodewordError(false); }}
                placeholder="Enter the event codeword"
              />
              {codewordError && (
                <div className={styles.errorHint}>Codeword is incorrect. Try again.</div>
              )}
              <div className={styles.fieldHint}>Ask an organiser if you don&apos;t know it</div>
            </div>
          )}
          {signInError && (
            <div className={styles.errorHint}>{signInError}</div>
          )}
        </div>
        <div className={styles.bottomAction}>
          <Button onClick={handleNext} icon="→" disabled={loading}>
            {loading ? (isSignIn ? 'Signing in...' : 'Checking...') : isSignIn ? 'Sign in' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackFromStep2}>← Back</button>
        <h1 className={styles.title}>About<br />You</h1>
        <p className={styles.subtitle}>So your match can find you.</p>
      </div>
      <div className={styles.formBody}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Your name</label>
          <input
            className={`${styles.fieldInput} ${formData.name ? styles.filled : ''}`}
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="How should we introduce you?"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>What are you wearing today?</label>
          <input
            className={`${styles.fieldInput} ${formData.wearing ? styles.filled : ''}`}
            type="text"
            value={formData.wearing}
            onChange={(e) => updateField('wearing', e.target.value)}
            placeholder="So they can find you!"
          />
          <div className={styles.fieldHint}>Be specific — this is how your match finds you</div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>One fun fact about you</label>
          <input
            className={`${styles.fieldInput} ${formData.funFact ? styles.filled : ''}`}
            type="text"
            value={formData.funFact}
            onChange={(e) => updateField('funFact', e.target.value)}
            placeholder="Make it interesting..."
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>I&apos;m here for...</label>
          <div className={styles.interestGrid}>
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                className={`${styles.interestTag} ${formData.interests.includes(interest) ? styles.selected : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bottomAction}>
        <Button onClick={handleContinue} icon="▶">Save & continue</Button>
        {onSignOut && (
          <button className={styles.signOutBtn} onClick={onSignOut}>
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
