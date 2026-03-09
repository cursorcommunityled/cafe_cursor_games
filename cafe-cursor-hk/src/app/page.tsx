'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SplashScreen from '@/components/screens/SplashScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import ClaimCreditsScreen from '@/components/screens/ClaimCreditsScreen';
import MenuScreen from '@/components/screens/MenuScreen';
import WorstStoryScreen from '@/components/screens/WorstStoryScreen';
import ReadyScreen from '@/components/screens/ReadyScreen';
import WaitingScreen from '@/components/screens/WaitingScreen';
import MatchScreen from '@/components/screens/MatchScreen';
import PostMeetScreen from '@/components/screens/PostMeetScreen';
import XPScreen from '@/components/screens/XPScreen';
import XPInfoScreen from '@/components/screens/XPInfoScreen';
import RewardScreen from '@/components/screens/RewardScreen';
import {
  getStoredProfileId,
  clearStoredProfileId,
  getProfile,
  getProfileByEmail,
  upsertProfile,
  updateProfile,
  enterMatchingPool,
  leaveMatchingPool,
  subscribeToMatches,
  getMatchPartnerProfile,
  submitReflection,
  getOrCreateReward,
  claimCreditUrl,
  refreshXp,
  setStoredProfileId,
  isEmailAllowed,
  getMatchCount,
  getMemberCount,
} from '@/lib/db';
import type { ProfileRow, MatchRow } from '@/lib/db';
import ProfileBar from '@/components/ui/ProfileBar';
import styles from './page.module.css';

type Screen = 'splash' | 'profile' | 'welcome' | 'credits' | 'menu' | 'story' | 'ready' | 'waiting' | 'match' | 'post' | 'xp' | 'xpinfo' | 'reward';

const SCREEN_ORDER: Screen[] = ['splash', 'profile', 'welcome', 'credits', 'menu', 'story', 'ready', 'waiting', 'match', 'post', 'xp', 'xpinfo', 'reward'];
const TARGET_XP = 40;

export interface ProfileData {
  email: string;
  name: string;
  wearing: string;
  funFact: string;
  interests: string[];
}

const DEFAULT_PROFILE: ProfileData = {
  email: '',
  name: '',
  wearing: '',
  funFact: '',
  interests: [],
};

function profileRowToData(row: ProfileRow): ProfileData {
  return {
    email: row.email,
    name: row.name,
    wearing: row.wearing,
    funFact: row.fun_fact,
    interests: row.interests,
  };
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [conversations, setConversations] = useState(0);
  const [transition, setTransition] = useState<'enter-forward' | 'enter-back' | 'none'>('none');
  const [hydrated, setHydrated] = useState(false);
  const prevScreenRef = useRef<Screen>('splash');
  const returnScreenRef = useRef<Screen>('welcome');

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [matchProfile, setMatchProfile] = useState<{ name: string; wearing: string; funFact: string } | null>(null);
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [creditUrl, setCreditUrl] = useState<string | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  const matchChannelRef = useRef<ReturnType<typeof subscribeToMatches> | null>(null);

  useEffect(() => {
    getMatchCount().then(setConnectionCount);
    getMemberCount().then(setMemberCount);
  }, []);

  // Load profile from Supabase on mount
  useEffect(() => {
    async function loadProfile() {
      const storedId = getStoredProfileId();
      if (storedId) {
        const row = await getProfile(storedId);
        if (row) {
          setProfileId(row.id);
          setProfile(profileRowToData(row));
          setXp(row.xp);
          setConversations(row.conversations);

          if (row.name) {
            setCurrentScreen('welcome');
            prevScreenRef.current = 'welcome';
          }
        }
      }
      setHydrated(true);
    }
    loadProfile();
  }, []);

  const goTo = useCallback((screen: Screen) => {
    const fromIdx = SCREEN_ORDER.indexOf(prevScreenRef.current);
    const toIdx = SCREEN_ORDER.indexOf(screen);
    const direction = toIdx >= fromIdx ? 'enter-forward' : 'enter-back';

    setTransition(direction);
    setCurrentScreen(screen);
    prevScreenRef.current = screen;
    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(() => setTransition('none'), 400);
  }, []);

  const syncXpFromDb = useCallback(async () => {
    if (!profileId) return;
    const data = await refreshXp(profileId);
    if (data) {
      setXp(data.xp);
      setConversations(data.conversations);
    }
  }, [profileId]);

  const goHome = useCallback(async () => {
    syncXpFromDb();
    goTo('welcome');
  }, [syncXpFromDb, goTo]);

  const goToEditProfile = useCallback(() => {
    returnScreenRef.current = prevScreenRef.current === 'profile' ? 'welcome' : prevScreenRef.current;
    goTo('profile');
  }, [goTo]);

  const xpInfoReturnRef = useRef<Screen>('welcome');
  const goToXPInfo = useCallback(() => {
    xpInfoReturnRef.current = prevScreenRef.current === 'xpinfo' ? 'welcome' : prevScreenRef.current;
    goTo('xpinfo');
  }, [goTo]);

  const handleSignOut = useCallback(() => {
    clearStoredProfileId();
    setProfile(DEFAULT_PROFILE);
    setProfileId(null);
    setXp(0);
    setConversations(0);
    setCurrentMatchId(null);
    setMatchProfile(null);
    setRewardCode(null);
    setCreditUrl(null);
    matchChannelRef.current?.unsubscribe();
    matchChannelRef.current = null;
    goTo('splash');
  }, [goTo]);

  const handleProfileContinue = useCallback(() => {
    goTo(returnScreenRef.current);
  }, [goTo]);

  const handleSignIn = useCallback(async (email: string): Promise<boolean> => {
    const row = await getProfileByEmail(email);
    if (!row) return false;
    setStoredProfileId(row.id);
    setProfileId(row.id);
    setProfile(profileRowToData(row));
    setXp(row.xp);
    setConversations(row.conversations);
    goTo('welcome');
    return true;
  }, [goTo]);

  // Save or update profile in Supabase
  const handleUpdateProfile = useCallback(async (newProfile: ProfileData) => {
    setProfile(newProfile);

    if (profileId) {
      const updated = await updateProfile(profileId, {
        name: newProfile.name,
        wearing: newProfile.wearing,
        funFact: newProfile.funFact,
        interests: newProfile.interests,
      });
      if (updated) {
        setXp(updated.xp);
        setConversations(updated.conversations);
      }
    } else {
      const created = await upsertProfile(newProfile);
      if (created) {
        setProfileId(created.id);
        setConversations(created.conversations);
        setXp(created.xp);
      }
    }
  }, [profileId]);

  // Enter the matching pool and start listening for matches
  const handleStartMatching = useCallback(async () => {
    if (!profileId) return;

    goTo('waiting');

    const immediateMatch = await enterMatchingPool(profileId);

    if (immediateMatch) {
      setCurrentMatchId(immediateMatch.match_id);
      setMatchProfile({
        name: immediateMatch.name,
        wearing: immediateMatch.wearing,
        funFact: immediateMatch.fun_fact,
      });
      goTo('match');
      return;
    }

    // No immediate match — subscribe to realtime for when someone else joins
    if (matchChannelRef.current) {
      matchChannelRef.current.unsubscribe();
    }

    matchChannelRef.current = subscribeToMatches(profileId, async (match: MatchRow) => {
      const partner = await getMatchPartnerProfile(match, profileId);
      if (partner) {
        setCurrentMatchId(match.id);
        setMatchProfile({
          name: partner.name,
          wearing: partner.wearing,
          funFact: partner.fun_fact,
        });
        goTo('match');
      }
      matchChannelRef.current?.unsubscribe();
      matchChannelRef.current = null;
    });
  }, [profileId, goTo]);

  // Leave matching pool when navigating away from waiting
  const handleLeaveWaiting = useCallback(async () => {
    if (profileId) {
      await leaveMatchingPool(profileId);
    }
    if (matchChannelRef.current) {
      matchChannelRef.current.unsubscribe();
      matchChannelRef.current = null;
    }
    goHome();
  }, [profileId, goHome]);

  // Submit reflection and earn XP
  const handleSubmitReflection = useCallback(async (reflection: string) => {
    if (reflection.trim() && profileId && currentMatchId) {
      const newXp = await submitReflection(currentMatchId, profileId, reflection);
      if (newXp !== null) {
        setXp(newXp);
        setConversations(prev => prev + 1);
      }
    }
    goTo('xp');
  }, [goTo, profileId, currentMatchId]);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      matchChannelRef.current?.unsubscribe();
    };
  }, []);

  const handleClaimCredits = useCallback(async () => {
    goTo('credits');
    if (profileId && !creditUrl) {
      setCreditLoading(true);
      const url = await claimCreditUrl(profileId);
      setCreditUrl(url);
      setCreditLoading(false);
    }
  }, [profileId, creditUrl, goTo]);

  const handleRetryClaimCredits = useCallback(async () => {
    if (!profileId) return;
    setCreditLoading(true);
    const url = await claimCreditUrl(profileId);
    setCreditUrl(url);
    setCreditLoading(false);
  }, [profileId]);

  const handleViewReward = useCallback(async () => {
    if (profileId) {
      const code = await getOrCreateReward(profileId);
      setRewardCode(code);
    }
    goTo('reward');
  }, [profileId, goTo]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            connectionCount={connectionCount}
            memberCount={memberCount}
            onStart={() => { setAuthMode('signup'); returnScreenRef.current = 'welcome'; goTo('profile'); }}
            onSignIn={() => { setAuthMode('signin'); returnScreenRef.current = 'welcome'; goTo('profile'); }}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            mode={profileId ? undefined : authMode}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSignIn={handleSignIn}
            onCheckEmail={isEmailAllowed}
            onContinue={handleProfileContinue}
            onBack={() => goTo(returnScreenRef.current === 'welcome' && !profile.name ? 'splash' : returnScreenRef.current)}
            onSignOut={profileId ? handleSignOut : undefined}
          />
        );
      case 'welcome':
        return (
          <WelcomeScreen
            name={profile.name || 'You'}
            onClaimCredits={handleClaimCredits}
            onViewMenu={() => goTo('menu')}
            onMeetFriend={() => goTo('ready')}
            onWorstStory={() => goTo('story')}
          />
        );
      case 'credits':
        return (
          <ClaimCreditsScreen
            creditUrl={creditUrl}
            loading={creditLoading}
            onBack={goHome}
            onRetry={handleRetryClaimCredits}
          />
        );
      case 'menu':
        return (
          <MenuScreen
            onBack={goHome}
          />
        );
      case 'story':
        return (
          <WorstStoryScreen
            profileId={profileId}
            name={profile.name || 'You'}
            onBack={goHome}
          />
        );
      case 'ready':
        return (
          <ReadyScreen
            profile={profile}
            onMeet={handleStartMatching}
            onEditProfile={goToEditProfile}
          />
        );
      case 'waiting':
        return (
          <WaitingScreen
            onHome={handleLeaveWaiting}
          />
        );
      case 'match':
        return (
          <MatchScreen
            myProfile={profile}
            matchProfile={matchProfile || { name: '...', wearing: '...', funFact: '...' }}
            onLogMeet={() => goTo('post')}
          />
        );
      case 'post':
        return (
          <PostMeetScreen
            matchName={matchProfile?.name || 'your match'}
            onSubmit={handleSubmitReflection}
          />
        );
      case 'xp':
        return (
          <XPScreen
            currentXP={xp}
            xpGained={10}
            targetXP={TARGET_XP}
            onMeetAnother={goHome}
            onViewReward={handleViewReward}
          />
        );
      case 'xpinfo':
        return (
          <XPInfoScreen
            xp={xp}
            targetXP={TARGET_XP}
            onBack={() => goTo(xpInfoReturnRef.current)}
          />
        );
      case 'reward':
        return (
          <RewardScreen
            conversationCount={conversations}
            rewardCode={rewardCode}
            onBackToStart={() => goTo('splash')}
          />
        );
    }
  };

  if (!hydrated) {
    return (
      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.loading}>
            <img
              src="https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/AVATAR_CIRCLE_DARK.png"
              alt="Cursor"
              className={styles.loadingLogo}
            />
          </div>
        </div>
      </main>
    );
  }

  const showProfileBar = currentScreen !== 'splash' && currentScreen !== 'profile' && profile.name;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        {showProfileBar && (
          <ProfileBar
            name={profile.name || 'You'}
            xp={xp}
            targetXP={TARGET_XP}
            onEditProfile={goToEditProfile}
            onHome={goHome}
            onXPClick={goToXPInfo}
          />
        )}
        <div
          key={currentScreen}
          className={`${styles.screenContainer} ${
            transition === 'enter-forward' ? styles.enterForward :
            transition === 'enter-back' ? styles.enterBack : ''
          }`}
        >
          {renderScreen()}
        </div>
      </div>
    </main>
  );
}
