import { apiRequest } from '../services/api';
import type { QuizQuestion } from '../types/learning';

export type StoredWrongQuestion = QuizQuestion & {
  wrongCount: number;
  lastWrongAt: string;
};

export async function getWrongQuestions() {
  return apiRequest<StoredWrongQuestion[]>('/me/wrong-questions');
}

export async function addWrongQuestion(question: QuizQuestion) {
  await apiRequest<StoredWrongQuestion[]>('/me/wrong-questions', {
    method: 'POST',
    body: question,
  });
}

export async function clearWrongQuestions() {
  await apiRequest<StoredWrongQuestion[]>('/me/wrong-questions', {
    method: 'DELETE',
  });
}

export async function removeWrongQuestion(questionId: string) {
  await apiRequest<StoredWrongQuestion[]>(`/me/wrong-questions/${encodeURIComponent(questionId)}`, {
    method: 'DELETE',
  });
}
