import kanaALesson from './lessons/kana-a.json';
import kanaKaLesson from './lessons/kana-ka.json';
import kanaSaLesson from './lessons/kana-sa.json';
import type { LessonContent } from '../types/learning';

export const lessonContentById: Record<string, LessonContent> = {
  'kana-a': kanaALesson as LessonContent,
  'kana-ka': kanaKaLesson as LessonContent,
  'kana-sa': kanaSaLesson as LessonContent,
};
