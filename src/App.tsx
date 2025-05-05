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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function App() {
  const { survey, removeQuestion, updateQuestion, reorderQuestions, addQuestion } = useSurveyStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
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
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={survey.questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
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
