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

DROP TABLE IF EXISTS rolesmapping CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS menus (
    mid INT PRIMARY KEY,
    icon VARCHAR(255),
    menu VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rolesmapping (
    id SERIAL PRIMARY KEY,
    mid INT,
    role INT,
    FOREIGN KEY (mid) REFERENCES menus(mid) ON DELETE CASCADE,
    FOREIGN KEY (role) REFERENCES roles(role_id) ON DELETE CASCADE
);

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

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);


-- Insert default roles if they don't exist
DELETE FROM rolesmapping;
DELETE FROM menus;
DELETE FROM roles;
INSERT INTO roles (role_id, role_name) VALUES (1, 'User');
INSERT INTO roles (role_id, role_name) VALUES (2, 'Admin');
INSERT INTO roles (role_id, role_name) VALUES (3, 'Manager');
