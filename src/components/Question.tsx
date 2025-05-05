import { useState } from 'react';
import { QuestionType, Question as QuestionTypeModel, QuestionOption, QuestionAnswer } from '../types/survey';
import { motion } from 'framer-motion';

interface QuestionProps {
  question: QuestionTypeModel;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
  removeQuestion: (id: string) => void;
}

export default function Question({
  question,
  editingQuestionId,
  setEditingQuestionId,
  updateQuestion,
  removeQuestion,
}: QuestionProps) {
  const [newOptionText, setNewOptionText] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newQuestionText, setNewQuestionText] = useState(question.questionText);

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;

    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      text: newOptionText.trim()
    };

    updateQuestion(question.id, {
      options: [...(question.options || []), newOption]
    });
    setNewOptionText('');
  };

  const handleRemoveOption = (optionId: string) => {
    updateQuestion(question.id, {
      options: question.options?.filter(option => option.id !== optionId)
    });
  };

  const handleAddAnswer = () => {
    if (!newAnswer.trim()) return;

    const newAnswerObj: QuestionAnswer = {
      id: crypto.randomUUID(),
      text: newAnswer.trim(),
      userId: 'anonymous', // In a real app, this would be the actual user ID
      timestamp: new Date()
    };

    updateQuestion(question.id, {
      answers: [...(question.answers || []), newAnswerObj]
    });
    setNewAnswer('');
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuestion(question.id, { questionText: e.target.value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{question.questionText}</h3>
        {editingQuestionId === question.id ? (
          <button
            onClick={() => setEditingQuestionId(null)}
            className="text-red-600 hover:text-red-800"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setEditingQuestionId(question.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
      </div>

      {editingQuestionId === question.id ? (
        <div className="space-y-4">
          <input
            type="text"
            value={newQuestionText}
            onChange={handleQuestionTextChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter question text"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Options (for Multiple Choice questions)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Enter option"
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Option
              </button>
            </div>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <span>{option.text}</span>
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {question.type === QuestionType.RADIO && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.type === QuestionType.CHECKBOX && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={option.id}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.type === QuestionType.SHORT_ANSWER && (
            <div className="space-y-2">
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter your answer"
              />
              <button
                onClick={handleAddAnswer}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Answer
              </button>
            </div>
          )}
          
          {question.type === QuestionType.LONG_ANSWER && (
            <div className="space-y-2">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter your detailed answer"
                rows={4}
              />
              <button
                onClick={handleAddAnswer}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Answer
              </button>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => removeQuestion(question.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Question
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{editingQuestionId === question.id ? 'Edit Question' : 'Question'}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingQuestionId(question.id)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editingQuestionId === question.id ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={() => removeQuestion(question.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {editingQuestionId === question.id ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <input
              type="text"
              value={question.questionText}
              onChange={handleQuestionTextChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {(question.type === QuestionType.RADIO || question.type === QuestionType.CHECKBOX) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options
              </label>
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          options: question.options?.map((opt: QuestionOption) =>
                            opt.id === option.id ? { ...opt, text: e.target.value } : opt
                          )
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={() => handleRemoveOption(option.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="New option"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={handleAddOption}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Option
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-700 mb-2">{question.questionText}</p>
          {question.type === QuestionType.RADIO && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
                  <input type="radio" name={`q${question.id}`} value={option.text} />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}
          {question.type === QuestionType.CHECKBOX && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
                  <input type="checkbox" name={`q${question.id}`} value={option.text} />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}
          {question.type === QuestionType.SHORT_ANSWER && (
            <input type="text" className="w-full px-3 py-2 border rounded-md" />
          )}
          {question.type === QuestionType.LONG_ANSWER && (
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
          )}
        </div>
      )}
    </motion.div>
  );
}
