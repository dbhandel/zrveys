import React from 'react';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
}

interface SortableAnswerProps {
  option: { id: string; text: string };
  index: number;
  questionType: QuestionType;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

const SortableAnswer: React.FC<SortableAnswerProps> = ({ option, index, questionType, onUpdate, onDelete }) => {
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
      className="flex items-center space-x-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
      >
        ⋮⋮
      </div>
      <span className="text-gray-500">{index + 1}</span>
      <input
        type={questionType === QuestionType.RADIO ? 'radio' : 'checkbox'}
        disabled
      />
      <input
        type="text"
        value={option.text}
        onChange={(e) => onUpdate(e.target.value)}
        className="px-3 py-2 border rounded-md flex-1"
        placeholder="Answer"
      />
      <button
        onClick={onDelete}
        className="text-gray-500 hover:text-red-500"
      >
        Delete
      </button>
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
      updateQuestion(question.id, { options: newOptions });
    }
  };

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
                onUpdate={(text) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[index] = { ...option, text };
                  updateQuestion(question.id, { options: newOptions });
                }}
                onDelete={() => {
                  const newOptions = question.options?.filter(o => o.id !== option.id);
                  updateQuestion(question.id, { options: newOptions });
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
    </>
  );
}
