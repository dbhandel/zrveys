import { QuestionTypeModel } from '../types/survey';

interface SurveyData {
  id: string;
  title: string;
  questions: QuestionTypeModel[];
  respondents: number;
  responses: any[];
  createdAt: string;
  active: boolean;
}

const STORAGE_KEY = 'zrveys_active_surveys';

class SurveyService {
  private surveys: Record<string, SurveyData> = {};

  constructor() {
    this.loadSurveys();
  }

  private loadSurveys() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.surveys = data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading surveys:', error);
      this.surveys = {};
    }
  }

  private saveSurveys() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.surveys));
    } catch (error) {
      console.error('Error saving surveys:', error);
    }
  }

  createSurvey(title: string, questions: QuestionTypeModel[], respondents: number): string {
    const id = crypto.randomUUID();
    this.surveys[id] = {
      id,
      title,
      questions,
      respondents,
      responses: [],
      createdAt: new Date().toISOString(),
      active: true
    };
    this.saveSurveys();
    return id;
  }

  getSurvey(id: string): SurveyData | null {
    return this.surveys[id] || null;
  }

  getAllSurveys(): SurveyData[] {
    return Object.values(this.surveys);
  }

  updateSurvey(id: string, data: Partial<SurveyData>) {
    if (this.surveys[id]) {
      this.surveys[id] = { ...this.surveys[id], ...data };
      this.saveSurveys();
      return true;
    }
    return false;
  }

  addResponse(surveyId: string, response: any) {
    if (this.surveys[surveyId]) {
      this.surveys[surveyId].responses.push(response);
      this.saveSurveys();
      return true;
    }
    return false;
  }
}

// Create a singleton instance
export const surveyService = new SurveyService();
