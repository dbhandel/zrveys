import React from 'react';
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { surveyService, CompletedSurveyListItem } from '../services/surveyService';

interface State {
  surveys: CompletedSurveyListItem[];
  isLoading: boolean;
  isExpanded: boolean;
}

export const CompletedSurveysList: React.FC = () => {
  const [state, setState] = React.useState<State>({
    surveys: [],
    isLoading: true,
    isExpanded: true
  });
  
  const loadSurveys = React.useCallback(async () => {
    try {
      const surveys = await surveyService.getCompletedSurveys();
      setState(prev => ({ ...prev, surveys, isLoading: false }));
    } catch (error) {
      console.error('Error loading completed surveys:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  React.useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);
  const navigate = useNavigate();
  const { isLoading, isExpanded, surveys } = state;

  const handleDelete = async (surveyId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this completed survey? This cannot be undone.')) {
        await surveyService.deleteSurvey(surveyId);
        setState(prev => ({
          ...prev,
          surveys: prev.surveys.filter(s => s.id !== surveyId)
        }));
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
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
    <div className="bg-white rounded-lg shadow-sm w-full max-w-6xl mx-auto overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-4 bg-gray-900 text-white cursor-pointer"
        onClick={() => setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
        aria-expanded={isExpanded}
      >
        <CheckCircleIcon className="h-5 w-5" />
        <h2 className="text-lg font-medium">Completed</h2>
        <span className="text-sm ml-2">{surveys.length} surveys</span>

        <ChevronDownIcon 
          className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} 
        />
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="w-full px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.map((survey) => (
                <tr 
                  key={survey.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{survey.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {survey.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {survey.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {survey.completed.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => navigate(`/results/${survey.id}`)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Results"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Survey"
                      >
                        <FaTrash className="h-4 w-4" />
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
