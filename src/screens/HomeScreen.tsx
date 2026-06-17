import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import lessonCatalog from '../content/lessonCatalog.json';
import { getLearningStats } from '../storage/learningStatsStorage';
import { getLessonProgress } from '../storage/lessonProgressStorage';
import { getWrongQuestions } from '../storage/wrongQuestionStorage';
import type { LessonCatalogItem } from '../types/learning';

const lessons = lessonCatalog as LessonCatalogItem[];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [wrongQuestionCount, setWrongQuestionCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  const accuracy = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
  const nextLesson = lessons[completedLessons] ?? lessons[0];
  const progressPercent = Math.round((completedLessons / lessons.length) * 100);

  useFocusEffect(
    useCallback(() => {
      async function loadHomeData() {
        const stats = await getLearningStats();
        const wrongQuestions = await getWrongQuestions();
        const lessonProgress = await getLessonProgress();

        setWrongQuestionCount(wrongQuestions.length);
        setTotalAnswered(stats.totalAnswered);
        setTotalCorrect(stats.totalCorrect);
        setCompletedSessions(stats.completedSessions);
        setCompletedLessons(Object.keys(lessonProgress).length);
      }

      loadHomeData();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>こんばんは</Text>
        <Text style={styles.title}>JP Learning</Text>
        <Text style={styles.subtitle}>从五十音开始，今天只学 10 分钟。</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>今日任务</Text>
          <Text style={styles.badge}>{completedSessions}/3</Text>
        </View>

        <View style={styles.task}>
          <Text style={styles.taskTitle}>学习：{nextLesson.title}</Text>
          <Text style={styles.taskMeta}>预计 {nextLesson.estimatedMinutes} 分钟</Text>
        </View>

        <View style={styles.task}>
          <Text style={styles.taskTitle}>复习：当前错题 {wrongQuestionCount} 道</Text>
          <Text style={styles.taskMeta}>{wrongQuestionCount > 0 ? '建议先做错题强化' : '暂无待复习错题'}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Lesson', { lessonId: nextLesson.id })}
        >
          <Text style={styles.primaryButtonText}>继续学习</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>当前阶段</Text>
        <Text style={styles.stageTitle}>五十音入门</Text>
        <Text style={styles.stageText}>
          已完成 {completedLessons}/{lessons.length} 课
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>学习概览</Text>
        <Text style={styles.weakTitle}>
          {totalAnswered === 0 ? '还没有学习数据' : `已完成 ${totalAnswered} 题，正确率 ${accuracy}%`}
        </Text>
        <Text style={styles.weakText}>
          {wrongQuestionCount > 0
            ? `当前有 ${wrongQuestionCount} 道错题，建议先做错题强化。`
            : '目前没有待强化错题，可以继续学习新课。'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: '#F6F4EF',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#5E6A71',
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#253238',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#5E6A71',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#253238',
  },
  badge: {
    backgroundColor: '#DDEBDD',
    color: '#2F6B46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '700',
  },
  task: {
    padding: 14,
    backgroundColor: '#F8FAF8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6EFE6',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#253238',
  },
  taskMeta: {
    marginTop: 4,
    fontSize: 14,
    color: '#69777D',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#2F6B46',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#253238',
  },
  stageText: {
    fontSize: 15,
    color: '#69777D',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E9ECE8',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E3A23B',
  },
  weakTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#253238',
  },
  weakText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#69777D',
  },
});
