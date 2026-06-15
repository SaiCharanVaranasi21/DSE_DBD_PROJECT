const mongoose = require('mongoose');

// Maps to MongoDB collection: expense_logs
const expenseLogSchema = new mongoose.Schema({
  userId:      { type: Number, required: true },
  name:        { type: String, required: false, default: '' },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  category:    { type: String, required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  date:        { type: Date,   required: true },
  method:      { type: String, default: 'Cash' },   // payment method e.g. Cash, UPI, Card
  tags:        [{ type: String }],                  // optional tags array
  createdAt:   { type: Date,   default: Date.now }
});

// Indexes for fast query by user, category and date
expenseLogSchema.index({ userId: 1 });
expenseLogSchema.index({ category: 1 });
expenseLogSchema.index({ date: 1 });
expenseLogSchema.index({ userId: 1, date: -1 });

// Explicitly name the MongoDB collection 'expense_logs'
module.exports = mongoose.model('ExpenseLog', expenseLogSchema, 'expense_logs');
