'use client';

import { useState, useCallback, useEffect } from 'react';
import Button from '../ui/Button';
import Animate from '../ui/Animate';
import {
  fetchStories,
  submitStory,
  toggleVote,
  getVotesUsedCount,
} from '@/lib/db';
import type { StoryRow } from '@/lib/db';
import styles from './WorstStoryScreen.module.css';

interface WorstStoryScreenProps {
  profileId: string | null;
  name: string;
  onBack: () => void;
}

const MAX_VOTES = 3;

export default function WorstStoryScreen({
  profileId,
  name,
  onBack,
}: WorstStoryScreenProps) {
  const [tab, setTab] = useState<'submit' | 'vote'>('submit');
  const [storyText, setStoryText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [votesUsed, setVotesUsed] = useState(0);
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    async function load() {
      const [storiesData, votesCount] = await Promise.all([
        fetchStories(profileId!),
        getVotesUsedCount(profileId!),
      ]);
      if (!cancelled) {
        setStories(storiesData);
        setVotesUsed(votesCount);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profileId]);

  const authorLabel = name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : '');

  const isFirstStory = !stories.some(s => s.profile_id === profileId);
  const canSubmit = storyText.trim().length >= 20;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !profileId) return;
    setSubmitting(true);

    const newStory = await submitStory(profileId, authorLabel, storyText.trim());
    if (newStory) {
      setStories(prev => [newStory, ...prev]);
    }

    setSubmitted(true);
    setSubmitting(false);
  }, [canSubmit, storyText, profileId, authorLabel]);

  const handleVote = useCallback(async (storyId: string) => {
    if (!profileId) return;

    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    if (story.profile_id === profileId) return;
    if (story.voted_by_me) return;
    if (votesUsed >= MAX_VOTES) return;

    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, vote_count: s.vote_count + 1, voted_by_me: true } : s
    ));
    setVotesUsed(v => v + 1);

    const result = await toggleVote(storyId, profileId);

    if (result === null) {
      setStories(prev => prev.map(s =>
        s.id === storyId ? { ...s, vote_count: s.vote_count, voted_by_me: false } : s
      ));
      setVotesUsed(v => v - 1);
    }
  }, [profileId, stories, votesUsed]);

  const sortedStories = [...stories].sort((a, b) =>
    sortBy === 'top'
      ? b.vote_count - a.vote_count
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const votesRemaining = MAX_VOTES - votesUsed;

  return (
    <div className={styles.screen}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'submit' ? styles.tabActive : ''}`}
          onClick={() => setTab('submit')}
        >
          Submit
        </button>
        <button
          className={`${styles.tab} ${tab === 'vote' ? styles.tabActive : ''}`}
          onClick={() => setTab('vote')}
        >
          Vote
          {stories.length > 0 && <span className={styles.tabCount}>{stories.length}</span>}
        </button>
      </div>

      {tab === 'submit' ? (
        <div className={styles.main}>
          {!submitted ? (
            <>
              <Animate delay={100}>
                <h1 className={styles.title}>Worst Dev<br />Story</h1>
                <p className={styles.subtitle}>
                  We&apos;ve all been there. The bug that haunted you, the deploy that broke prod, the git force push that ended friendships.
                </p>
              </Animate>

              <Animate delay={300}>
                <div className={styles.inputWrap}>
                  <textarea
                    className={styles.textarea}
                    value={storyText}
                    onChange={e => setStoryText(e.target.value)}
                    placeholder="It was 3am on a Friday..."
                    rows={5}
                    maxLength={280}
                  />
                  <div className={styles.charCount}>{storyText.length}/280</div>
                </div>
              </Animate>

              <Animate delay={400}>
                <div className={styles.submitArea}>
                  <Button onClick={handleSubmit} icon="▶" disabled={submitting || !canSubmit}>
                    {submitting ? 'Submitting...' : 'Submit story'}
                  </Button>
                  {!canSubmit && storyText.length > 0 && (
                    <div className={styles.charHint}>Min 20 characters</div>
                  )}
                </div>
              </Animate>
            </>
          ) : (
            <Animate delay={0}>
              <div className={styles.successWrap}>
                <div className={styles.successIcon}>💀</div>
                <h2 className={styles.successTitle}>Submitted!{isFirstStory ? ' +5 XP' : ''}</h2>
              <p className={styles.successDesc}>
                Your horror story is live. Now vote for your 3 favorites — each vote gives the author +5 XP.
              </p>
                <button className={styles.goVoteBtn} onClick={() => setTab('vote')}>
                  Browse stories →
                </button>
              </div>
            </Animate>
          )}
        </div>
      ) : (
        <div className={styles.voteMain}>
          <div className={styles.voteHeader}>
            <div className={styles.voteInfo}>
              <span className={styles.voteBadge}>
                {votesRemaining} vote{votesRemaining !== 1 ? 's' : ''} left
              </span>
              <span className={styles.voteHint}>
                +1 XP per vote · authors earn +5 XP
              </span>
            </div>
            <div className={styles.sortToggle}>
              <button
                className={`${styles.sortBtn} ${sortBy === 'top' ? styles.sortActive : ''}`}
                onClick={() => setSortBy('top')}
              >
                Top
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === 'new' ? styles.sortActive : ''}`}
                onClick={() => setSortBy('new')}
              >
                New
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Loading stories...</div>
          ) : sortedStories.length === 0 ? (
            <div className={styles.emptyState}>
              No stories yet. Be the first to share!
            </div>
          ) : (
            <div className={styles.storyList}>
              {sortedStories.map((s, i) => (
                <Animate key={s.id} delay={i * 60}>
                  <div className={`${styles.storyCard} ${s.voted_by_me ? styles.storyVoted : ''}`}>
                    <button
                      className={`${styles.voteBtn} ${s.voted_by_me ? styles.voteBtnActive : ''}`}
                      onClick={() => handleVote(s.id)}
                      disabled={s.profile_id === profileId || s.voted_by_me || votesUsed >= MAX_VOTES}
                    >
                      <span className={styles.voteArrow}>▲</span>
                      <span className={styles.voteCount}>{s.vote_count}</span>
                    </button>
                    <div className={styles.storyContent}>
                      <p className={styles.storyText}>{s.text}</p>
                      <span className={styles.storyAuthor}>— {s.author_name}</span>
                    </div>
                  </div>
                </Animate>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.bottom}>
        <Button variant="secondary" onClick={onBack}>← Back to home</Button>
      </div>
    </div>
  );
}
