import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { QuestionType } from '../types/survey';
import { SurveyResponse, QuestionResponse } from '../types/response';
import { SurveyResultsData, QuestionResult } from '../types/results';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Color palette similar to the example
const COLORS = [
  '#8BC34A', // Light green
  '#4CAF50', // Green
  '#009688', // Teal
  '#00ACC1', // Cyan
  '#1E88E5', // Blue
];

export const SurveyResults: React.FC = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(true); // State for collapsible section

  useEffect(() => {
    const loadSurveyAndResponses = async () => {
      if (!surveyId) {
        navigate('/dashboard');
        return;
      }

      try {
        const survey = await surveyService.getSurvey(surveyId);
        if (!survey) {
          setError('Survey not found');
          setIsLoading(false);
          return;
        }

        const rawResponses = await surveyService.getResponses(surveyId);
        console.log('Raw responses:', rawResponses);

        // Process the survey data and responses
        const processedData: SurveyResultsData = {
          id: survey.id,
          title: survey.title,
          respondents: survey.respondents,
          responses: rawResponses,
          questions: survey.questions.map(question => {
            const result: QuestionResult = {
              id: question.id,
              questionText: question.questionText,
              type: question.type as QuestionType
            };

            if (question.type !== QuestionType.OPEN_ENDED && question.options) {
              result.options = question.options.map(option => {
                let count = 0;
                if (question.type === QuestionType.CHECKBOX) {
                  // For checkbox, response is an array of selected options
                  count = rawResponses.filter((r: SurveyResponse) => {
                    const answer = r.answers.find((a: QuestionResponse) => a.questionId === question.id);
                    return answer && Array.isArray(answer.answers) && answer.answers.includes(option.text);
                  }).length;
                } else {
                  // For radio, response is a single string
                  count = rawResponses.filter((r: SurveyResponse) => {
                    const answer = r.answers.find((a: QuestionResponse) => a.questionId === question.id);
                    return answer && answer.answer === option.text;
                  }).length;
                }
                const percentage = rawResponses.length ? (count / rawResponses.length) * 100 : 0;

                return {
                  id: option.id,
                  text: option.text,
                  count,
                  percentage
                };
              });
            }

            return result;
          })
        };

        setSurveyData(processedData);
      } catch (error) {
        console.error('Error loading survey results:', error);
        setError('Failed to load survey results');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{error}</h2>
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

  if (!surveyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{surveyData.title}</h1>
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
                    width: `${(surveyData.responses.length / surveyData.respondents) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-4 text-sm text-gray-600">
                {surveyData.responses.length} / {surveyData.respondents} responses
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Question Results</h2>
            {surveyData.questions.map((question, index) => (
              <div key={question.id} className="mb-8 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">
                  {index + 1}. {question.questionText}
                </h3>
                {question.type === QuestionType.OPEN_ENDED ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surveyData.responses
                      .map((r: SurveyResponse) => r.answers.find((a: QuestionResponse) => a.questionId === question.id)?.answer)
                      .filter(Boolean)
                      .map((response, i) => (
                        <div 
                          key={i} 
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <p className="text-sm text-gray-700 font-normal italic">
                            "{response}"
                          </p>
                        </div>
                      ))}
                  </div>
                ) : question.options ? (
                  <div className="space-y-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4">
                      {question.options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{option.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={question.options.map(option => ({
                            name: option.text,
                            percentage: Math.round(option.percentage),
                            count: option.count
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                          />
                          <YAxis
                            domain={[0, 100]}
                            label={{ 
                              value: 'Percentage of Responses (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle' }
                            }}
                          />
                          <Tooltip 
                            formatter={(value: number, _name: string, props: any) => {
                              const count = props.payload.count;
                              return [`${value}% (${count} ${count === 1 ? 'response' : 'responses'})`];
                            }}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar 
                            dataKey="percentage" 
                            radius={[4, 4, 0, 0]}
                          >
                            {question.options.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Collapsible Answers Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 hover:text-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <span>Answers</span>
                          <span className="text-sm text-gray-500">
                            ({surveyData.responses.length} total)
                          </span>
                        </div>
                        <svg
                          className={`h-5 w-5 transform ${showAnswers ? 'rotate-180' : ''} transition-transform`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showAnswers && (
                        <div className="mt-4 space-y-2">
                          {question.options.map((option, index) => (
                            <div key={option.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="text-sm">{option.text}</div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {option.count} ({Math.round(option.percentage)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
