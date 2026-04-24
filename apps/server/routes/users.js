const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS_DIR = path.resolve(__dirname, '../../../packages/topics');

function listLanguages() {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'a valid email is required' });
    }

    const nextName = name.trim();
    const nextEmail = email.toLowerCase().trim();

    if (nextEmail !== req.user.email) {
      const taken = await User.findOne({ email: nextEmail, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ error: 'Email already in use' });
    }

    req.user.name = nextName;
    req.user.email = nextEmail;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.put('/avatar', auth, async (req, res, next) => {
  try {
    const { avatar } = req.body || {};

    if (avatar === null || avatar === '') {
      req.user.avatar = null;
      await req.user.save();
      return res.json({ user: req.user.toSafeJSON() });
    }

    if (typeof avatar !== 'string') {
      return res.status(400).json({ error: 'avatar must be a string' });
    }

    const isDataUrl = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar);
    const isHttpUrl = /^https?:\/\//.test(avatar);
    if (!isDataUrl && !isHttpUrl) {
      return res.status(400).json({ error: 'avatar must be a base64 image data URL or an http(s) URL' });
    }

    if (avatar.length > 700 * 1024) {
      return res.status(413).json({ error: 'avatar too large (max ~700KB base64)' });
    }

    req.user.avatar = avatar;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.put('/password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'newPassword must be at least 6 characters' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'newPassword must differ from currentPassword' });
    }

    const ok = await bcrypt.compare(currentPassword, req.user.password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/schedule', auth, async (req, res, next) => {
  try {
    const { schedules } = req.body || {};
    if (!Array.isArray(schedules)) return res.status(400).json({ error: 'schedules must be an array' });
    if (schedules.length > 3) return res.status(400).json({ error: 'max 3 schedule times allowed' });

    const clean = [];
    for (const s of schedules) {
      if (!s || typeof s.time !== 'string' || !/^\d{2}:\d{2}$/.test(s.time)) {
        return res.status(400).json({ error: 'time must be in HH:MM format' });
      }
      clean.push({ time: s.time, timezone: s.timezone || 'Asia/Kolkata' });
    }

    req.user.schedules = clean;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.put('/subscriptions', auth, async (req, res, next) => {
  try {
    const { language, action } = req.body || {};
    if (!language) return res.status(400).json({ error: 'language is required' });

    const available = listLanguages();
    if (!available.includes(language)) {
      return res.status(400).json({ error: `language must be one of: ${available.join(', ')}` });
    }

    const existing = req.user.subscriptions.find((s) => s.language === language);

    if (action === 'remove') {
      req.user.subscriptions = req.user.subscriptions.filter((s) => s.language !== language);
    } else if (existing) {
      existing.isActive = true;
      if (existing.completedAt) {
        existing.currentTopicIndex = 0;
        existing.completedAt = null;
        existing.startedAt = new Date();
      }
    } else {
      req.user.subscriptions.push({
        language,
        currentTopicIndex: 0,
        startedAt: new Date(),
        isActive: true
      });
    }

    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
