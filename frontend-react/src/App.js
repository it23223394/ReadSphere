import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from "./pages/Dashboard";
import Bookshelf from "./pages/Bookshelf";
import NotesQuotes from "./pages/NotesQuotes";
import BookDetails from "./pages/BookDetails";
import Recommendations from "./pages/Recommendations";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Settings from "./pages/Settings";
import Tracking from "./pages/Tracking";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminCatalogManagement from "./pages/AdminCatalogManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSystem from "./pages/AdminSystem";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserRoute } from "./components/UserRoute";
import { AdminRoute } from "./components/AdminRoute";
import { loadTheme, applyTheme } from "./utils/theme";
import "./App.css";

function App() {
  useScrollReveal();

  // Load and apply saved theme on app startup
  useEffect(() => {
    const savedTheme = loadTheme();
    applyTheme(savedTheme);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Admin Routes (admin-only) */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminUserManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/catalog" 
            element={
              <AdminRoute>
                <AdminCatalogManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/system" 
            element={
              <AdminRoute>
                <AdminSystem />
              </AdminRoute>
            } 
          />

          
          <Route 
            path="/dashboard" 
            element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            } 
          />
          <Route 
            path="/bookshelf" 
            element={
              <UserRoute>
                <Bookshelf />
              </UserRoute>
            } 
          />
          <Route 
            path="/notes-quotes" 
            element={
              <UserRoute>
                <NotesQuotes />
              </UserRoute>
            } 
          />
          <Route 
            path="/book/:id" 
            element={
              <UserRoute>
                <BookDetails />
              </UserRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <UserRoute>
                <Recommendations />
              </UserRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <UserRoute>
                <Navigate to="/settings" replace />
              </UserRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <UserRoute>
                <Settings />
              </UserRoute>
            } 
          />
          <Route 
            path="/tracking" 
            element={
              <UserRoute>
                <Tracking />
              </UserRoute>
            } 
          />
          
          {/* Public landing route: show login by default, no auto-redirect */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
