# 🚀 Aurora Team Setup Guide

Welcome to the team! Follow these steps to get the mental health chatbot running locally.

## 1. Get the Code
```bash
git pull origin main
```
> [!WARNING]
> **Database Overwrite**: Since the `mental_health.db` file is now tracked in Git, running `git pull` **WILL replace your local database** with the version from GitHub. If you have created local test users you want to keep, back up your `.db` file before pulling!

## 2. Backend Setup
1.  **Navigate to Backend**: `cd Backend`
2.  **Install Dependencies**: `pip install -r requirements.txt`
3.  **Environment Variables**:
    - Copy `.env.example` to `.env`
    - Fill in your `GROQ_API_KEY` and Gmail App Password for notifications.
4.  **Database**: The `mental_health.db` is already pre-populated with 10 doctors. It is located in `Backend/instance/`.

## 3. Frontend Setup
1.  **Navigate to Frontend**: `cd Frontend`
2.  **Install Dependencies**: `npm install`

## 4. Running the App
- **Backend**: `python app.py` (Runs on port 5000)
- **Frontend**: `npm run dev` (Runs on port 5173)

---
*Note: If you ever need to reset the database to the default 10 doctors, run `python scripts/populate_db.py` from the Backend folder.*
