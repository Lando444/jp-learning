export type QuestionOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  stem: string;
  options: QuestionOption[];
  answer: string;
  explanation: string;
  knowledgePoint: string;
};

export type LessonKanaItem = {
  kana: string;
  romaji: string;
  tip: string;
};

export type LessonContent = {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  goal: string;
  kanaItems: LessonKanaItem[];
  commonMistake: string;
  questionSetId: string;
};

export type LessonCatalogItem = {
  id: string;
  title: string;
  stage: string;
  status: 'locked' | 'available';
  estimatedMinutes: number;
};

export type UserProfile = {
  id: string;
  nickname: string;
  email: string;
  createdAt: string;
};
