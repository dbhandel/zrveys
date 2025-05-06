import React, { useRef, useState } from 'react';
import { FaTrash, FaCamera, FaExpand } from 'react-icons/fa';
import { QuestionType, QuestionTypeModel, QuestionOption } from '../types/survey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Modal } from './common/Modal';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface AnswerListProps {
  question: QuestionTypeModel;
  updateQuestion: (updates: Partial<QuestionTypeModel>) => void;
}

interface SortableAnswerProps {
  option: QuestionOption;
  index: number;
  questionType: QuestionType;
  onUpdate: (updates: Partial<QuestionOption>) => void;
  onDelete: () => void;
}

const SortableAnswer: React.FC<SortableAnswerProps> = ({ option, index, questionType, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-lg p-4 mb-4 relative w-full"
    >
      <div className="flex items-center space-x-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
        >
          ⋮⋮
        </div>
        <span className="text-gray-500 w-8 text-center">{index + 1}</span>
        <input
          type={questionType === QuestionType.RADIO ? 'radio' : 'checkbox'}
          disabled
          className="mr-2"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={option.text === `Option ${index + 1}` ? '' : option.text}
            onChange={(e) => onUpdate({ text: e.target.value || `Option ${index + 1}` })}
            className="w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder={`Option ${index + 1}`}
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
            {option.image ? (
              <div 
                className="w-6 h-6 cursor-pointer group"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img
                  src={option.image}
                  alt="Answer option"
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
                {option.imageLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  <FaCamera size={14} />
                )}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-500 transition-colors ml-2"
        >
          <FaTrash />
        </button>
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      >
        {option.image && (
          <div className="relative">
            <img
              src={option.image}
              alt="Answer option"
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
    </div>
  );
};

export default function AnswerList({ question, updateQuestion }: AnswerListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && question.options) {
      const oldIndex = question.options.findIndex(o => o.id === active.id);
      const newIndex = question.options.findIndex(o => o.id === over.id);
      const newOptions = arrayMove(question.options, oldIndex, newIndex);
      updateQuestion({ options: newOptions });
    }
  };

  const handleOptionUpdate = (index: number, updates: Partial<QuestionOption>) => {
    if (!question.options) return;

    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateQuestion({ options: newOptions });
  };

  const handleRemoveAnswer = (id: string) => {
    if (!question.options) return;

    updateQuestion({
      options: question.options.filter((option) => option.id !== id)
    });
  };

  const handleAddAnswer = () => {
    updateQuestion({
      options: [...(question.options || []), { 
        id: crypto.randomUUID(), 
        text: `Option ${(question.options || []).length + 1}`,
        image: undefined,
        imageLoading: false
      }]
    });
  };

  // For OPEN_ENDED questions, show a preview of the input field
  if (question.type === QuestionType.OPEN_ENDED) {
    return (
      <div className="mt-4">
        <div className="bg-gray-50 border rounded-md p-4">
          <input
            type="text"
            disabled
            placeholder="Respondent's answer will appear here"
            className="w-full px-3 py-2 border rounded-md bg-white/50 text-gray-400"
          />
        </div>
      </div>
    );
  }

  // For RADIO and CHECKBOX questions, show the options list
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={question.options?.map(o => o.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <SortableAnswer
                key={option.id}
                option={option}
                index={index}
                questionType={question.type}
                onUpdate={(updates) => handleOptionUpdate(index, updates)}
                onDelete={() => handleRemoveAnswer(option.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex items-center space-x-2 mt-2">
        <button
          onClick={handleAddAnswer}
          className="text-secondary hover:text-secondary-light flex items-center space-x-1 transition-colors"
        >
          <span>+</span>
          <span>Add an answer ({10 - (question.options?.length || 0)} left)</span>
        </button>
      </div>
    </>
  );
}
