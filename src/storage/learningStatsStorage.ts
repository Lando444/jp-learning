import { apiRequest } from '../services/api';

export type LearningStats = {
  totalAnswered: number;
  totalCorrect: number;
  completedSessions: number;
};

const defaultStats: LearningStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  completedSessions: 0,
};

export async function getLearningStats() {
  return apiRequest<LearningStats>('/me/stats');
}

export async function addCompletedSession(answeredCount: number, correctCount: number) {
  return apiRequest<LearningStats>('/me/stats/session', {
    method: 'POST',
    body: {
      answeredCount,
      correctCount,
    },
  });
}

export async function clearLearningStats() {
  return apiRequest<LearningStats>('/me/stats', {
    method: 'DELETE',
  }).catch(() => defaultStats);
}
