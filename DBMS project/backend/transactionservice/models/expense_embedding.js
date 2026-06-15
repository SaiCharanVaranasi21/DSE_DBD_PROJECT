const mongoose = require('mongoose');

// Maps to MongoDB collection: expense_embeddings
// Stores vector embeddings for semantic search / AI features on expenses
const expenseEmbeddingSchema = new mongoose.Schema({
  expenseLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseLog',
    required: true
  },
  userId:       { type: Number, required: true },
  text:         { type: String, required: true },   // the text that was embedded
  embedding:    { type: [Number], required: true },  // vector array (e.g. 768-dim)
  model:        { type: String, default: 'text-embedding-ada-002' },
  createdAt:    { type: Date, default: Date.now }
});

expenseEmbeddingSchema.index({ expenseLogId: 1 });
expenseEmbeddingSchema.index({ userId: 1 });

// Explicitly name the MongoDB collection 'expense_embeddings'
module.exports = mongoose.model('ExpenseEmbedding', expenseEmbeddingSchema, 'expense_embeddings');
