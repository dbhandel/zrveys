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
        ]
      } as QuestionTypeModel
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
        required: false,
        answer: '',
        answers: [],
        correctAnswer: '',
        correctAnswers: [],
        maxLength: undefined,
        minLength: undefined,
        maxValue: undefined,
        minValue: undefined,
        step: undefined,
        placeholder: '',
        image: undefined,
        imageLoading: false
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
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');
  const navigate = useNavigate();

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
      // Clean up questions data to ensure no undefined values
      const cleanQuestions = survey.questions.map(q => {
        const cleanQuestion: any = {
          id: q.id,
          type: q.type,
          questionText: q.questionText || ''
        };

        // Only include options for non-open-ended questions
        if (q.type !== QuestionType.OPEN_ENDED) {
          cleanQuestion.options = (q.options || []).map(opt => ({
            id: opt.id,
            text: opt.text || ''
          }));
        }

        // Only add non-undefined optional fields
        if (q.required !== undefined) cleanQuestion.required = q.required;
        if (q.answer !== undefined) cleanQuestion.answer = q.answer;
        if (q.answers !== undefined) cleanQuestion.answers = q.answers;
        if (q.correctAnswer !== undefined) cleanQuestion.correctAnswer = q.correctAnswer;
        if (q.correctAnswers !== undefined) cleanQuestion.correctAnswers = q.correctAnswers;
        if (q.maxLength !== undefined) cleanQuestion.maxLength = q.maxLength;
        if (q.minLength !== undefined) cleanQuestion.minLength = q.minLength;
        if (q.maxValue !== undefined) cleanQuestion.maxValue = q.maxValue;
        if (q.minValue !== undefined) cleanQuestion.minValue = q.minValue;
        if (q.step !== undefined) cleanQuestion.step = q.step;
        if (q.placeholder !== undefined) cleanQuestion.placeholder = q.placeholder;
        if (q.image !== undefined) cleanQuestion.image = q.image;
        if (q.imageLoading !== undefined) cleanQuestion.imageLoading = q.imageLoading;

        return cleanQuestion as QuestionTypeModel;
      });

      const draftData: DraftSurveyModel = {
        title: survey.title || 'Untitled Survey',
        questions: cleanQuestions,
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
              value={respondents || ''}
              onChange={(e) => setRespondents(Number(e.target.value))}
              className="shadow border rounded w-48 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
              required
            >
              <option value="" disabled># of respondents</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
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

                // Only check for options if it's a radio or checkbox question
                if (survey.questions[0].type === QuestionType.RADIO || survey.questions[0].type === QuestionType.CHECKBOX) {
                  const options = survey.questions[0].options || [];
                  if (options.length < 2) {
                    alert('Please add at least two options for the first question');
                    return;
                  }
                  if (!options.every(opt => opt.text.trim())) {
                    alert('Please fill in all options for the first question');
                    return;
                  }
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
                  
                  const surveyId = await surveyService.createSurvey(
                    survey.title,
                    survey.questions,
                    respondents,
                    draftId
                  );
                  
                  // Clear the draft after successful creation
                  localStorage.removeItem('survey_draft');
                  localStorage.removeItem('survey_draft_id');
                  
                  // Show the modal with the survey URL
                  const url = `${window.location.origin}/survey/${surveyId}`;
                  setSurveyUrl(url);
                  setShowUrlModal(true);
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
                if (q.type === QuestionType.RADIO || q.type === QuestionType.CHECKBOX) {
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
                  if (q.type === QuestionType.RADIO || q.type === QuestionType.CHECKBOX) {
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

      {/* Survey URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Survey Created Successfully!</h3>
            <p className="mb-4">Share this URL with your respondents:</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={surveyUrl}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(surveyUrl);
                  const button = document.getElementById('copyButton');
                  if (button) {
                    button.textContent = 'Copied!';
                    button.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
                    setTimeout(() => {
                      if (button) {
                        button.textContent = 'Copy';
                        button.className = 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600';
                      }
                    }, 2000);
                  }
                }}
                id="copyButton"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  navigate('/dashboard');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
