# Mental Health Chatbot: Sia

Sia is a compassionate mental health chatbot designed to provide a safe space for users to talk, detect emotional states, and provide safety alerts for crisis situations.

## 🚀 Quick Start (Automated)

If you are on Windows, you can start both the Backend (Flask) and Frontend (React/Vite) with a single command:

1. Open PowerShell in the root directory.
2. Run:
   ```powershell
   ./start_project.ps1
   ```

---

## 🛠️ Manual Hosting (Shell/Terminal)

If you prefer to run the components individually or are on a non-Windows system:

### 1. Backend (Flask)
1. Navigate to the `Backend` folder: `cd Backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python app.py`
   - The API will be available at `http://127.0.0.1:5000`

### 2. Frontend (React/Vite)
1. Navigate to the `Frontend` folder: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
   - The app will be available at `http://127.0.0.1:5173`

---

## 💻 Hosting via VS Code

### Using the Integrated Terminal
1. Open the project folder in VS Code.
2. Open two terminal tabs (`Ctrl + ` `).
3. In **Terminal 1**, run the Backend steps above.
4. In **Terminal 2**, run the Frontend steps above.

### Recommended Extensions
- **Python**: For backend debugging and environment management.
- **ESLint/Prettier**: For frontend code quality.
- **SQLite Viewer**: To inspect `mental_health.db` (created in the `Backend` folder).

---

## 📥 Setup for New Collaborators

After cloning the repository, follow these steps to get everything running locally:

### 1. Environment Variables
Create a `.env` file in the `Backend` folder with the following keys:
```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_key
GROQ_API_KEY=your_groq_api_key
```

### 2. Database Migration
Run these commands in the `Backend` folder to initialize the local database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 3. ML Model Initialization
The project includes a pre-trained DistilBERT model in `Backend/ml_engine/saved_models`. The backend will automatically load this in the background on startup.

---

## 🔒 Security & Performance
- **Instant Start**: Backend starts immediately while the ML model loads in a separate thread.
- **Route Protection**: All sensitive frontend pages are protected by `ProtectedRoute.jsx`.
- **API Lockdown**: Backend endpoints require a valid JWT token.