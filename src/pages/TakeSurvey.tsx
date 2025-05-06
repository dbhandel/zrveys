import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import logo from "../assets/new zrveys logo.png";
import { SurveyWidget } from '../components/survey/SurveyWidget';
import { QuestionTypeModel } from '../types/survey';
import { surveyService } from '../services/surveyService';

export const TakeSurvey: React.FC = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState<{
    id: string;
    title: string;
    questions: QuestionTypeModel[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        if (!surveyId) {
          setError('Survey ID is required');
          setLoading(false);
          return;
        }

        const surveyData = surveyService.getSurvey(surveyId);
        
        if (!surveyData) {
          setError('Survey not found');
          setLoading(false);
          return;
        }
        
        if (!surveyData.active) {
          setError('Survey is no longer active');
          setLoading(false);
          return;
        }

        setSurvey({
          id: surveyData.id,
          title: surveyData.title,
          questions: surveyData.questions
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load survey');
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  return (
    <div className="min-h-screen bg-[#1B95A8]">
      <header className="bg-[#264F79] p-4">
        <div className="container mx-auto flex justify-between items-center">
          <img src={logo} alt="Zrveys Logo" className="h-8" />
        </div>
      </header>

      <main className="container mx-auto max-w-3xl py-8 px-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading survey...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !survey ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">Survey not found</p>
          </div>
        ) : (
          <SurveyWidget survey={survey} />
        )}
      </main>
    </div>
  );
};
