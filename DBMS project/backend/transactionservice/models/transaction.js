const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  name: { type: String, required: false, default: '' },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Configure indexes as requested
transactionSchema.index({ userId: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
