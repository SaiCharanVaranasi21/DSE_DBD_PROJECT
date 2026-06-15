#!/usr/bin/env python3
"""
MongoDB Collections Initialization Script
Creates required collections with proper schemas and indexes
"""

import pymongo
from pymongo import MongoClient
from datetime import datetime
import sys

# MongoDB Connection String (from .env)
MONGO_URI = "mongodb+srv://admin:admin@cluster0.vbi979y.mongodb.net/money_manager?appName=Cluster0"

def init_collections():
    """Initialize all required MongoDB collections"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['money_manager']
        
        print("Connected to MongoDB successfully!")
        print(f"Database: {db.name}")
        
        # Create expense_logs collection
        if 'expense_logs' not in db.list_collection_names():
            print("\n✓ Creating 'expense_logs' collection...")
            expense_logs = db.create_collection('expense_logs')
            expense_logs.create_index("user_id")
            expense_logs.create_index("created_at")
            expense_logs.create_index([("user_id", 1), ("created_at", -1)])
            print("  - Created indexes: user_id, created_at")
        else:
            print("\n✓ 'expense_logs' collection already exists")
        
        # Create expense_embeddings collection
        if 'expense_embeddings' not in db.list_collection_names():
            print("\n✓ Creating 'expense_embeddings' collection...")
            expense_embeddings = db.create_collection('expense_embeddings')
            expense_embeddings.create_index("user_id")
            expense_embeddings.create_index("expense_id")
            expense_embeddings.create_index([("user_id", 1), ("created_at", -1)])
            print("  - Created indexes: user_id, expense_id, (user_id + created_at)")
        else:
            print("\n✓ 'expense_embeddings' collection already exists")
        
        # Create user_activity collection
        if 'user_activity' not in db.list_collection_names():
            print("\n✓ Creating 'user_activity' collection...")
            user_activity = db.create_collection('user_activity')
            user_activity.create_index("user_id")
            user_activity.create_index("activity_type")
            user_activity.create_index("timestamp")
            user_activity.create_index([("user_id", 1), ("timestamp", -1)])
            print("  - Created indexes: user_id, activity_type, timestamp")
        else:
            print("\n✓ 'user_activity' collection already exists")
        
        # List all collections
        print("\n" + "="*50)
        print("Collections in 'money_manager' database:")
        print("="*50)
        for collection in sorted(db.list_collection_names()):
            count = db[collection].count_documents({})
            print(f"  • {collection} ({count} documents)")
        
        print("\n" + "="*50)
        print("✅ MongoDB initialization completed successfully!")
        print("="*50)
        
        client.close()
        return True
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print("❌ Error: Could not connect to MongoDB")
        print("   - Check your internet connection")
        print("   - Verify your MongoDB Atlas cluster is running")
        print("   - Check your IP is whitelisted in MongoDB Atlas")
        return False
    except pymongo.errors.OperationFailure as e:
        print(f"❌ MongoDB Operation Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error initializing collections: {e}")
        return False

if __name__ == "__main__":
    success = init_collections()
    sys.exit(0 if success else 1)
