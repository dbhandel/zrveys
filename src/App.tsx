import React from 'react';
import { useSurveyStore } from './context/surveyStore';
import { FaPlus } from 'react-icons/fa';
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
    <div className="min-h-screen bg-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
    </div>
  );
}

export default App;
