import React from 'react';
import { useNavigate } from "react-router-dom";
import { ShareSurveyModal } from "../components/ShareSurveyModal";
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
  const [respondents, setRespondents] = React.useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [launchedSurveyId, setLaunchedSurveyId] = React.useState<string>('');
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

          {/* Launch Controls */}
          <div className="mt-8 flex flex-wrap justify-end gap-4">
            <select
              value={respondents}
              onChange={(e) => setRespondents(parseInt(e.target.value))}
              className="min-w-fit flex-grow max-w-[300px] py-4 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-base"
            >
              <option value={0}>How many respondents would you like?</option>
              {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'respondent' : 'respondents'}</option>
              ))}
            </select>

            <button
              onClick={() => {
                // In a real app, we'd save the survey to the backend here
                const newSurveyId = crypto.randomUUID(); // This would come from the backend
                setLaunchedSurveyId(newSurveyId);
                setIsShareModalOpen(true);
              }}
              disabled={!survey.questions.some(q => {
                // Check if question has non-default content
                const hasQuestionContent = q.questionText && 
                                         q.questionText.trim() !== '' && 
                                         !q.questionText.startsWith('Question ');
                
                // For radio/checkbox, check if it has at least 2 answers with non-default content
                if (q.type !== QuestionType.OPEN_ENDED) {
                  const validAnswers = (q.options || []).filter(opt => 
                    opt.text && 
                    opt.text.trim() !== '' && 
                    opt.text !== 'Option 1' && 
                    opt.text !== 'Option 2'
                  ).length;
                  return hasQuestionContent && validAnswers >= 2;
                }
                
                // For open-ended, just need non-default question content
                return hasQuestionContent;
              }) || respondents === 0}
              className={`min-w-[120px] py-4 px-8 rounded-lg text-white font-bold text-base transition-colors ${(
                !survey.questions.some(q => {
                  const hasQuestionContent = q.questionText && 
                                           q.questionText.trim() !== '' && 
                                           !q.questionText.startsWith('Question ');
                  if (q.type !== QuestionType.OPEN_ENDED) {
                    const validAnswers = (q.options || []).filter(opt => 
                      opt.text && 
                      opt.text.trim() !== '' && 
                      opt.text !== 'Option 1' && 
                      opt.text !== 'Option 2'
                    ).length;
                    return hasQuestionContent && validAnswers >= 2;
                  }
                  return hasQuestionContent;
                }) || respondents === 0
              )
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#8C3375] hover:bg-[#732c60] cursor-pointer'
              }`}
            >
              Launch Survey
            </button>
          </div>

          {/* Share Survey Modal */}
          <ShareSurveyModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            surveyId={launchedSurveyId}
          />
        </div>
      </main>
    </div>
  );
};
