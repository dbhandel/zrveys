import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { surveyService } from '../services/surveyService';
import Question from '../components/Question';
import { QuestionType, QuestionTypeModel } from '../types/survey';
import { DraftSurveyModel } from '../services/surveyService';

interface CreateSurveyState {
  title: string;
  questions: QuestionTypeModel[];
}

export const CreateSurvey: React.FC = () => {
  const { draftId: urlDraftId } = useParams();

  // Clear localStorage when creating a new survey
  useEffect(() => {
    if (!urlDraftId) {
      localStorage.removeItem('survey_draft');
      localStorage.removeItem('survey_draft_id');
    }
  }, [urlDraftId]);

  const defaultSurvey = {
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'RADIO' as QuestionType,
        questionText: '',
        options: [
          { id: crypto.randomUUID(), text: '' },
          { id: crypto.randomUUID(), text: '' }
        ],
      }
    ],
    title: '',
  };

  const [survey, setSurvey] = useState<CreateSurveyState>(() => {
    // Always start with a fresh form when there's no draftId
    if (!urlDraftId) {
      localStorage.removeItem('survey_draft');
      localStorage.removeItem('survey_draft_id');
      return defaultSurvey;
    }
    
    // Return empty state when loading a draft - will be populated by useEffect
    return {
      questions: [{
        id: crypto.randomUUID(),
        type: 'RADIO' as QuestionType,
        questionText: '',
        options: [
          { id: crypto.randomUUID(), text: '' },
          { id: crypto.randomUUID(), text: '' }
        ],
      }],
      title: ''
    };
  });
  const [draftId] = useState(() => {
    return urlDraftId || localStorage.getItem('survey_draft_id') || crypto.randomUUID();
  });
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [respondents, setRespondents] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    const newQuestion: QuestionTypeModel = {
      id: crypto.randomUUID(),
      type: QuestionType.RADIO,
      questionText: `Question ${survey.questions.length + 1}`,
      options: [
        { id: crypto.randomUUID(), text: 'Option 1' },
      ],
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const { currentUser, loading } = useAuth();

  // Load draft data if draftId is provided in URL
  useEffect(() => {
    const loadDraft = async () => {
      if (urlDraftId) {
        try {
          const draftData = await surveyService.getDraft(urlDraftId);
          if (draftData) {
            setSurvey({
              title: draftData.title,
              questions: draftData.questions
            });
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          navigate('/create');
        }
      }
    };
    loadDraft();
  }, [urlDraftId, navigate]);

  useEffect(() => {
    console.log('Auth state:', { 
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        isAnonymous: currentUser.isAnonymous,
      } : null,
      loading 
    });
  }, [currentUser, loading]);

  const autoSave = useCallback(async () => {
    if (!currentUser) {
      setSaveError('Please sign in to save drafts');
      return;
    }
    
    try {
      setIsSavingDraft(true);
      setSaveError(null);
      const draftData: DraftSurveyModel = {
        title: survey.title,
        questions: survey.questions,
        owner: currentUser.uid,
        updatedAt: new Date(),
      };
      await surveyService.saveDraft(draftId, draftData);
      localStorage.setItem('survey_draft', JSON.stringify(survey));
      localStorage.setItem('survey_draft_id', draftId);
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Error auto-saving survey:', error);
      setSaveError(error.message || 'Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  }, [survey, draftId, currentUser]);

  useEffect(() => {
    if (!survey.title && !survey.questions[0].questionText) return;
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [survey, autoSave]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to create and save surveys.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">

          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Survey</h1>
              {saveError ? (
                <div className="mt-2 text-sm text-red-600">{saveError}</div>
              ) : isSavingDraft ? (
                <div className="mt-2 text-sm text-blue-600">Saving...</div>
              ) : lastSaved && (
                <div className="mt-2 text-sm text-green-600">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Survey Title (required)"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full p-4 border rounded-lg text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-secondary ${!survey.title.trim() ? 'border-red-500' : ''}`}
              required
            />
            {!survey.title.trim() && (
              <p className="mt-2 text-red-500 text-sm">Please enter a survey title</p>
            )}
          </div>

          <div className="mb-8">
            <Question
              key={survey.questions[0].id}
              question={{ ...survey.questions[0], index: 0 }}
              onDelete={() => {
                setSurvey(prev => ({
                  ...prev,
                  questions: prev.questions.slice(1)
                }));
              }}
              onUpdate={(updates) => {
                setSurvey(prev => ({
                  ...prev,
                  questions: [
                    { ...prev.questions[0], ...updates },
                    ...prev.questions.slice(1)
                  ]
                }));
              }}
              canDelete={false}
            />
          </div>

          <div className="space-y-4">
            {survey.questions.slice(1).map((question, index) => (
              <Question
                key={question.id}
                question={{ ...question, index: index + 1 }}
                onDelete={() => {
                  setSurvey(prev => ({
                    ...prev,
                    questions: [
                      ...prev.questions.slice(0, index + 1),
                      ...prev.questions.slice(index + 2)
                    ]
                  }));
                }}
                onUpdate={(updates) => {
                  setSurvey(prev => ({
                    ...prev,
                    questions: [
                      ...prev.questions.slice(0, index + 1),
                      { ...question, ...updates },
                      ...prev.questions.slice(index + 2)
                    ]
                  }));
                }}
                canDelete={true}
              />
            ))}
          </div>

          <button
            onClick={handleAddQuestion}
            className="mt-6 w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2"
          >
            Add Question
          </button>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={async () => {
                setIsSavingDraft(true);
                try {
                  const draftData: DraftSurveyModel = {
                    ...survey,
                    owner: currentUser?.uid || '',
                    updatedAt: new Date(),
                  };
                  await surveyService.saveDraft(draftId, draftData);
                  localStorage.setItem('survey_draft', JSON.stringify(survey));
                  localStorage.setItem('survey_draft_id', draftId);
                  navigate('/dashboard');
                } catch (error) {
                  console.error('Error saving draft:', error);
                  alert('Failed to save draft. Please try again.');
                } finally {
                  setIsSavingDraft(false);
                }
              }}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-4">
            <select
              value={respondents}
              onChange={(e) => setRespondents(parseInt(e.target.value))}
              className="block w-48 px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="0">Select respondents</option>
              <option value="10">10 respondents</option>
              <option value="25">25 respondents</option>
              <option value="50">50 respondents</option>
              <option value="100">100 respondents</option>
              <option value="250">250 respondents</option>
              <option value="500">500 respondents</option>
              <option value="1000">1000 respondents</option>
            </select>

            <button
              type="button"
              onClick={async () => {
                if (!survey.title.trim()) {
                  alert('Please enter a survey title');
                  return;
                }

                if (!survey.questions[0].questionText.trim()) {
                  alert('Please enter text for the first question');
                  return;
                }

                const options = survey.questions[0].options || [];
                if (options.length < 2) {
                  alert('Please add at least two options for the first question');
                  return;
                }
                if (!options.every(opt => opt.text.trim())) {
                  alert('Please fill in all options for the first question');
                  return;
                }

                if (respondents === 0) {
                  alert('Please select the number of respondents');
                  return;
                }

                try {
                  if (!currentUser) {
                    alert('Please log in to create a survey');
                    return;
                  }
                  
                  await surveyService.createSurvey(
                    survey.title,
                    survey.questions,
                    respondents
                  );
                  
                  // Clear the draft after successful creation
                  localStorage.removeItem('survey_draft');
                  localStorage.removeItem('survey_draft_id');
                  
                  navigate('/dashboard');
                } catch (error: any) {
                  console.error('Error creating survey:', error);
                  alert(`Failed to create survey: ${error.message}`);
                }
              }}
              disabled={!survey.questions.some(q => {
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
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              Launch Survey
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
