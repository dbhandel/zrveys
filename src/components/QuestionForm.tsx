import { useState } from 'react';
import { QuestionType } from '../types/survey';
import { theme } from '../styles/theme';

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
    <div style={{
        backgroundColor: theme.colors.white,
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: theme.colors.primary }}>Add New Question</h2>
      <div className="space-y-4">
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.colors.primary, marginBottom: '0.25rem' }}>
            Question Text
          </label>
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem'
          }}
            placeholder="Enter your question"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.colors.primary, marginBottom: '0.25rem' }}>
            Question Type
          </label>
          <select
            value={newQuestionType || ''}
            onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
            style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem'
          }}
          >
            <option value="">Select question type</option>
            <option value="RADIO">Multiple Choice (Single Answer)</option>
            <option value="CHECKBOX">Multiple Choice (Multiple Answers)</option>
            <option value="TEXT">Text Input</option>
          </select>
        </div>
        <button
          onClick={handleAddQuestion}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: theme.colors.secondary,
            color: theme.colors.white,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            opacity: (!newQuestionType || !newQuestionText.trim()) ? 0.5 : 1
          }}
          disabled={!newQuestionType || !newQuestionText.trim()}
        >
          Add Question
        </button>
      </div>
    </div>
  );
}
