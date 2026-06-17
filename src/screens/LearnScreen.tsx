import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import lessonCatalog from '../content/lessonCatalog.json';
import { getLessonProgress } from '../storage/lessonProgressStorage';
import type { LessonCatalogItem } from '../types/learning';

const lessons = lessonCatalog as LessonCatalogItem[];

export function LearnScreen() {
  const navigation = useNavigation<any>();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadProgress() {
        const progress = await getLessonProgress();
        setCompletedLessonIds(Object.keys(progress));
      }

      loadProgress();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>学习路径</Text>
      <Text style={styles.subtitle}>按顺序完成课程，从零基础走到 N5 入门。</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>五十音入门</Text>
        <Text style={styles.cardText}>
          已完成 {completedLessonIds.length}/{lessons.length} 课
        </Text>
      </View>

      {lessons.map((lesson, index) => {
        const isCompleted = completedLessonIds.includes(lesson.id);

        return (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonItem}
            onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
          >
            <Text style={[styles.lessonIndex, isCompleted && styles.lessonIndexDone]}>
              {isCompleted ? '✓' : index + 1}
            </Text>
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonMeta}>
                {isCompleted ? '已完成' : '待学习'} · 预计 {lesson.estimatedMinutes} 分钟
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    backgroundColor: '#F6F4EF',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#253238',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#69777D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#253238',
  },
  cardText: {
    marginTop: 6,
    color: '#69777D',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  lessonIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDEBDD',
    color: '#2F6B46',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '800',
  },
  lessonIndexDone: {
    backgroundColor: '#2F6B46',
    color: '#FFFFFF',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#253238',
  },
  lessonMeta: {
    marginTop: 4,
    color: '#69777D',
  },
});
