# Cafe Cursor HK — Product Plan

## What is it?

Cafe Cursor HK is a in-venue social experience app for Cafe Cursor's Hong Kong location. It turns solo cafe visits into serendipitous human connections — pairing two strangers together for a spontaneous conversation, then rewarding them for showing up.

The core loop is simple: show up, opt in, meet someone, reflect, repeat. After enough meetings, you earn free coffee.

---

## How the Game Works

### 1. Create your profile
When you arrive at the cafe, you open the app and fill in a short profile:
- **Email** — for reward notifications
- **Name** — how you'll be introduced to your match
- **What you're wearing** — so you can physically find each other in the cafe
- **One fun fact** — an icebreaker that travels ahead of you
- **Why you're here** — Good conversation / Networking / Creative collab / Just curious

Your profile persists across visits. You only set it up once.

---

### 2. Go open
When you're ready to meet someone, you tap **"I'm open to meeting"**. This puts you in the matching pool.

You stay in the pool until:
- A match is found, or
- You tap to opt out

---

### 3. Matching
The system looks for another cafe guest who is also currently open to meeting someone. When two people are both ready at the same time, they are matched instantly.

The match is **mutual and simultaneous** — both users receive the notification at the same time.

> Future: matching could weight by stated intent (e.g. two "networking" people together) or by visit frequency (regulars meet newcomers first).

---

### 4. The match screen
Once matched, both users see:
- **Their own profile card** — name, outfit, fun fact
- **Their match's profile card** — name, outfit, fun fact
- **5 conversation starter cards** (horizontally scrollable)

The outfit detail is the key findability mechanic — it lets two strangers locate each other in a busy cafe without awkwardness.

Sample conversation starters:
1. What's the best thing that happened to you this week?
2. If you could move anywhere in HK, where would it be?
3. What's something you changed your mind about recently?
4. What skill are you quietly trying to get good at?
5. What's the most unexpected place you've found community?

---

### 5. The conversation
There's no timer, no pressure. The app steps back entirely at this point. The two people meet, talk, and use the conversation cards however feels natural — as prompts, as games, or not at all.

---

### 6. Log what you learnt
After the conversation, each user independently opens the app and logs **one interesting thing they learned about the other person**. This stays private — it's a personal reflection, not a review of the other person.

Tapping **Submit** awards **+10 XP**.

---

### 7. XP & the reward system

| Action | XP |
|---|---|
| Complete your first profile | +5 XP |
| Log a conversation | +10 XP |
| Return visit (once per day) | +2 XP |

**At 30 XP**, the user unlocks a free bag of Cursor coffee beans, redeemable at the counter with a single-use code. This requires roughly 2–3 completed conversations.

The XP bar is always visible on the post-meet screen so progress feels tangible after every interaction.

> Future reward tiers could include: a free drink at 60 XP, a curated "Cursor blend" at 100 XP, or a seat at a hosted evening event.

---

## User States

```
New user
  → Create profile
    → Open to meeting
      → Waiting for match
        → Matched
          → Conversation
            → Log reflection → +10 XP
              → Check progress
                → < 30 XP: meet again
                → ≥ 30 XP: redeem coffee reward
```

---

## Design Principles

**Low friction, high intention.** The opt-in mechanic means every match is between two people who actively chose to be open. There are no awkward cold approaches.

**The cafe is the context.** The app does not try to replicate the experience digitally — it just facilitates a physical one. Once the match is made, the app steps aside.

**Reflection creates retention.** The "log what you learned" step is not just gamification — it deepens the memory of the conversation and gives people a reason to come back.

**Coffee as honest reward.** The reward is the product itself. No discounts, no points schemes — just a bag of the coffee you're already drinking.

---

## Out of scope (v1)

- Chat between matched users (intentionally excluded — this is about in-person meeting)
- User profiles being visible before matching (privacy by default)
- Ratings or reviews of other users
- Booking or reserving a table
