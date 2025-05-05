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

  const isQuestionValid = (question: QuestionTypeModel) => {
    // Check if question text is empty or just the default text
    if (!question.questionText.trim() || question.questionText.startsWith('Question ')) {
      return false;
    }
    
    // For open-ended questions, just need valid question text
    if (question.type === QuestionType.OPEN_ENDED) {
      return true;
    }

    // For Radio and Checkbox questions, need at least 2 non-empty options
    const validOptions = (question.options || []).filter(option => 
      option.text.trim() !== '' && option.text !== 'Option 1' && option.text !== 'Option 2'
    );
    return validOptions.length >= 2;
  };

  const isSurveyValid = () => {
    // Need at least one question and all questions must be valid
    return survey.questions.length > 0 && survey.questions.every(isQuestionValid);
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
      <header className="w-full bg-[#264F79] shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <img src={logo} alt="Zrveys" className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#8C3375] hover:bg-[#732c60] text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#8C3375] hover:bg-[#732c60] text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
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

          <button
            onClick={() => console.log('Launching survey...')}
            disabled={!isSurveyValid()}
            className={`mt-8 w-full py-4 rounded-lg text-white font-bold text-lg transition-colors ${!isSurveyValid() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#8C3375] hover:bg-[#732c60] cursor-pointer'}`}
          >
            Launch Survey
          </button>
        </div>
      </main>
    </div>
  );
};
