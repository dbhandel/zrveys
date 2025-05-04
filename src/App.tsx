import { useState } from 'react';
import { useSurveyStore } from './context/surveyStore';
import { QuestionType, Question, QuestionOption } from './types/survey';
import { motion } from 'framer-motion';

function App() {
  const { survey, addQuestion, updateQuestion, removeQuestion, updateSurvey } = useSurveyStore();
  const [newQuestionType, setNewQuestionType] = useState<QuestionType | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newOptionText, setNewOptionText] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestionType || !newQuestionText.trim()) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: newQuestionType,
      questionText: newQuestionText.trim(),
      options: newQuestionType === QuestionType.RADIO || newQuestionType === QuestionType.CHECKBOX
        ? [
            { id: crypto.randomUUID(), text: 'Option 1' },
            { id: crypto.randomUUID(), text: 'Option 2' },
          ]
        : undefined,
    };

    addQuestion(newQuestion);
    setNewQuestionType(null);
    setNewQuestionText('');
  };

  const handleAddOption = (questionId: string) => {
    if (!newOptionText.trim()) return;

    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      text: newOptionText.trim()
    };

    updateQuestion(questionId, (question) => {
      if (question.options) {
        question.options.push(newOption);
      }
      return question;
    });
    setNewOptionText('');
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    updateQuestion(questionId, (question) => {
      if (question.options) {
        question.options = question.options.filter(option => option.id !== optionId);
      }
      return question;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Survey Builder Sidebar */}
          <div className="col-span-3 bg-white rounded-xl shadow-lg">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Survey Builder</h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey Title
                  </label>
                  <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => updateSurvey({ title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Enter survey title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={survey.description}
                    onChange={(e) => updateSurvey({ description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    rows={4}
                    placeholder="Add a description..."
                  />
                </div>
              </div>
            </div>
            
            {/* Question Types */}
            <div className="p-6 border-t border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Enter question text"
                  />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setNewQuestionType(QuestionType.RADIO)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      newQuestionType === QuestionType.RADIO
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200'
                    } hover:bg-primary-50 transition-all duration-200`}
                  >
                    Multiple Choice
                  </button>
                  <button
                    onClick={() => setNewQuestionType(QuestionType.CHECKBOX)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      newQuestionType === QuestionType.CHECKBOX
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200'
                    } hover:bg-primary-50 transition-all duration-200`}
                  >
                    Checkboxes
                  </button>
                  <button
                    onClick={() => setNewQuestionType(QuestionType.SHORT_ANSWER)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      newQuestionType === QuestionType.SHORT_ANSWER
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200'
                    } hover:bg-primary-50 transition-all duration-200`}
                  >
                    Short Answer
                  </button>
                  <button
                    onClick={() => setNewQuestionType(QuestionType.LONG_ANSWER)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      newQuestionType === QuestionType.LONG_ANSWER
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200'
                    } hover:bg-primary-50 transition-all duration-200`}
                  >
                    Long Answer
                  </button>
                </div>
                <button
                  onClick={handleAddQuestion}
                  className="w-full px-4 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newQuestionType || !newQuestionText.trim()}
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>

          {/* Survey Preview */}
          <div className="col-span-9 bg-white rounded-xl shadow-lg">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Preview</h1>
              <div className="space-y-8">
                {survey.questions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900">{question.questionText}</h3>
                        {question.type === QuestionType.RADIO || question.type === QuestionType.CHECKBOX && (
                          <button
                            onClick={() => setEditingQuestionId(question.id === editingQuestionId ? null : question.id)}
                            className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            {question.id === editingQuestionId ? 'Hide Options' : 'Edit Options'}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {question.type === QuestionType.RADIO && (
                      <div className="space-y-4">
                        {question.id === editingQuestionId ? (
                          <div>
                            <div className="space-y-4">
                              {question.options?.map((option) => (
                                <div key={option.id} className="flex items-center space-x-4">
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => updateQuestion(question.id, (q) => {
                                      if (q.options) {
                                        const index = q.options.findIndex(o => o.id === option.id);
                                        q.options[index].text = e.target.value;
                                      }
                                      return q;
                                    })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                  />
                                  <button
                                    onClick={() => handleRemoveOption(question.id, option.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-4">
                              <input
                                type="text"
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                placeholder="Add new option..."
                              />
                              <button
                                onClick={() => handleAddOption(question.id)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                              >
                                Add Option
                              </button>
                            </div>
                          </div>
                        ) : (
                          question.options?.map((option) => (
                            <label key={option.id} className="flex items-center space-x-4">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.text}
                                className="h-5 w-5 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-gray-700">{option.text}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                    {question.type === QuestionType.CHECKBOX && (
                      <div className="space-y-4">
                        {question.id === editingQuestionId ? (
                          <div>
                            <div className="space-y-4">
                              {question.options?.map((option) => (
                                <div key={option.id} className="flex items-center space-x-4">
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => updateQuestion(question.id, (q) => {
                                      if (q.options) {
                                        const index = q.options.findIndex(o => o.id === option.id);
                                        q.options[index].text = e.target.value;
                                      }
                                      return q;
                                    })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                  />
                                  <button
                                    onClick={() => handleRemoveOption(question.id, option.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-4">
                              <input
                                type="text"
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                placeholder="Add new option..."
                              />
                              <button
                                onClick={() => handleAddOption(question.id)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                              >
                                Add Option
                              </button>
                            </div>
                          </div>
                        ) : (
                          question.options?.map((option) => (
                            <label key={option.id} className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                name={`question-${question.id}`}
                                value={option.text}
                                className="h-5 w-5 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-gray-700">{option.text}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                    {question.type === QuestionType.SHORT_ANSWER && (
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                        placeholder="Type your answer..."
                      />
                    )}
                    {question.type === QuestionType.LONG_ANSWER && (
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                        rows={6}
                        placeholder="Type your answer..."
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
