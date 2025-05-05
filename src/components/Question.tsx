import React from 'react';
import { motion } from 'framer-motion';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AnswerList from './AnswerList';

interface QuestionProps {
  question: QuestionTypeModel;
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
  removeQuestion: (id: string) => void;
  index: number;
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
  index,
}: QuestionProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow p-6 mb-4 relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
          >
            ⋮⋮
          </div>
          <div className="bg-blue-50 text-blue-600 w-8 h-8 flex items-center justify-center rounded">
            Q{index + 1}
          </div>
          <span className="text-gray-500">Q{question.questionText.replace('Question ', '')}</span>
          <input
            type="text"
            value={question.questionText === `Question ${index + 1}` ? '' : question.questionText}
            onChange={(e) => updateQuestion(question.id, { questionText: e.target.value || `Question ${index + 1}` })}
            className="px-3 py-2 border rounded-md flex-1"
            placeholder={`Question ${index + 1}`}
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
      <AnswerList question={question} updateQuestion={updateQuestion} />
    </motion.div>
  );
}
