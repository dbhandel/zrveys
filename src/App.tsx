import React, { useState, useEffect } from 'react';
import { useSurveyStore } from './context/surveyStore';
import { useAuth } from './context/authContext';
import { FaPlus } from 'react-icons/fa';
import logo from "./assets/new zrveys logo.png";
import { GoogleSignIn } from './components/auth/GoogleSignIn';
import { Modal } from './components/common/Modal';
import { QuestionType, QuestionTypeModel } from './types/survey';
import Question from './components/Question';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout } = useAuth();

  // Close the auth modal when user signs in
  useEffect(() => {
    if (currentUser) {
      setShowAuthModal(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  const { survey, removeQuestion, updateQuestion, reorderQuestions, addQuestion } = useSurveyStore();
  const [dropLine, setDropLine] = React.useState<{ y: number } | null>(null);
  const questionsContainerRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setDropLine(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (!event.active || !questionsContainerRef.current) {
      setDropLine(null);
      return;
    }

    const containerRect = questionsContainerRef.current.getBoundingClientRect();
    const y = event.delta.y + (event.active.rect.current?.translated?.top || 0) + ((event.active.rect.current?.translated?.height || 0) / 2);

    // Constrain the line position between the container bounds
    const constrainedY = Math.max(
      containerRect.top,
      Math.min(y, containerRect.bottom)
    );

    setDropLine({ y: constrainedY });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDropLine(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = survey.questions.findIndex(q => q.id === active.id);
      const newIndex = survey.questions.findIndex(q => q.id === over.id);
      
      const newQuestions = arrayMove(survey.questions, oldIndex, newIndex);
      reorderQuestions(newQuestions);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-primary flex flex-col">
      <header className="w-full bg-blue-700 py-4 shadow-lg">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4">
          <div className="text-white font-bold text-xl">
            <img src={logo} alt="Zrveys" className="h-16 sm:h-20" />
          </div>
          <nav className="flex gap-6">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-white bg-transparent border-none p-0 hover:text-blue-200 active:text-blue-300 transition-colors text-sm sm:text-base font-medium"
              >
                Log out
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-white bg-transparent border-none p-0 hover:text-blue-200 active:text-blue-300 transition-colors text-sm sm:text-base font-medium"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center w-full bg-primary overflow-x-hidden">
        <div className="w-full max-w-[600px] mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Survey Builder</h1>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={survey.questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {dropLine && (
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  top: dropLine.y,
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#3b82f6',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  transform: 'translateY(-50%)',
                  transition: 'all 0ms linear'
                }}
              />
            )}
            <div ref={questionsContainerRef} className="space-y-6 py-2">
              {survey.questions.map((question, index) => (
                <Question
                  key={question.id}
                  question={question}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                  index={index}
                />
              ))}
            </div>
            <div
              role="button"
              onClick={() => {
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
              }}
              className="mt-6 flex items-center space-x-2 text-white/80 hover:text-white cursor-pointer transition-colors"
            >
              <FaPlus className="text-lg" />
              <span className="text-lg">Add question</span>
            </div>
          </SortableContext>
        </DndContext>
        </div>
      </main>
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Sign in to Zrveys">
        <GoogleSignIn />
      </Modal>
    </div>
  );
}

export default App;
