import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { LandingPage } from './pages/LandingPage';
import { CreateSurvey } from "./pages/CreateSurvey";
import { TakeSurvey } from "./pages/TakeSurvey";
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireNoAuth } from './components/auth/RequireNoAuth';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Router>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireNoAuth>
                  <LandingPage />
                </RequireNoAuth>
              }
            />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
            <Route path="/survey/:surveyId" element={<TakeSurvey />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
