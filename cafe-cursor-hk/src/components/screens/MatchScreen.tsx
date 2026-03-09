'use client';

import { useEffect, useMemo, useRef } from 'react';
import Button from '../ui/Button';
import Animate from '../ui/Animate';
import styles from './MatchScreen.module.css';

interface ProfileData {
  name: string;
  wearing: string;
  funFact: string;
}

interface MatchScreenProps {
  myProfile: ProfileData;
  matchProfile: ProfileData;
  onLogMeet: () => void;
}

const ALL_CONVO_STARTERS = [
  // Original
  "What's the best thing that happened to you this week?",
  "If you could move anywhere in HK, where would it be?",
  "What's something you changed your mind about recently?",
  "What skill are you quietly trying to get good at?",
  "What's the most unexpected place you've found community?",

  // Tech & AI vibes
  "What's one thing AI still can't do that surprises you?",
  "Has Cursor changed how you think, not just how you work?",
  "What tool are you low-key obsessed with right now?",
  "What's a workflow you automated that you're weirdly proud of?",
  "What's the last thing you Googled that made you feel dumb?",
  "What's a tech trend everyone's hyped about that you're skeptical of?",
  "What's the most 'wait, it can do THAT?' moment you've had with AI?",
  "What's something you used to do manually that you'd never go back to?",

  // Work & career
  "What does your job title say vs. what you actually do?",
  "What's a career move you took that seemed weird but paid off?",
  "What's the best piece of career advice you've ignored?",
  "What's something your non-tech friends think you do all day?",
  "What's a meeting that could've been a Slack message — or just not existed?",

  // Ideas & curiosity
  "What problem in HK do you think tech could actually solve?",
  "What app or product do you wish existed but no one's built yet?",
  "If you had a free month and unlimited compute, what would you build?",
  "What's a startup idea you'd be embarrassed to pitch but secretly love?",
  "What industry outside tech do you think is about to get disrupted?",

  // Personal & fun
  "What's your go-to way to actually disconnect from screens?",
  "What's a hobby you picked up post-COVID that stuck?",
  "What's something you're better at than most people but never talk about?",
  "What's the last rabbit hole the internet sent you down?",
  "Night owl or early bird — and has remote work changed that?",

  // HK-specific
  "What's a hidden gem in HK that tourists never find?",
  "What's something about working in HK's tech scene that outsiders don't get?",
  "If you were pitching HK to a tech talent considering moving here, what's your angle?",
  "What's a local problem you'd love to see a homegrown startup tackle?",

  // Icebreakers with a twist
  "What's your hot take about tech that would get you cancelled on LinkedIn?",
  "What would your 15-year-old self think of your job right now?",
  "What's the most useful thing you've learned from someone outside your field?",
  "What's a question you wish someone would ask you?",

  // Light & fun
  "What's your go-to order when you can't decide?",
  "Beach, mountains, or just never leaving your couch?",
  "What's a food you hated as a kid that you now love?",
  "What's the most useless talent you have?",
  "Are you a 'plans two weeks ahead' or 'texts at 7pm for dinner tonight' person?",
  "What's the last thing you did purely because it made you happy?",
  "Window seat or aisle — and what does that say about you?",
  "What's a city you visited once that still lives in your head rent-free?",
  "What's your signature dish — even if it's just toast?",
  "What era of your life had the best playlist?",

  // Deep connection
  "Given the choice of anyone in the world, whom would you want as a dinner guest?",
  "Would you like to be famous? In what way?",
  "Before making a phone call, do you ever rehearse what you're going to say? Why?",
  "What would constitute a 'perfect' day for you?",
  "When did you last sing to yourself? To someone else?",
  "If you were able to live to 90 and retain either the mind or body of a 30-year-old, which would you want?",
  "Do you have a secret hunch about how you'll die?",
  "Name three things you and your partner appear to have in common.",
  "For what in your life do you feel most grateful?",
  "If you could change anything about the way you were raised, what would it be?",
  "Take four minutes and tell your partner your life story in as much detail as possible.",
  "If you could wake up tomorrow having gained any one quality or ability, what would it be?",
  "If a crystal ball could tell you the truth about yourself, your life, the future, or anything else, what would you want to know?",
  "Is there something you've dreamed of doing for a long time? Why haven't you done it?",
  "What is the greatest accomplishment of your life?",
  "What do you value most in a friendship?",
  "What is your most treasured memory?",
  "What is your most terrible memory?",
  "If you knew that in one year you would die suddenly, would you change anything about the way you're living now?",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function MatchScreen({ myProfile, matchProfile, onLogMeet }: MatchScreenProps) {
  const flashRef = useRef<HTMLDivElement>(null);
  const starters = useMemo(() => pickRandom(ALL_CONVO_STARTERS, 5), []);

  useEffect(() => {
    if (flashRef.current) {
      flashRef.current.classList.add(styles.flashAnimate);
      const timer = setTimeout(() => {
        flashRef.current?.classList.remove(styles.flashAnimate);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={styles.screen}>
      <div ref={flashRef} className={styles.flash} />
      <div className={styles.header}>
        <Animate delay={200}>
          <div className={styles.badge}>Match found</div>
        </Animate>
        <Animate delay={350}>
          <h1 className={styles.title}>Go say<br />hello.</h1>
        </Animate>
        <Animate delay={450}>
          <p className={styles.sub}>Use these cards to introduce yourself</p>
        </Animate>
      </div>
      <div className={styles.scroll}>
        <Animate delay={550}>
          <div className={`${styles.profileCard} ${styles.me}`}>
            <div className={styles.cardName}>{myProfile.name}</div>
            <div className={styles.cardDetail}>
              <span className={styles.cardIcon}>▮</span>
              <div>
                <span className={styles.cardLabel}>Wearing</span>
                <span className={styles.cardValue}>{myProfile.wearing}</span>
              </div>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardIcon}>★</span>
              <div>
                <span className={styles.cardLabel}>Fun fact</span>
                <span className={styles.cardValue}>{myProfile.funFact}</span>
              </div>
            </div>
          </div>
        </Animate>

        <Animate delay={700}>
          <div className={`${styles.profileCard} ${styles.them}`}>
            <div className={styles.cardName}>{matchProfile.name}</div>
            <div className={styles.cardDetail}>
              <span className={styles.cardIcon}>▮</span>
              <div>
                <span className={styles.cardLabel}>Wearing</span>
                <span className={styles.cardValue}>{matchProfile.wearing}</span>
              </div>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardIcon}>★</span>
              <div>
                <span className={styles.cardLabel}>Fun fact</span>
                <span className={styles.cardValue}>{matchProfile.funFact}</span>
              </div>
            </div>
          </div>
        </Animate>

        <Animate delay={900}>
          <div className={styles.convoSection}>
            <div className={styles.sectionLabel}>Conversation starters</div>
            <div className={styles.cardsScroll}>
              {starters.map((text, i) => (
                <div key={i} className={styles.convoCard}>
                  <div className={styles.convoNum}>{String(i + 1).padStart(2, '0')}</div>
                  <div className={styles.convoText}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </Animate>
      </div>
      <Animate delay={1000}>
        <div className={styles.bottomAction}>
          <Button onClick={onLogMeet} icon="▶">We met — log it</Button>
        </div>
      </Animate>
    </div>
  );
}
