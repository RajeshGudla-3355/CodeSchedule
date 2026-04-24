const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    currentTopicIndex: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const ScheduleSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  { _id: true }
);

const CompletedTopicSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    topicIndex: { type: Number, required: true },
    topicTitle: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  subscriptions: { type: [SubscriptionSchema], default: [] },
  schedules: { type: [ScheduleSchema], default: [] },
  completedTopics: { type: [CompletedTopicSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
