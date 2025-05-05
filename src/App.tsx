import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { LandingPage } from './pages/LandingPage';
import { CreateSurvey } from './pages/CreateSurvey';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateSurvey />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
