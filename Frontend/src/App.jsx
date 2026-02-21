import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CommunityPage from "./pages/CommunityPage";
import ChatPage from "./pages/ChatPage";
import HelpPage from "./pages/HelpPage";

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

          {/* Protected Routes (Static for now) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Catch-all */}
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
