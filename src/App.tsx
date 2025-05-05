import React from 'react';
import { useSurveyStore } from './context/surveyStore';
import { QuestionType } from './types/survey';
import Question from './components/Question';
import QuestionForm from './components/QuestionForm';

function App() {
  const { survey, addQuestion, removeQuestion, updateQuestion } = useSurveyStore();

  const handleAddQuestion = (question: { questionText: string; type: QuestionType }) => {
    addQuestion({
      ...question,
      id: crypto.randomUUID(),
      options: question.type === QuestionType.RADIO || question.type === QuestionType.CHECKBOX
        ? [
            { id: crypto.randomUUID(), text: 'Option 1' },
            { id: crypto.randomUUID(), text: 'Option 2' },
          ]
        : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Survey Builder</h1>
        
        <QuestionForm onAddQuestion={handleAddQuestion} />
        
        <div className="space-y-6">
          {survey.questions.map((question) => (
            <Question
              key={question.id}
              question={question}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
