import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';

export const SurveyResults: React.FC = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    const loadSurveyAndResponses = async () => {
      if (!surveyId) {
        navigate('/dashboard');
        return;
      }

      try {
        const surveyData = await surveyService.getSurvey(surveyId);
        if (!surveyData) {
          navigate('/dashboard');
          return;
        }
        setSurvey(surveyData);

        const responsesData = await surveyService.getResponses(surveyId);
        setResponses(responsesData);
      } catch (error) {
        console.error('Error loading survey results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveyAndResponses();
  }, [surveyId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Survey not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-500 hover:text-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Survey Progress</h2>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{
                    width: `${(responses.length / survey.respondents) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-4 text-sm text-gray-600">
                {responses.length} / {survey.respondents} responses
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Question Results</h2>
            {survey.questions.map((question: any, index: number) => (
              <div key={question.id} className="mb-8">
                <h3 className="text-md font-medium mb-2">
                  {index + 1}. {question.questionText}
                </h3>
                {question.type === 'OPEN_ENDED' ? (
                  <div className="space-y-2">
                    {responses
                      .map(r => r[question.id])
                      .filter(Boolean)
                      .map((response, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded">
                          {response}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div>
                    {question.options.map((option: any) => {
                      const count = responses.filter(r => r[question.id] === option.text).length;
                      const percentage = responses.length ? (count / responses.length) * 100 : 0;
                      
                      return (
                        <div key={option.id} className="mb-2">
                          <div className="flex items-center">
                            <span className="w-32 text-sm">{option.text}</span>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-200 rounded-full h-4">
                                <div
                                  className="bg-blue-500 h-4 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
