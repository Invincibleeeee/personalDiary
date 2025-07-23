// src/App.jsx
import { Routes, Route } from "react-router-dom";
import "./index.css";

// Pages
import DiaryLandingPage from "./pages/Landing";
import AuthForm from "./pages/AuthForm";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";

// Routes
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<DiaryLandingPage />} />

      {/* Public (unauthenticated-only) Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />

      {/* Protected (authenticated-only) Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
