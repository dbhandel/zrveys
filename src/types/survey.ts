export enum QuestionType {
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer'
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}
