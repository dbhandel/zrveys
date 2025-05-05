import React from 'react';
import { useSurveyStore } from './context/surveyStore';
import { QuestionType } from './types/survey';
import Question from './components/Question';
import QuestionForm from './components/QuestionForm';
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
  const { survey, addQuestion, removeQuestion, updateQuestion, reorderQuestions } = useSurveyStore();

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

  const handleAddQuestion = (question: { questionText: string; type: QuestionType }) => {
    addQuestion({
      ...question,
      id: crypto.randomUUID(),
      options: question.type === QuestionType.RADIO || question.type === QuestionType.CHECKBOX
        ? [
            { id: crypto.randomUUID(), text: 'Option 1' },
            { id: crypto.randomUUID(), text: 'Option 2' },
          ]
        : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Survey Builder</h1>
        
        <QuestionForm onAddQuestion={handleAddQuestion} />
        
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
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

export default App;
