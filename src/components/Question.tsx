import React from 'react';
import { motion } from 'framer-motion';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AnswerList from './AnswerList';
import { FaTrash } from 'react-icons/fa';

interface QuestionProps {
  question: QuestionTypeModel;
  onChange: (updates: Partial<QuestionTypeModel>) => void;
  onRemove: () => void;
  index: number;
}

interface QuestionTypeMenuProps {
  question: QuestionTypeModel;
  updateQuestion: (updates: Partial<QuestionTypeModel>) => void;
}

const QuestionTypeMenu: React.FC<QuestionTypeMenuProps> = ({ question, updateQuestion }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={() => updateQuestion({ type: QuestionType.RADIO })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.RADIO ? 'bg-secondary text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
      >
        Radio
      </button>
      <button
        onClick={() => updateQuestion({ type: QuestionType.CHECKBOX })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.CHECKBOX ? 'bg-secondary text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
      >
        Checkbox
      </button>
      <button
        onClick={() => updateQuestion({ type: QuestionType.OPEN_ENDED })}
        className={`px-3 py-1 rounded ${question.type === QuestionType.OPEN_ENDED ? 'bg-secondary text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
      >
        Open-ended
      </button>
    </div>
  );
};

export default function Question({
  question,
  onChange,
  onRemove,
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
      className="bg-white rounded-lg shadow-md p-6 mb-4 relative w-full"
      data-id={question.id}
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
          <div className="bg-secondary/10 text-secondary w-8 h-8 flex items-center justify-center rounded">
            Q{index + 1}
          </div>
          <input
            type="text"
            value={question.questionText === `Question ${index + 1}` ? '' : question.questionText}
            onChange={(e) => onChange({ questionText: e.target.value || `Question ${index + 1}` })}
            className="px-3 py-2 border rounded-md flex-1"
            placeholder={`Question ${index + 1}`}
          />
        </div>
        <button
          onClick={onRemove}
          className="text-gray-500 hover:text-red-500"
        >
          <FaTrash />
        </button>
      </div>

      <QuestionTypeMenu question={question} updateQuestion={onChange} />
      <AnswerList question={question} updateQuestion={onChange} />
    </motion.div>
  );
}
