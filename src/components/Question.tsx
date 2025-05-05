import React from 'react';
import { motion } from 'framer-motion';
import { QuestionType, QuestionTypeModel } from '../types/survey';

interface QuestionProps {
  question: QuestionTypeModel;
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
  removeQuestion: (id: string) => void;
}

interface QuestionTypeMenuProps {
  question: QuestionTypeModel;
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
}

const QuestionTypeMenu: React.FC<QuestionTypeMenuProps> = ({ question, updateQuestion }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={() => updateQuestion(question.id, { type: QuestionType.RADIO })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.RADIO ? 'bg-secondary text-white' : 'bg-gray-200'}`}
      >
        Radio
      </button>
      <button
        onClick={() => updateQuestion(question.id, { type: QuestionType.CHECKBOX })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.CHECKBOX ? 'bg-secondary text-white' : 'bg-gray-200'}`}
      >
        Checkbox
      </button>
      <button
        onClick={() => updateQuestion(question.id, { type: QuestionType.SHORT_ANSWER })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.SHORT_ANSWER ? 'bg-secondary text-white' : 'bg-gray-200'}`}
      >
        Short Answer
      </button>
      <button
        onClick={() => updateQuestion(question.id, { type: QuestionType.LONG_ANSWER })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.LONG_ANSWER ? 'bg-secondary text-white' : 'bg-gray-200'}`}
      >
        Long Answer
      </button>
    </div>
  );
};

export default function Question({
  question,
  updateQuestion,
  removeQuestion,
}: QuestionProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Q{question.questionText.replace('Question ', '')}</span>
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
            className="px-3 py-2 border rounded-md flex-1"
            placeholder="Enter your question"
          />
        </div>
        <button
          onClick={() => removeQuestion(question.id)}
          className="text-gray-500 hover:text-red-500"
        >
          Delete
        </button>
      </div>

      <QuestionTypeMenu question={question} updateQuestion={updateQuestion} />

      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <span className="text-gray-500">{index + 1}</span>
            <input
              type={question.type === QuestionType.RADIO ? 'radio' : 'checkbox'}
              disabled
            />
            <input
              type="text"
              value={option.text}
              onChange={(e) => {
                const newOptions = [...(question.options || [])];
                newOptions[index] = { ...option, text: e.target.value };
                updateQuestion(question.id, { options: newOptions });
              }}
              className="px-3 py-2 border rounded-md flex-1"
              placeholder="Answer"
            />
            <button
              onClick={() => {
                const newOptions = question.options?.filter(o => o.id !== option.id);
                updateQuestion(question.id, { options: newOptions });
              }}
              className="text-gray-500 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => {
              const newOption = { id: crypto.randomUUID(), text: 'Answer' };
              updateQuestion(question.id, {
                options: [...(question.options || []), newOption]
              });
            }}
            className="text-secondary hover:text-secondary/80 flex items-center space-x-1"
          >
            <span>+</span>
            <span>Add an answer ({10 - (question.options?.length || 0)} left)</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
