
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { startTransition, useEffect } from 'react';
import { AuthProvider } from './context/authContext';
import { LandingPage } from './pages/LandingPage';
import { CreateSurvey } from "./pages/CreateSurvey";
import { TakeSurvey } from "./pages/TakeSurvey";
import { SurveyResults } from "./pages/SurveyResults";
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireNoAuth } from './components/auth/RequireNoAuth';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    startTransition(() => {});
  }, [location]);

  return (
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
        <Route path="/create/:draftId" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
        <Route path="/survey/:surveyId" element={<TakeSurvey />} />
        <Route path="/results/:surveyId" element={<ProtectedRoute><SurveyResults /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

function App() {
  return (
    <div className="app-container">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
