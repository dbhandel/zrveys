export enum QuestionType {
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  OPEN_ENDED = 'OPEN_ENDED'
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export type QuestionTypeModel = {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  answer?: string;
  answers?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  maxValue?: number;
  minValue?: number;
  step?: number;
  placeholder?: string;
};

export interface QuestionAnswer {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: QuestionTypeModel[];
}
