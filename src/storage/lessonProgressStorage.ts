import { apiRequest } from '../services/api';

export type LessonProgress = Record<string, 'completed'>;

export async function getLessonProgress() {
  return apiRequest<LessonProgress>('/me/lesson-progress');
}

export async function markLessonCompleted(lessonId: string) {
  return apiRequest<LessonProgress>('/me/lesson-progress', {
    method: 'POST',
    body: {
      lessonId,
    },
  });
}

export async function clearLessonProgress() {
  return apiRequest<LessonProgress>('/me/lesson-progress', {
    method: 'DELETE',
  });
}
