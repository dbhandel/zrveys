import { useState } from 'react';
import { QuestionType } from '../types/survey';

interface QuestionFormProps {
  onAddQuestion: (question: { questionText: string; type: QuestionType }) => void;
}

export default function QuestionForm({ onAddQuestion }: QuestionFormProps) {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType | null>(null);

  const handleAddQuestion = () => {
    if (!newQuestionType || !newQuestionText.trim()) return;
    
    onAddQuestion({
      questionText: newQuestionText.trim(),
      type: newQuestionType
    });
    
    setNewQuestionText('');
    setNewQuestionType(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your question"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            value={newQuestionType || ''}
            onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select question type</option>
            <option value="RADIO">Multiple Choice (Single Answer)</option>
            <option value="CHECKBOX">Multiple Choice (Multiple Answers)</option>
            <option value="TEXT">Text Input</option>
          </select>
        </div>
        <button
          onClick={handleAddQuestion}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={!newQuestionType || !newQuestionText.trim()}
        >
          Add Question
        </button>
      </div>
    </div>
  );
}
