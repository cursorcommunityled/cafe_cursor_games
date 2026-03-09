'use client';

import Button from '../ui/Button';
import Animate from '../ui/Animate';
import styles from './MenuScreen.module.css';

interface MenuScreenProps {
  onBack: () => void;
}

interface MenuItem {
  name: string;
  desc: string;
  comment?: string;
}

interface MenuSection {
  emoji?: string;
  category: string;
  categoryZh: string;
  lines: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    category: 'Coffee',
    categoryZh: '咖啡',
    lines: 'ln 1–6',
    items: [
      { name: 'The Composer', desc: 'Americano', comment: 'bold, no fluff, gets the job done' },
      { name: '\u201CVibe Code\u201D Piccolo', desc: 'Piccolo', comment: "you don\u2019t know what\u2019s in it, but it works" },
      { name: 'Tab Tab Tab Mocha', desc: 'Mocha', comment: 'you just keep accepting' },
      { name: 'The Pro Plan Latte', desc: 'Latte', comment: '$20/month and you still want more' },
      { name: 'One-Shot Espresso', desc: 'Espresso', comment: 'nailed it on the first prompt' },
      { name: 'Flat WHite Screen', desc: 'Flat White', comment: 'something crashed, but it tastes great' },
    ],
  },
  {
    emoji: '🍫',
    category: 'Chocolate',
    categoryZh: '朱古力',
    lines: 'ln 7–8',
    items: [
      { name: '\u201CIt Works on My Machine\u201D', desc: 'Hot Chocolate', comment: 'warm, comforting, absolutely will not reproduce in production' },
      { name: 'git blame', desc: 'Iced Chocolate', comment: 'cold and bitter, just like finding out it was your commit' },
    ],
  },
  {
    emoji: '🍵',
    category: 'Tea',
    categoryZh: '茶',
    lines: 'ln 9–10',
    items: [
      { name: '\u201CI\u2019ll Fix It Later\u201D', desc: 'Hot Tea', comment: "you won\u2019t. but it\u2019s soothing." },
      { name: 'Deprecated', desc: 'Iced Tea', comment: 'still available, still works, nobody knows why' },
    ],
  },
  {
    emoji: '🥤',
    category: 'Mixed Juice',
    categoryZh: '果汁',
    lines: 'ln 11–12',
    items: [
      { name: 'The 200k Context Window', desc: 'Apple · Peach · Kiwi · Mango', comment: 'we shoved everything in there' },
      { name: 'The Merge Conflict', desc: 'Apple · Guava · Blackcurrant · Strawberry', comment: 'four fruits, none of them agree' },
    ],
  },
  {
    emoji: '🍹',
    category: 'Mocktail',
    categoryZh: '無酒精雞尾酒',
    lines: 'ln 13–14',
    items: [
      { name: 'The Hallucination Blush', desc: 'OJ · Cranberry · Lemon · Soda', comment: 'looks and tastes like the real thing. it is not.' },
      { name: 'sudo rm -rf Mojito', desc: 'Lime · Mint · Soda Water', comment: 'dangerously refreshing, no going back' },
    ],
  },
  {
    emoji: '🍜',
    category: 'Noodles',
    categoryZh: '麵',
    lines: 'ln 15–17',
    items: [
      { name: 'The Hotfix', desc: 'Dandan Noodle · 擔擔拉麵', comment: 'spicier than a production hotfix at 2am' },
      { name: 'Three Threads', desc: 'Noodle with Three Shredded Vegetables · 三絲拌麵', comment: 'concurrency never tasted this good' },
      { name: 'Wonton as a Service', desc: 'Pork and Vegetable Wonton Noodle Soup (Clear / Spicy) · 菜肉雲吞麵', comment: 'packets wrapped and delivered. TCP/delicious.' },
    ],
  },
  {
    emoji: '💧',
    category: 'Soda Water',
    categoryZh: '梳打水',
    lines: 'ln 18',
    items: [
      { name: 'Cursor Free Tier', desc: 'Soda Water' },
    ],
  },
];

export default function MenuScreen({
  onBack,
}: MenuScreenProps) {
  let lineNum = 0;

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <Animate delay={100}>
          <h1 className={styles.title}>Menu</h1>
          <p className={styles.subtitle}>Cafe Cursor Hong Kong</p>
        </Animate>

        {MENU_SECTIONS.map((section, si) => (
          <Animate key={section.category} delay={200 + si * 100}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>
                  {section.emoji && <span className={styles.sectionEmoji}>{section.emoji}</span>}
                  {section.category}
                  <span className={styles.sectionZh}> · {section.categoryZh}</span>
                </span>
                <span className={styles.sectionLines}>{section.lines}</span>
              </div>
              <div className={styles.itemList}>
                {section.items.map(item => {
                  lineNum++;
                  return (
                    <div key={item.name} className={styles.item}>
                      <span className={styles.lineNum}>{lineNum}</span>
                      <div className={styles.itemBody}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemDesc}>{item.desc}</div>
                        {item.comment && (
                          <div className={styles.itemComment}>
                            <span className={styles.commentSlashes}>//</span> {item.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Animate>
        ))}
      </div>

      <div className={styles.bottom}>
        <Button variant="secondary" onClick={onBack}>← Back to home</Button>
      </div>
    </div>
  );
}
