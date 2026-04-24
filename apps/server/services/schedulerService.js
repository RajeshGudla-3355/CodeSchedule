const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { sendEmail, buildEmailTemplate, buildCompletionTemplate } = require('./emailService');

const TOPICS_DIR = path.resolve(__dirname, '../../../packages/topics');

const PRETTY_NAMES = {
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
  react: 'React',
  css: 'CSS'
};

const topicCache = new Map();

function loadTopics(language) {
  if (topicCache.has(language)) return topicCache.get(language);
  const file = path.join(TOPICS_DIR, `${language}.json`);
  if (!fs.existsSync(file)) return null;
  const topics = JSON.parse(fs.readFileSync(file, 'utf-8'));
  topicCache.set(language, topics);
  return topics;
}

function currentISTTime() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(now);
  const hh = parts.find((p) => p.type === 'hour').value;
  const mm = parts.find((p) => p.type === 'minute').value;
  return `${hh}:${mm}`;
}

async function processUser(user, nowHHMM) {
  const hits = user.schedules.filter((s) => s.time === nowHHMM);
  if (!hits.length) return;

  for (const sub of user.subscriptions) {
    if (!sub.isActive) continue;
    const topics = loadTopics(sub.language);
    if (!topics || !topics.length) continue;

    const languageName = PRETTY_NAMES[sub.language] || sub.language;

    if (sub.currentTopicIndex >= topics.length) {
      const doneHtml = buildCompletionTemplate(languageName, topics.length, user);
      await sendEmail(user.email, `You finished ${languageName} on CodeSchedule`, doneHtml, {
        context: 'completion',
        language: sub.language,
        userId: user._id
      }).catch((e) => console.error('[scheduler] completion email failed', e.message));
      sub.isActive = false;
      sub.completedAt = new Date();
      console.log(`[${new Date().toISOString()}] [scheduler] ${user.email} completed ${sub.language}`);
      continue;
    }

    const topic = topics[sub.currentTopicIndex];
    const html = buildEmailTemplate(topic, languageName, sub.currentTopicIndex, topics.length, user);
    const subject = topic.subject || `${languageName}: ${topic.title}`;

    try {
      const result = await sendEmail(user.email, subject, html, {
        context: 'scheduler',
        language: sub.language,
        topicIndex: sub.currentTopicIndex,
        topicTitle: topic.title,
        userId: user._id
      });
      const delivered = !result || !result.skipped;

      console.log(
        `[${new Date().toISOString()}] [scheduler] ${delivered ? 'sent' : 'skipped'} ${sub.language} #${sub.currentTopicIndex + 1} to ${user.email}`
      );

      if (delivered) {
        user.completedTopics.push({
          language: sub.language,
          topicIndex: sub.currentTopicIndex,
          topicTitle: topic.title,
          sentAt: new Date()
        });
        sub.currentTopicIndex += 1;

        if (sub.currentTopicIndex >= topics.length) {
          sub.completedAt = new Date();
          sub.isActive = false;
          const doneHtml = buildCompletionTemplate(languageName, topics.length, user);
          await sendEmail(user.email, `You finished ${languageName} on CodeSchedule`, doneHtml, {
            context: 'completion',
            language: sub.language,
            userId: user._id
          }).catch((e) => console.error('[scheduler] completion email failed', e.message));
        }
      }
    } catch (err) {
      console.error(`[scheduler] failed sending to ${user.email}:`, err.message);
    }
  }

  await user.save();
}

async function tick() {
  const nowHHMM = currentISTTime();
  console.log(`[${new Date().toISOString()}] [scheduler] tick IST=${nowHHMM}`);

  const users = await User.find({
    isActive: true,
    'schedules.time': nowHHMM,
    'subscriptions.isActive': true
  });

  if (!users.length) return;

  for (const user of users) {
    try {
      await processUser(user, nowHHMM);
    } catch (err) {
      console.error(`[scheduler] error processing ${user.email}:`, err.message);
    }
  }
}

function startScheduler() {
  console.log('[scheduler] starting cron every minute');
  cron.schedule('* * * * *', () => {
    tick().catch((err) => console.error('[scheduler] tick failed:', err));
  });
}

module.exports = { startScheduler, tick, loadTopics };
