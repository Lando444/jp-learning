import kanaAQuestions from './questions/kana-a.json';
import kanaKaQuestions from './questions/kana-ka.json';
import kanaSaQuestions from './questions/kana-sa.json';
import type { QuizQuestion } from '../types/learning';

export const questionSetsById: Record<string, QuizQuestion[]> = {
  'kana-a': kanaAQuestions as QuizQuestion[],
  'kana-ka': kanaKaQuestions as QuizQuestion[],
  'kana-sa': kanaSaQuestions as QuizQuestion[],
};
