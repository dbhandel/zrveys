import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useSurveyStore } from '../context/surveyStore';
import Question from '../components/Question';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { FaPlus } from 'react-icons/fa';
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
import logo from "../assets/new zrveys logo.png";

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { survey, removeQuestion, updateQuestion, reorderQuestions, addQuestion } = useSurveyStore();
  const questionsContainerRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = survey.questions.findIndex((q: QuestionTypeModel) => q.id === active.id);
      const newIndex = survey.questions.findIndex((q: QuestionTypeModel) => q.id === over.id);

      reorderQuestions(arrayMove(survey.questions, oldIndex, newIndex));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionTypeModel = {
      id: crypto.randomUUID(),
      type: QuestionType.RADIO,
      questionText: `Question ${survey.questions.length + 1}`,
      options: [
        { id: crypto.randomUUID(), text: 'Option 1' },
        { id: crypto.randomUUID(), text: 'Option 2' }
      ]
    };
    addQuestion(newQuestion);
  };

  return (
    <div className="min-h-screen w-full bg-primary flex flex-col items-center">
      <header className="w-full bg-primary shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <img src={logo} alt="Zrveys" className="h-12" />
          </div>
          <button
            onClick={handleLogout}
            className="text-white hover:text-secondary transition-colors font-medium"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl px-4 py-8">
        <div className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div ref={questionsContainerRef} className="space-y-4">
              <SortableContext
                items={survey.questions.map((q: QuestionTypeModel) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {survey.questions.map((question: QuestionTypeModel, index: number) => (
                  <Question
                    key={question.id}
                    question={question}
                    index={index}
                    onRemove={() => removeQuestion(question.id)}
                    onChange={(updatedQuestion: Partial<QuestionTypeModel>) =>
                      updateQuestion(question.id, updatedQuestion)
                    }
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>

          <button
            onClick={handleAddQuestion}
            className="mt-6 w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus />
            Add Question
          </button>
        </div>
      </main>
    </div>
  );
};
