# Time Tracking & Invoicing System

A full-stack time tracking and invoicing application built with React, Node.js, Express, and TypeScript.

## Prerequisites

Make sure you have **Node.js** installed (version 18 or higher).

Download from: https://nodejs.org/

To check if Node.js is installed, open a terminal and run:
```bash
node --version
```

## Quick Start

### Step 1: Extract the ZIP file
Extract the project folder to any location on your computer.

### Step 2: Open Terminal
Open a terminal/command prompt and navigate to the project folder:
```bash
cd path/to/time-tracking-invoicing
```

### Step 3: Install Dependencies
Run this command to install all required packages:
```bash
npm install
```

### Step 4: Start the Backend Server
Open a terminal in the project root and run:
```bash
cd packages/backend
npm run dev
```
Keep this terminal open. You should see: `Server running on port 3001`

### Step 5: Start the Frontend (in a NEW terminal)
Open a **second terminal** in the project root and run:
```bash
cd packages/frontend
npm run dev
```
You should see a URL like: `http://localhost:5173`

### Step 6: Open the App
Open your browser and go to: **http://localhost:5173**

## Login Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

### Employee Accounts
- Email: `john@example.com` | Password: `employee123`
- Email: `jane@example.com` | Password: `employee123`

## Features

**Admin users can:**
- View dashboard with hours summary
- Manage all time entries (Time Logs)
- Manage clients
- Generate invoices
- View reports

**Employee users can:**
- View their own dashboard
- Create and manage their own time entries (My Timesheet)

## Troubleshooting

### "npm not found"
Install Node.js from https://nodejs.org/

### Port already in use
If port 3001 or 5173 is busy, close other applications or restart your computer.

### Backend shows Prisma errors
These warnings can be ignored - the app uses an in-memory database for demo purposes.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Testing:** Vitest with property-based testing (fast-check)
