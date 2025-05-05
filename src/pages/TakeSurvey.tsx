import React from 'react';
import { useParams } from 'react-router-dom';
import logo from "../assets/new zrveys logo.png";

export const TakeSurvey: React.FC = () => {
  const { surveyId } = useParams();
  
  // In a real app, we would fetch the survey data using the surveyId
  
  return (
    <div className="min-h-screen bg-[#1B95A8]">
      <header className="bg-[#264F79] p-4">
        <div className="container mx-auto flex justify-between items-center">
          <img src={logo} alt="Zrveys Logo" className="h-8" />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Take Survey</h1>
          <p className="text-gray-600">Survey ID: {surveyId}</p>
          
          {/* In a real app, we would render the survey questions here */}
          <p className="mt-4 text-gray-600">
            This survey will be available soon. The survey creator is still setting things up.
          </p>
        </div>
      </main>
    </div>
  );
};
