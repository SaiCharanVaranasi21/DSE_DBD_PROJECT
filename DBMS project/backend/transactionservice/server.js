const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();

// ── Models (3 MongoDB collections as required) ───────────────────────────────
const ExpenseLog       = require('./models/expense_log');        // collection: expense_logs
const ExpenseEmbedding = require('./models/expense_embedding'); // collection: expense_embeddings
const UserActivity     = require('./models/user_activity');     // collection: user_activity

const app      = express();
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracking';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Helper: log user activity into the user_activity collection
// ─────────────────────────────────────────────────────────────────────────────
async function logActivity(userId, action, entityId = null, metadata = {}, req = null) {
  try {
    await UserActivity.create({
      userId,
      action,
      entity:    'expense_log',
      entityId,
      metadata,
      ip:        req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '',
      userAgent: req ? (req.headers['user-agent'] || '') : ''
    });
  } catch (err) {
    console.error('⚠  Failed to write user_activity log:', err.message);
    // Non-fatal — do not break the main request
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const dbState  = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status:    dbState === 1 ? 'ok' : 'degraded',
    db:        stateMap[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /categories — static category list
// ─────────────────────────────────────────────────────────────────────────────
app.get('/categories', (req, res) => {
  return res.json([
    'Housing', 'Food', 'Transport',
    'Utilities', 'Entertainment', 'Savings',
    'Healthcare', 'Education', 'petrol', 'snacks', 'Other'
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: block DB routes if MongoDB is not connected
// ─────────────────────────────────────────────────────────────────────────────
function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable. MongoDB is not connected.'
    });
  }
  next();
}

// =============================================================================
//  expense_logs collection — CRUD
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// POST /transactions — Create a new expense log
// ─────────────────────────────────────────────────────────────────────────────
app.post('/transactions', requireDb, async (req, res) => {
  try {
    const { userId, name, type, category, amount, description, date, method, tags } = req.body;

    if (!userId || !type || !category || !amount || !description || !date) {
      return res.status(400).json({
        error: 'Missing required fields: userId, type, category, amount, description, date'
      });
    }

    const expenseLog = new ExpenseLog({
      userId,
      name:        name || '',
      type,
      category,
      amount,
      description,
      date:        new Date(date),
      method:      method || 'Cash',
      tags:        tags || []
    });

    await expenseLog.save();

    // Log to user_activity
    await logActivity(userId, 'CREATE_EXPENSE', expenseLog._id, { amount, category, type }, req);

    // Create a placeholder embedding record so the collection appears in MongoDB
    // (In production this would be filled by an AI/embedding pipeline)
    await ExpenseEmbedding.create({
      expenseLogId: expenseLog._id,
      userId,
      text:      `${category} ${description} ${amount}`,
      embedding: [],   // empty until AI pipeline populates it
      model:     'placeholder'
    });

    return res.status(201).json(expenseLog);

  } catch (error) {
    console.error('Error creating expense log:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /transactions — Fetch filtered, sorted, paginated expense logs
// ─────────────────────────────────────────────────────────────────────────────
app.get('/transactions', requireDb, async (req, res) => {
  try {
    const {
      userId,
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy    = 'date',
      sortOrder = 'desc',
      page      = 1,
      limit     = 10
    } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is a required query parameter' });
    }

    const uid   = Number(userId);
    const query = { userId: uid };

    if (type)     query.type     = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } },
        { name:        { $regex: search, $options: 'i' } }
      ];
    }

    const sort    = {};
    sort[sortBy]  = sortOrder === 'asc' ? 1 : -1;

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const [expenseLogs, total] = await Promise.all([
      ExpenseLog.find(query).sort(sort).skip(skip).limit(limitNum),
      ExpenseLog.countDocuments(query)
    ]);

    // Log the view activity
    await logActivity(uid, 'VIEW_EXPENSES', null, { filters: { type, category, startDate, endDate, search } }, req);

    return res.json({
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
      data:       expenseLogs
    });

  } catch (error) {
    console.error('Error fetching expense logs:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /transactions/:id — Update an expense log
// ─────────────────────────────────────────────────────────────────────────────
app.put('/transactions/:id', requireDb, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    const { userId, name, type, category, amount, description, date, method, tags } = req.body;
    const updateData = {};
    if (name        !== undefined) updateData.name        = name;
    if (type)                      updateData.type        = type;
    if (category)                  updateData.category    = category;
    if (amount      !== undefined) updateData.amount      = amount;
    if (description)               updateData.description = description;
    if (date)                      updateData.date        = new Date(date);
    if (method)                    updateData.method      = method;
    if (tags)                      updateData.tags        = tags;

    const expenseLog = await ExpenseLog.findByIdAndUpdate(id, updateData, { new: true });
    if (!expenseLog) {
      return res.status(404).json({ error: 'Expense log not found' });
    }

    // Log to user_activity
    const uid = userId || expenseLog.userId;
    await logActivity(uid, 'UPDATE_EXPENSE', expenseLog._id, updateData, req);

    return res.json(expenseLog);

  } catch (error) {
    console.error('Error updating expense log:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /transactions/:id — Delete an expense log
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/transactions/:id', requireDb, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    const expenseLog = await ExpenseLog.findByIdAndDelete(id);
    if (!expenseLog) {
      return res.status(404).json({ error: 'Expense log not found' });
    }

    // Also remove associated embedding
    await ExpenseEmbedding.deleteMany({ expenseLogId: expenseLog._id });

    // Log to user_activity
    await logActivity(
      expenseLog.userId,
      'DELETE_EXPENSE',
      expenseLog._id,
      { category: expenseLog.category, amount: expenseLog.amount },
      req
    );

    return res.json({ message: 'Expense log deleted successfully' });

  } catch (error) {
    console.error('Error deleting expense log:', error);
    return res.status(500).json({ error: error.message });
  }
});

// =============================================================================
//  user_activity collection — read-only exposure
// =============================================================================

// GET /activity/:userId — fetch activity history for a user
app.get('/activity/:userId', requireDb, async (req, res) => {
  try {
    const uid      = Number(req.params.userId);
    const limit    = parseInt(req.query.limit  || 50);
    const page     = parseInt(req.query.page   || 1);
    const skip     = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      UserActivity.find({ userId: uid }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserActivity.countDocuments({ userId: uid })
    ]);

    return res.json({ total, page, limit, data: activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return res.status(500).json({ error: error.message });
  }
});

// =============================================================================
//  expense_embeddings collection — read-only exposure
// =============================================================================

// GET /embeddings/:userId — fetch embeddings for a user (for admin/debug)
app.get('/embeddings/:userId', requireDb, async (req, res) => {
  try {
    const uid   = Number(req.params.userId);
    const limit = parseInt(req.query.limit || 20);

    const embeddings = await ExpenseEmbedding.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('expenseLogId');

    return res.json({ total: embeddings.length, data: embeddings });
  } catch (error) {
    console.error('Error fetching embeddings:', error);
    return res.status(500).json({ error: error.message });
  }
});

// =============================================================================
//  Admin MongoDB Collections Exponent Routes
// =============================================================================

// GET /admin/mongo/expense_logs — fetch all expense logs for admin dashboard
app.get('/admin/mongo/expense_logs', requireDb, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100);
    const data = await ExpenseLog.find({}).sort({ createdAt: -1 }).limit(limit);
    return res.json({ total: data.length, data });
  } catch (error) {
    console.error('Error fetching admin expense logs:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /admin/mongo/expense_embeddings — fetch all embeddings for admin dashboard
app.get('/admin/mongo/expense_embeddings', requireDb, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100);
    const data = await ExpenseEmbedding.find({}).sort({ createdAt: -1 }).limit(limit);
    return res.json({ total: data.length, data });
  } catch (error) {
    console.error('Error fetching admin embeddings:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /admin/mongo/user_activity — fetch all user activity for admin dashboard
app.get('/admin/mongo/user_activity', requireDb, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100);
    const data = await UserActivity.find({}).sort({ createdAt: -1 }).limit(limit);
    return res.json({ total: data.length, data });
  } catch (error) {
    console.error('Error fetching admin user activity:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Connect to MongoDB, then start server
// ─────────────────────────────────────────────────────────────────────────────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
};

// Function to ensure collections exist
async function ensureCollectionsExist() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if (!collectionNames.includes('expense_logs')) {
    await db.createCollection('expense_logs');
    console.log('✓ Created collection: expense_logs');
  }

  if (!collectionNames.includes('expense_embeddings')) {
    await db.createCollection('expense_embeddings');
    console.log('✓ Created collection: expense_embeddings');
  }

  if (!collectionNames.includes('user_activity')) {
    await db.createCollection('user_activity');
    console.log('✓ Created collection: user_activity');
  }
}

console.log('⏳  Connecting to MongoDB...');

mongoose.connect(MONGO_URI, MONGO_OPTIONS)
  .then(async () => {
    console.log('✅  MongoDB connected successfully');
    
    // Ensure all collections exist
    await ensureCollectionsExist();
    
    console.log('📦  Collections in use:');
    console.log('      • expense_logs        (main transactions)');
    console.log('      • expense_embeddings  (AI vector embeddings)');
    console.log('      • user_activity       (audit / activity log)');
    app.listen(PORT, () => {
      console.log(`🚀  Transaction microservice running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌  MongoDB connection FAILED. The service will NOT start.');
    console.error('    Error:', err.message);
    console.error('    Fix: Ensure your MONGO_URI in .env is correct and MongoDB is reachable.');
    console.error('    Current URI:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));
    process.exit(1);
  });
