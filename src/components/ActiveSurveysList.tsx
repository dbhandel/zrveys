import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaTrash } from 'react-icons/fa';
import { surveyService, ActiveSurveyListItem } from '../services/surveyService';

export const ActiveSurveysList: React.FC = () => {
  const [surveys, setSurveys] = useState<ActiveSurveyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load surveys immediately
    loadSurveys();

    // Refresh when a response is submitted
    const handleResponseSubmitted = (event: CustomEvent) => {
      console.log('[ActiveSurveysList] Response submitted event received:', event.detail);
      loadSurveys();
    };

    window.addEventListener('zrveys:surveyResponseSubmitted', handleResponseSubmitted as EventListener);
    console.log('[ActiveSurveysList] Event listener attached');

    // Cleanup on unmount
    return () => {
      window.removeEventListener('zrveys:surveyResponseSubmitted', handleResponseSubmitted as EventListener);
      console.log('[ActiveSurveysList] Event listener detached');
    };
  }, []);

  const handleDelete = async (surveyId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this survey? This cannot be undone.')) {
        await surveyService.deleteSurvey(surveyId);
        await loadSurveys(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const loadSurveys = async () => {
    console.log('[ActiveSurveysList] Loading surveys...');
    try {
      const surveyList = await surveyService.getActiveSurveys();
      console.log('[ActiveSurveysList] Surveys loaded:', surveyList);
      setSurveys(surveyList);
    } catch (error) {
      console.error('[ActiveSurveysList] Error loading surveys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-6xl mx-auto">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📊</span>
          <h2 className="text-lg font-medium">Surveys in progress</h2>
          <span className="text-sm text-gray-500">{surveys.length} surveys</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg
            className={`w-5 h-5 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="w-full px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fielding Status
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LAUNCHED
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{survey.id.slice(0, 6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {survey.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${survey.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {survey.progress.toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {survey.responses}/{survey.respondents} responses
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {survey.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => navigate(`/results/${survey.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Results"
                      >
                        <FaChartBar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Survey"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
