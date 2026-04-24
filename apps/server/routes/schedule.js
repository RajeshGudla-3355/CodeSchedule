const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

const TOPICS_DIR = path.resolve(__dirname, '../../../packages/topics');

const PRETTY_NAMES = {
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
  react: 'React',
  css: 'CSS'
};

function loadLanguage(language) {
  const file = path.join(TOPICS_DIR, `${language}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

router.get('/languages', auth, (_req, res) => {
  if (!fs.existsSync(TOPICS_DIR)) return res.json({ languages: [] });

  const languages = fs
    .readdirSync(TOPICS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const key = f.replace(/\.json$/, '');
      const topics = loadLanguage(key) || [];
      return {
        key,
        name: PRETTY_NAMES[key] || key,
        topicCount: topics.length
      };
    });

  res.json({ languages });
});

router.get('/progress', auth, (req, res) => {
  const allCompleted = req.user.completedTopics || [];

  const progress = req.user.subscriptions.map((sub) => {
    const topics = loadLanguage(sub.language) || [];
    const completedForLang = allCompleted
      .filter((ct) => ct.language === sub.language)
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .map((ct) => ({
        topicIndex: ct.topicIndex,
        topicTitle: ct.topicTitle,
        sentAt: ct.sentAt
      }));

    return {
      language: sub.language,
      name: PRETTY_NAMES[sub.language] || sub.language,
      currentTopicIndex: sub.currentTopicIndex,
      totalTopics: topics.length,
      isActive: sub.isActive,
      startedAt: sub.startedAt,
      completedAt: sub.completedAt,
      percentage: topics.length ? Math.round((sub.currentTopicIndex / topics.length) * 100) : 0,
      completedCount: completedForLang.length,
      completedTopics: completedForLang
    };
  });

  const totalCompleted = allCompleted.length;

  res.json({ progress, totalCompleted });
});

module.exports = router;
