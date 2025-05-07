import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AnswerList from './AnswerList';
import { FaTrash, FaCamera, FaExpand } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Modal } from './common/Modal';

interface QuestionProps {
  question: QuestionTypeModel & { index: number };
  onDelete: () => void;
  onUpdate: (updates: Partial<QuestionTypeModel>) => void;
  canDelete?: boolean;
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

const Question: React.FC<QuestionProps> = ({ question, onDelete, onUpdate, canDelete = true }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      questionText: e.target.value
    });
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
        <div className="flex items-center space-x-4 flex-1">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
          >
            ⋮⋮
          </div>
          <div className="bg-secondary/10 text-secondary w-8 h-8 flex items-center justify-center rounded">
            Q{question.index + 1}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={question.questionText === `Question ${question.index + 1}` ? '' : question.questionText}
              onChange={handleQuestionTextChange}
              className="w-full px-3 py-2 border rounded-md pr-10"
              placeholder={`Question ${question.index + 1}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUpdate({ imageLoading: true });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onUpdate({
                        image: reader.result as string,
                        imageLoading: false
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {question.image ? (
                <div 
                  className="w-6 h-6 cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={question.image}
                    alt="Question"
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <FaExpand className="text-white" size={12} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-secondary transition-colors"
                  title="Add image"
                >
                  {question.imageLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  ) : (
                    <FaCamera size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-red-500 ml-2"
          >
            <FaTrash />
          </button>
        )}
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      >
        {question.image && (
          <div className="relative">
            <img
              src={question.image}
              alt="Question"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => {
                onUpdate({ image: undefined });
                setIsImageModalOpen(false);
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full text-red-500 transition-colors"
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}
      </Modal>

      <QuestionTypeMenu question={question} updateQuestion={onUpdate} />
      <AnswerList question={question} updateQuestion={onUpdate} />
    </motion.div>
  );
};

export default Question;
