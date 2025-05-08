import { QuestionType } from './survey';
import { SurveyResponse } from './response';

export interface SurveyResultsData {
  id: string;
  title: string;
  respondents: number;
  responses: SurveyResponse[];
  questions: QuestionResult[];
}

export interface QuestionResult {
  id: string;
  questionText: string;
  type: QuestionType;
  options?: OptionResult[];
}

export interface OptionResult {
  id: string;
  text: string;
  count: number;
  percentage: number;
}
