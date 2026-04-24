require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendEmail, buildEmailTemplate } = require('../services/emailService');

async function main() {
  const to = process.argv[2];
  const language = process.argv[3] || 'javascript';
  const indexArg = parseInt(process.argv[4] || '0', 10);

  if (!to) {
    console.error('Usage: node scripts/sendTestEmail.js <email> [language] [topicIndex]');
    process.exit(1);
  }

  const file = path.resolve(__dirname, `../../../packages/topics/${language}.json`);
  if (!fs.existsSync(file)) {
    console.error(`Topics file not found: ${file}`);
    process.exit(1);
  }

  const topics = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const topic = topics[indexArg];
  if (!topic) {
    console.error(`No topic at index ${indexArg}`);
    process.exit(1);
  }

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
      console.warn('[cli] mongo connect failed, continuing without delivery log:', err.message);
    }
  }

  let recipient = null;
  if (mongoose.connection.readyState === 1) {
    try {
      recipient = await User.findOne({ email: to.toLowerCase().trim() });
    } catch (err) {
      console.warn('[cli] could not look up recipient user:', err.message);
    }
  }

  const pretty = language.charAt(0).toUpperCase() + language.slice(1);
  const html = buildEmailTemplate(topic, pretty, indexArg, topics.length, recipient);

  try {
    const info = await sendEmail(to, `${pretty}: ${topic.title}`, html, {
      context: 'cli',
      language,
      topicIndex: indexArg,
      topicTitle: topic.title,
      userId: recipient?._id || null
    });
    console.log('Sent:', info.messageId || info);
    if (recipient) console.log('Greeting personalized for:', recipient.name);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

main().catch(async (err) => {
  console.error(err);
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
