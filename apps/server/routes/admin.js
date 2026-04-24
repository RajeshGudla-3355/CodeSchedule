const express = require('express');
const DeliveryLog = require('../models/DeliveryLog');
const auth = require('../middleware/auth');

const router = express.Router();

const ALLOWED_STATUS = new Set(['sent', 'skipped', 'error']);
const ALLOWED_CONTEXT = new Set(['scheduler', 'completion', 'cli', 'unknown']);

router.get('/deliveries', auth, async (req, res, next) => {
  try {
    const { status, language, context, to, limit } = req.query;

    const filter = {};
    if (status && ALLOWED_STATUS.has(status)) filter.status = status;
    if (language) filter.language = language;
    if (context && ALLOWED_CONTEXT.has(context)) filter.context = context;
    if (to) filter.to = to.toLowerCase().trim();

    const cap = Math.min(parseInt(limit, 10) || 100, 500);

    const [items, total, counts] = await Promise.all([
      DeliveryLog.find(filter).sort({ sentAt: -1 }).limit(cap).lean(),
      DeliveryLog.countDocuments(filter),
      DeliveryLog.aggregate([
        { $match: filter },
        { $group: { _id: '$status', n: { $sum: 1 } } }
      ])
    ]);

    const byStatus = { sent: 0, skipped: 0, error: 0 };
    for (const row of counts) byStatus[row._id] = row.n;

    res.json({
      items,
      total,
      returned: items.length,
      limit: cap,
      byStatus
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
