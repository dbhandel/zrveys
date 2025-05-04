import { create } from 'zustand';
import { Survey, Question, QuestionType } from '../types/survey';

interface SurveyStore {
  survey: Survey;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  updateSurvey: (updates: Partial<Survey>) => void;
  clearSurvey: () => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  survey: {
    id: '',
    title: '',
    description: '',
    questions: []
  },
  addQuestion: (question: Question) => set((state) => ({
    survey: { ...state.survey, questions: [...state.survey.questions, question] }
  })),
  updateQuestion: (id: string, updates: Partial<Question>) => set((state) => ({
    survey: {
      ...state.survey,
      questions: state.survey.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    }
  })),
  removeQuestion: (id: string) => set((state) => ({
    survey: {
      ...state.survey,
      questions: state.survey.questions.filter((q) => q.id !== id)
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
  })
}));
