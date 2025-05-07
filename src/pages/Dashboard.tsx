import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ChevronDownIcon, RocketLaunchIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { DraftsList } from '../components/DraftsList';
import logo from "../assets/new zrveys logo.png";

interface Survey {
  id: string;
  title: string;
  owner: string;
  fieldingStatus?: string;
  results?: string;
  price?: string;
  modified?: string;
  completed?: string;
  editor?: boolean;
}

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
  const inProgressSurveys: Survey[] = [
    { id: '524878', title: 'iDoRecall after one month\'s use', owner: 'David Handel', fieldingStatus: '13/40 (32%)' },
    { id: '617575', title: 'Wish list for future iDoRecall roadmap', owner: 'David Handel', fieldingStatus: '77/575 (13%)' }
  ];



  const completedSurveys: Survey[] = [
    { id: '511890', title: 'iDoRecall - test for ideal target likelihood to sign up', owner: 'David Handel', completed: 'Oct 11 2018' },
    { id: '516150', title: 'idr student challenges', owner: 'David Handel', completed: 'Nov 08 2018' }
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-[#264F79] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={logo} alt="Zrveys" className="h-8" />
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
        <div className="flex items-center gap-2 mb-4 bg-gray-900 text-white px-4 py-3 rounded-t-lg">
          <RocketLaunchIcon className="h-5 w-5" />
          <h2 className="text-lg font-medium">Surveys in progress</h2>
          <span className="text-sm ml-2">{inProgressSurveys.length} surveys</span>
          <ChevronDownIcon className="h-5 w-5 ml-auto" />
        </div>
        <div className="bg-white shadow rounded-b-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fielding Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inProgressSurveys.map((survey) => (
                <tr key={survey.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{survey.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{survey.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{survey.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: survey.fieldingStatus?.match(/\d+/)?.[0] + '%' }} />
                    </div>
                    <span className="text-xs ml-2">{survey.fieldingStatus}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drafts Section */}
      <div className="mb-8">
        <DraftsList />
      </div>

      {/* Completed Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 bg-gray-900 text-white px-4 py-3 rounded-t-lg">
          <CheckCircleIcon className="h-5 w-5" />
          <h2 className="text-lg font-medium">Completed</h2>
          <span className="text-sm ml-2">{completedSurveys.length} surveys</span>
          <button className="ml-auto text-sm text-gray-300 hover:text-white">add new folder</button>
          <ChevronDownIcon className="h-5 w-5" />
        </div>
        <div className="bg-white shadow rounded-b-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedSurveys.map((survey) => (
                <tr key={survey.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{survey.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{survey.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{survey.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{survey.completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
