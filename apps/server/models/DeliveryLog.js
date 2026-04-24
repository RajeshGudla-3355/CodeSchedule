const mongoose = require('mongoose');

const DeliveryLogSchema = new mongoose.Schema({
  to: { type: String, required: true, index: true },
  from: { type: String, default: null },
  subject: { type: String, default: '' },
  language: { type: String, default: null, index: true },
  topicIndex: { type: Number, default: null },
  topicTitle: { type: String, default: null },
  context: {
    type: String,
    enum: ['scheduler', 'completion', 'cli', 'unknown'],
    default: 'unknown',
    index: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  status: {
    type: String,
    enum: ['sent', 'skipped', 'error'],
    required: true,
    index: true
  },
  messageId: { type: String, default: null },
  smtpResponse: { type: String, default: null },
  errorMessage: { type: String, default: null },
  errorCode: { type: String, default: null },
  sentAt: { type: Date, default: Date.now, index: true }
});

DeliveryLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model('DeliveryLog', DeliveryLogSchema);
