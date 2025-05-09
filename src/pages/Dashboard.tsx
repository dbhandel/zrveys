import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { CompletedSurveysList } from '../components/CompletedSurveysList';
import { DraftsList } from '../components/DraftsList';
import { ActiveSurveysList } from '../components/ActiveSurveysList';
import logo from "../assets/new zrveys logo.png";



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-[#264F79] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={logo} alt="Zrveys" className="h-16" />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/create')}
                className="bg-[#8C3375] hover:bg-[#732c60] text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Create Survey
              </button>
              <button
                onClick={handleSignOut}
                className="bg-[#8C3375] hover:bg-[#732c60] text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your dashboard</h1>
        <input
          type="search"
          placeholder="search"
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Surveys in Progress Section */}
      <div className="mb-8">
        <ActiveSurveysList />
      </div>

      {/* Drafts Section */}
      <div className="mb-8">
        <DraftsList />
      </div>

      {/* Completed Section */}
      <div className="mb-8">
        <CompletedSurveysList />
      </div>
      </main>
    </div>
  );
};

export default Dashboard;
