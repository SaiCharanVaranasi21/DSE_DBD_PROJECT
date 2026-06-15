# Money Manager - Complete DBMS Project Setup Guide

## Project Overview
Money Manager is a comprehensive personal finance management system built with:
- **Frontend**: React + Vite (Port 3000)
- **API Gateway**: FastAPI/Python (Port 8000)
- **Backend**: Spring Boot (Port 8081)
- **Database**: PostgreSQL

## Architecture

```
Frontend (React) ↔ API Gateway (Python) ↔ Backend (Spring Boot) ↔ Database (PostgreSQL)
   Port 3000          Port 8000              Port 8081
```

## Prerequisites

- **Java 25+** (for Spring Boot)
- **Python 3.9+** (for API Gateway)
- **Node.js 18+** (for Frontend)
- **PostgreSQL 12+** (for Database)
- **Maven** (for Spring Boot build)

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE project1;

# Connect to the database
\c project1

# Run the schema script
\i path/to/schema.sql

# Run the setup script
\i path/to/database_setup.sql
```

### 2. Verify Tables

```sql
-- Check all tables were created
\dt

-- Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM user_financial_profile;
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM menus;
```

## Backend Setup (Spring Boot)

### 1. Navigate to Backend Directory

```bash
cd "D:\DSE_DBD\DBMS project\backend\coreservices"
```

### 2. Update Database Credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/project1
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 3. Build and Run

```bash
# Clean build
mvn clean install

# Run the application
mvn spring-boot:run
```

Or run via IDE (Eclipse/IntelliJ) - it will start on port 8081

## API Gateway Setup (Python/FastAPI)

### 1. Navigate to Gateway Directory

```bash
cd "c:\Users\Varanasi\OneDrive\Desktop\DBMS\PROJECTS\DBMS project\frontend\projectone\src\assets\gateway"
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn requests python-multipart
```

### 3. Run the Gateway

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The gateway will be available at `http://localhost:8000`

## Frontend Setup (React)

### 1. Navigate to Frontend Directory

```bash
cd "c:\Users\Varanasi\OneDrive\Desktop\DBMS\PROJECTS\DBMS project\frontend\projectone"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Accessing the Application

1. **Frontend**: http://localhost:5173
2. **API Gateway**: http://localhost:8000
3. **Backend**: http://localhost:8081
4. **API Documentation**: http://localhost:8081/swagger-ui.html

## User Roles and Access Control

### Role 1: User (Regular User)
- Dashboard overview
- Personal financial profile
- Transaction tracking
- Budget management
- Reports and analytics
- Settings and preferences

### Role 2: Admin
- Full system access
- User management
- Database control
- Infrastructure monitoring
- System settings

### Role 3: Manager
- Team finance monitoring
- Budget request approval
- Spending analytics
- Task management

## Key Features Implemented

### 1. JWT Authentication
- Secure login/signup
- Token-based session management
- Token expiration (24 hours)
- Role-based authorization

### 2. Onboarding Process (Two Pages)
**Page 1: Profile Information**
- Phone number
- Date of birth
- Preferred currency

**Page 2: Financial Profile**
- Monthly income
- Savings goal
- Budget allocation across categories:
  - Housing
  - Food
  - Travel
  - Utilities
  - Entertainment
  - Savings/Investment

### 3. Financial Management
- Income/Expense tracking
- Budget alerts (when spending exceeds 85%)
- Financial profile display
- Transaction history
- Budget visualization

### 4. Success Notifications
- Post-login welcome popup
- Transaction confirmation
- Profile update feedback
- System notifications

## API Endpoints

### Authentication
- `POST /authservice/signup` - User registration
- `POST /authservice/signin` - User login
- `GET /authservice/uinfo` - Get user info (requires token)

### Users
- `GET /authservice/users` - Get all users (admin only)
- `GET /authservice/users/{id}` - Get user by ID
- `PUT /authservice/users/{id}/complete-onboarding` - Mark onboarding complete

### Financial Profile
- `GET /financial/{userId}` - Get financial profile
- `POST /financial/save` - Save/create financial profile
- `PUT /financial/update/{userId}` - Update financial profile

### Roles & Permissions
- `GET /authservice/roles` - Get all roles
- `GET /authservice/menus` - Get available menus
- `POST /authservice/rolesmapping` - Add role-menu mapping

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth VARCHAR(20),
    preferred_currency VARCHAR(10),
    role INT,
    status INT,
    first_login BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### User Financial Profile Table
```sql
CREATE TABLE user_financial_profile (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    monthly_income NUMERIC,
    savings_goal NUMERIC,
    housing_budget NUMERIC,
    food_budget NUMERIC,
    travel_budget NUMERIC,
    utilities_budget NUMERIC,
    entertainment_budget NUMERIC,
    savings_investment NUMERIC,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    task VARCHAR(255),
    task_desc TEXT,
    status INT,
    assigned_to BIGINT,
    due_date VARCHAR(20),
    due_hour INT,
    due_minute INT,
    created_at TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

## Testing the System

### 1. Sign Up Flow
1. Navigate to http://localhost:5173
2. Click "Get Started" or "Create one" link
3. Fill in name, email, password
4. Accept terms and click "Create Account"
5. You'll be redirected to login

### 2. Sign In Flow
1. Enter email and password
2. Click "Sign In"
3. If first login, you'll see the onboarding popup
4. Complete both pages of onboarding
5. You'll see the dashboard

### 3. Dashboard Features
1. **Overview Tab**: View financial summary
2. **Transactions Tab**: Add and view transactions
3. **Budgets Tab**: View budget allocation
4. **Reports Tab**: See financial analytics
5. **Settings Tab**: Configure preferences
6. **Profile Tab**: View/edit user information

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in application.properties
- Ensure database "project1" exists
- Check database user has CREATE privileges

### Gateway Connection Issues
- Verify API Gateway is running on port 8000
- Check FastAPI dependencies are installed
- Verify requests library is available
- Check CORS configuration in main.py

### Backend Startup Issues
- Check Java version (should be 25+)
- Verify Maven dependencies
- Check port 8081 is available
- Review Spring Boot logs

### Frontend Issues
- Clear browser cache
- Verify Vite is running
- Check npm dependencies installed
- Review console errors

## Performance Optimization

1. **JWT Token Caching**: Tokens are cached in localStorage
2. **Database Indexing**: Email field is indexed for fast lookups
3. **API Gateway Caching**: FastAPI caches backend responses
4. **Frontend Lazy Loading**: Components loaded on demand

## Security Features

1. **Password Hashing**: Passwords stored securely (should use BCrypt in production)
2. **JWT Tokens**: Secure token-based authentication
3. **CORS Protection**: API Gateway handles CORS
4. **SQL Injection Prevention**: Parameterized queries in repositories
5. **Role-Based Access**: Menus filtered based on user role

## Future Enhancements

1. Email verification for sign-up
2. Password reset functionality
3. Two-factor authentication
4. Budget alerts and notifications
5. Data export (PDF/CSV)
6. Mobile app integration
7. Real-time transaction sync
8. Advanced analytics and ML-based insights

## File Structure

```
DBMS project/
├── frontend/
│   └── projectone/
│       ├── src/
│       │   ├── App.jsx (Main application component)
│       │   ├── Root.jsx
│       │   ├── assets/
│       │   │   ├── components/
│       │   │   │   ├── Onboarding.jsx (Onboarding flow)
│       │   │   │   ├── Onboarding.css
│       │   │   │   └── Starting.jsx
│       │   │   └── gateway/
│       │   │       └── main.py (API Gateway)
│       │   └── App.css
│       ├── package.json
│       └── vite.config.js
├── backend/
│   └── coreservices/
│       ├── src/main/java/mth/
│       │   ├── controller/
│       │   │   ├── UsersController.java
│       │   │   ├── UserFinancialController.java
│       │   │   └── TasksController.java
│       │   ├── models/
│       │   │   ├── Users.java
│       │   │   ├── UserFinancialProfile.java
│       │   │   ├── Tasks.java
│       │   │   ├── Roles.java
│       │   │   ├── Menus.java
│       │   │   └── Rolesmapping.java
│       │   ├── repository/
│       │   │   ├── UsersRepository.java
│       │   │   ├── UserFinancialRepository.java
│       │   │   ├── TasksRepository.java
│       │   │   ├── RolesRepository.java
│       │   │   ├── MenusRepository.java
│       │   │   └── RolesMappingRepository.java
│       │   ├── services/
│       │   │   ├── UsersService.java
│       │   │   ├── UserFinancialService.java
│       │   │   ├── TasksService.java
│       │   │   ├── JwtService.java
│       │   │   ├── RolesService.java
│       │   │   ├── MenusService.java
│       │   │   └── RolesMappingService.java
│       │   └── CoreservicesApplication.java
│       ├── src/main/resources/
│       │   ├── application.properties
│       │   └── schema.sql
│       ├── pom.xml
│       └── database_setup.sql
```

## Support

For issues or questions, please refer to the individual README files in each component directory.

---

**Last Updated**: May 2026
**Project Version**: 1.0
