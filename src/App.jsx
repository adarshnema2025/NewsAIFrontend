import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotebookProvider } from './context/NotebookContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotebookDetails from './pages/NotebookDetails';
import Archives from './pages/Archives';
import KnowledgeCenter from './pages/KnowledgeCenter';
import OAuthCallback from './pages/OAuthCallback';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotebookProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute><Home /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/notebooks/:id" element={
                <ProtectedRoute><NotebookDetails /></ProtectedRoute>
              } />
              <Route path="/archives" element={
                <ProtectedRoute><Archives /></ProtectedRoute>
              } />
              <Route path="/knowledge-center" element={
                <ProtectedRoute><KnowledgeCenter /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotebookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}