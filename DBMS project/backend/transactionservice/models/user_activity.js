const mongoose = require('mongoose');

// Maps to MongoDB collection: user_activity
// Tracks every action a user performs in the app (audit log)
const userActivitySchema = new mongoose.Schema({
  userId:      { type: Number,  required: true },
  action:      { type: String,  required: true },   // e.g. 'CREATE_EXPENSE', 'UPDATE_EXPENSE', 'DELETE_EXPENSE', 'LOGIN', 'LOGOUT'
  entity:      { type: String,  default: 'expense_log' },  // which collection was affected
  entityId:    { type: mongoose.Schema.Types.ObjectId, default: null }, // affected document _id
  metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },      // any extra info (amount, category, etc.)
  ip:          { type: String,  default: '' },
  userAgent:   { type: String,  default: '' },
  createdAt:   { type: Date,    default: Date.now }
});

userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ action: 1 });

// Explicitly name the MongoDB collection 'user_activity'
module.exports = mongoose.model('UserActivity', userActivitySchema, 'user_activity');
