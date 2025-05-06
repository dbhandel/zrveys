import React, { useState, useEffect } from 'react';

import Cookies from 'js-cookie';
import { QuestionTypeModel } from '../../types/survey';
import { SurveyResponse, QuestionResponse } from '../../types/response';

interface SurveyWidgetProps {
  survey: {
    id: string;
    title: string;
    questions: QuestionTypeModel[];
  };
}

export const SurveyWidget: React.FC<SurveyWidgetProps> = ({ survey }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    // Check if user has already completed this survey
    const completedSurveys = Cookies.get('completed_surveys');
    if (completedSurveys?.includes(survey.id)) {
      // Show message that survey was already completed
      setIsCompleted(true);
      return;
    }

    // Check for existing progress
    const savedResponse = localStorage.getItem(`survey_response_${survey.id}`);
    if (savedResponse) {
      const parsed = JSON.parse(savedResponse) as SurveyResponse;
      setResponse(parsed);
      setCurrentQuestionIndex(parsed.currentQuestionIndex);
    } else {
      // Initialize new response
      const newResponse: SurveyResponse = {
        id: crypto.randomUUID(),
        surveyId: survey.id,
        answers: [],
        startedAt: new Date().toISOString(),
        currentQuestionIndex: 0
      };
      setResponse(newResponse);
      localStorage.setItem(`survey_response_${survey.id}`, JSON.stringify(newResponse));
    }
  }, [survey.id]);

  const handleAnswer = (answer: string | string[]) => {
    if (!response || isCompleted) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const newAnswer: QuestionResponse = {
      questionId: currentQuestion.id,
      answer: Array.isArray(answer) ? undefined : answer,
      answers: Array.isArray(answer) ? answer : undefined,
      answeredAt: new Date().toISOString()
    };

    const newResponse = {
      ...response,
      answers: [...response.answers.filter(a => a.questionId !== currentQuestion.id), newAnswer],
      currentQuestionIndex: currentQuestionIndex + 1
    };

    // If this was the last question, mark as completed
    if (currentQuestionIndex === survey.questions.length - 1) {
      newResponse.completedAt = new Date().toISOString();
      setIsCompleted(true);
      
      // Save to completed surveys cookie
      const completedSurveys = Cookies.get('completed_surveys')?.split(',') || [];
      completedSurveys.push(survey.id);
      Cookies.set('completed_surveys', completedSurveys.join(','), { expires: 365 });
    }

    // Save progress
    setResponse(newResponse);
    localStorage.setItem(`survey_response_${survey.id}`, JSON.stringify(newResponse));
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank you!</h2>
        <p className="text-gray-600 text-center">
          Your response has been recorded. You may close this window.
        </p>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-secondary h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%`
          }}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {currentQuestion.questionText}
        </h3>
        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="Question"
            className="max-w-full h-auto rounded-lg mb-6"
          />
        )}
      </div>

      {/* Answer options */}
      <div className="space-y-4">
        {currentQuestion.type === 'OPEN_ENDED' ? (
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setCurrentAnswer(e.target.value);
            }}
            placeholder="Type your answer here..."
            className="w-full p-4 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        ) : (
          currentQuestion.options?.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                if (currentQuestion.type === 'RADIO') {
                  setCurrentAnswer(option.text);
                } else if (currentQuestion.type === 'CHECKBOX') {
                  const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
                  const newAnswers = currentAnswers.includes(option.text)
                    ? currentAnswers.filter(a => a !== option.text)
                    : [...currentAnswers, option.text];
                  setCurrentAnswer(newAnswers);
                }
              }}
              className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type={currentQuestion.type === 'RADIO' ? 'radio' : 'checkbox'}
                checked={
                  currentQuestion.type === 'RADIO'
                    ? currentAnswer === option.text
                    : Array.isArray(currentAnswer) && currentAnswer.includes(option.text)
                }
                readOnly
                className="text-secondary"
              />
              <span className="flex-1">{option.text}</span>
              {option.image && (
                <img
                  src={option.image}
                  alt="Answer option"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <div className="text-sm text-gray-500">
          {currentQuestionIndex + 1} of {survey.questions.length}
        </div>
        {currentQuestionIndex < survey.questions.length - 1 ? (
          <button
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (currentQuestion.type === 'OPEN_ENDED') {
                handleAnswer(textInput);
                setTextInput('');
              } else {
                handleAnswer(currentAnswer);
                setCurrentAnswer(currentQuestion.type === 'RADIO' ? '' : []);
              }
            }}
            disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
          >
            Next
          </button>
        ) : (
          <button
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (currentQuestion.type === 'OPEN_ENDED') {
                handleAnswer(textInput);
              } else {
                handleAnswer(currentAnswer);
              }
            }}
            disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};
