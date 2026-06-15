-- =====================================================
-- COMPLETE DATABASE SETUP SCRIPT FOR MONEY MANAGER
-- =====================================================
-- This script creates all necessary tables and configures
-- the database for the Money Manager DBMS project

-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth VARCHAR(20),
    preferred_currency VARCHAR(10) DEFAULT 'INR',
    role INT DEFAULT 1,
    status INT DEFAULT 1,
    first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE USER FINANCIAL PROFILE TABLE
CREATE TABLE IF NOT EXISTS user_financial_profile (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    monthly_income NUMERIC,
    savings_goal NUMERIC,
    housing_budget NUMERIC,
    food_budget NUMERIC,
    travel_budget NUMERIC,
    utilities_budget NUMERIC,
    entertainment_budget NUMERIC,
    savings_budget NUMERIC,
    occupation VARCHAR(50),
    income_frequency VARCHAR(50),
    primary_income_source VARCHAR(255),
    multiple_income_sources BOOLEAN DEFAULT false,
    top_spending_categories VARCHAR(255),
    daily_expense_reminders BOOLEAN DEFAULT false,
    financial_goal VARCHAR(100),
    saving_for VARCHAR(255),
    bill_reminders BOOLEAN DEFAULT false,
    daily_expense_alerts BOOLEAN DEFAULT false,
    overspending_alerts BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. CREATE TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    task_desc TEXT,
    status INT DEFAULT 1,
    assigned_to BIGINT,
    due_date VARCHAR(20),
    due_hour INT,
    due_minute INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. CREATE ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
);

-- 5. CREATE MENUS TABLE
CREATE TABLE IF NOT EXISTS menus (
    mid INT PRIMARY KEY,
    icon VARCHAR(255),
    menu VARCHAR(255) NOT NULL
);

-- 6. CREATE ROLE-MENU MAPPING TABLE
CREATE TABLE IF NOT EXISTS rolesmapping (
    id SERIAL PRIMARY KEY,
    mid INT,
    role INT,
    FOREIGN KEY (mid) REFERENCES menus(mid) ON DELETE CASCADE,
    FOREIGN KEY (role) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 6a. CREATE BUDGETS TABLE
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    spent NUMERIC(15, 2) DEFAULT 0.00,
    month VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6b. CREATE REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    total_income NUMERIC(15, 2) DEFAULT 0.00,
    total_expense NUMERIC(15, 2) DEFAULT 0.00,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6c. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);


-- 7. INSERT DEFAULT ROLES
INSERT INTO roles (role_id, role_name) VALUES (1, 'User') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO roles (role_id, role_name) VALUES (2, 'Admin') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO roles (role_id, role_name) VALUES (3, 'Manager') ON CONFLICT (role_id) DO NOTHING;

-- 8. INSERT DEFAULT MENUS
INSERT INTO menus (mid, icon, menu) VALUES (1, 'dashboard.png', 'Dashboard') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (2, 'profile.png', 'Profile') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (3, 'transactions.png', 'Transactions') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (4, 'budgets.png', 'Budgets') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (5, 'reports.png', 'Reports') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (6, 'settings.png', 'Settings') ON CONFLICT (mid) DO NOTHING;
INSERT INTO menus (mid, icon, menu) VALUES (7, 'task.png', 'Tasks') ON CONFLICT (mid) DO NOTHING;

-- 9. MAP MENUS TO ROLES
-- User (role 1) has access to Dashboard, Profile, Transactions, Budgets, Reports, Settings
INSERT INTO rolesmapping (mid, role) VALUES (1, 1) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (2, 1) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (3, 1) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (4, 1) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (5, 1) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (6, 1) ON CONFLICT DO NOTHING;

-- Admin (role 2) has access to all menus
INSERT INTO rolesmapping (mid, role) VALUES (1, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (2, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (3, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (4, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (5, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (6, 2) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (7, 2) ON CONFLICT DO NOTHING;

-- Manager (role 3) has access to Dashboard, Transactions, Reports, Tasks
INSERT INTO rolesmapping (mid, role) VALUES (1, 3) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (3, 3) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (5, 3) ON CONFLICT DO NOTHING;
INSERT INTO rolesmapping (mid, role) VALUES (7, 3) ON CONFLICT DO NOTHING;

-- 10. VERIFY SETUP
-- Run these queries to verify the setup:
SELECT 'Users' as category, COUNT(*) as count FROM users
UNION ALL
SELECT 'User Financial Profiles', COUNT(*) FROM user_financial_profile
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Menus', COUNT(*) FROM menus
UNION ALL
SELECT 'Role Mappings', COUNT(*) FROM rolesmapping;
UNION ALL
SELECT 'RoleMapping', COUNT(*) FROM rolesmapping;

-- View all users
SELECT * FROM users;

-- View all menus
SELECT * FROM menus;

-- View all roles
SELECT * FROM roles;

-- View role-menu mapping for Admin (role 1)
SELECT m.menu, r.rolename 
FROM rolesmapping rm
JOIN menus m ON rm.mid = m.mid
JOIN roles r ON rm.role = r.role
WHERE rm.role = 1
ORDER BY m.menu;
