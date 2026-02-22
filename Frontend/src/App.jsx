import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

// Page Imports
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CommunityPage from "./pages/CommunityPage";
import ChatPage from "./pages/ChatPage";
import HelpPage from "./pages/HelpPage";

// Component Imports
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500/30 overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth"
            element={
              !isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
