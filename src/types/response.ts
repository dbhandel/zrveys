export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: QuestionResponse[];
  startedAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
}

export interface QuestionResponse {
  questionId: string;
  answer?: string;
  answers?: string[];
  answeredAt: string;
}
