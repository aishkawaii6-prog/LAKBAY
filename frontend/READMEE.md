# Lakbay - Travel Website

A full-stack travel website for exploring destinations, with admin dashboard for content management.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express.js
- **Database:** MySQL (via mysql2)
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

 2. **Install frontend dependencies:**
    ```bash
    cd frontend
    npm install
    ```

### Database Setup

Before starting the backend, create the database in MySQL and apply the schema:

```sql
-- In MySQL Workbench / XAMPP phpMyAdmin / mysql CLI
SOURCE backend/database/database_schema.sql
```

Alternatively, the database is auto-created on first run (the SQL uses `CREATE DATABASE IF NOT EXISTS Lakbay`).  
Make sure your MySQL credentials in `backend/.env` are correct for your local server.

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on http://localhost:5000

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev -- --open
   ```
   Frontend runs on http://localhost:5173

### Default Admin Account

- Email: admin@lakbay.com
- Password: admin123

---

## Common Problems

### ❌ npm is not recognized

**Solution:** Install Node.js
- Download from https://nodejs.org
- Install the LTS version

### ❌ Port already in use

**Solution:** Close other running servers
```bash
# Find and kill process using the port
# For Windows:
taskkill /F /IM node.exe

# Then restart the server
```

### ❌ Missing node_modules

**Solution:** Run npm install
```bash
cd backend
npm install

cd ../frontend
npm install
```

### ❌ Backend API not responding

**Solution:** 
1. Make sure backend is running on port 5000
2. Check if port 5000 is not blocked by firewall
3. Restart backend: `cd backend && npm start`

### ❌ Login not working

**Solution:**
1. Clear browser localStorage
2. Use the default admin credentials: admin@lakbay.com / admin123
3. Make sure backend is running

---

## Project Structure

```
lakbay/
├── backend/
│   ├── src/
│   │   ├── configs/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── userControllers.js
│   │   ├── models/
│   │   │   ├── userModels.js
│   │   │   ├── feedbackModels.js
│   │   │   ├── bookmarksModels.js
│   │   │   ├── galleryModels.js
│   │   │   ├── activitiesModels.js
│   │   │   └── activityLogsModels.js
│   │   ├── routes/
│   │   │   └── routes.js
│   │   ├── validators/
│   │   │   └── validators.js
│   │   └── server.js
│   ├── database/
│   │   └── database_schema.sql
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      (Hero, Navbar, Footer, SpotModal, AdminDashboard, …)
│   │   ├── context/         (AuthContext)
│   │   ├── hooks/           (useAuth, useStorage, useSpots)
│   │   ├── pages/           (NewsPage, ContactPage, AdminLoginPage)
│   │   ├── services/        (api.js — REST client)
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── READMEE.md
│   └── package.json
└── student-management-system/   (legacy — contains an earlier project version)
```
