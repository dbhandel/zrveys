import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Survey, QuestionTypeModel, QuestionType } from '../types/survey';

interface SurveyStore {
  survey: Survey;
  addQuestion: (question: QuestionTypeModel) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => void;
  updateSurvey: (updates: Partial<Survey>) => void;
  clearSurvey: () => void;
  reorderQuestions: (questions: QuestionTypeModel[]) => void;
}

export const useSurveyStore = create(
  persist<SurveyStore>(
    (set) => ({
  survey: {
    id: crypto.randomUUID(),
    title: 'New Survey',
    description: 'Survey Description',
    questions: [
      {
        id: crypto.randomUUID(),
        type: QuestionType.RADIO,
        questionText: 'Question 1',
        options: [
          { id: crypto.randomUUID(), text: 'Option 1' },
          { id: crypto.randomUUID(), text: 'Option 2' }
        ]
      },
      {
        id: crypto.randomUUID(),
        type: QuestionType.CHECKBOX,
        questionText: 'Question 2',
        options: [
          { id: crypto.randomUUID(), text: 'Option 1' },
          { id: crypto.randomUUID(), text: 'Option 2' }
        ]
      },
      {
        id: crypto.randomUUID(),
        type: QuestionType.SHORT_ANSWER,
        questionText: 'Question 3',
        placeholder: 'Enter your answer'
      }
    ]
  },
  addQuestion: (question: QuestionTypeModel) => set((state) => ({
    survey: { ...state.survey, questions: [...state.survey.questions, question] }
  })),
  removeQuestion: (id: string) => set((state) => ({
    survey: {
      ...state.survey,
      questions: state.survey.questions.filter((q) => q.id !== id)
    }
  })),
  updateQuestion: (id: string, updates: Partial<QuestionTypeModel>) => set((state) => ({
    survey: {
      ...state.survey,
      questions: state.survey.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    }
  })),
  updateSurvey: (updates: Partial<Survey>) => set((state) => ({
    survey: { ...state.survey, ...updates }
  })),
  clearSurvey: () => set({
    survey: {
      id: '',
      title: '',
      description: '',
      questions: []
    }
  }),
  reorderQuestions: (questions: QuestionTypeModel[]) => set((state) => ({
    survey: {
      ...state.survey,
      questions
    }
  }))
    }),
    {
      name: 'survey-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
