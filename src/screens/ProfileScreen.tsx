import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import lessonCatalog from '../content/lessonCatalog.json';
import { clearLearningStats, getLearningStats } from '../storage/learningStatsStorage';
import { clearLessonProgress, getLessonProgress } from '../storage/lessonProgressStorage';
import { clearWrongQuestions, getWrongQuestions } from '../storage/wrongQuestionStorage';
import type { LessonCatalogItem } from '../types/learning';
import { useUser } from '../context/UserContext';

const lessons = lessonCatalog as LessonCatalogItem[];

export function ProfileScreen() {
  const { user, signOut } = useUser();
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [wrongQuestionCount, setWrongQuestionCount] = useState(0);
  const [completedLessonCount, setCompletedLessonCount] = useState(0);

  const accuracy = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);

  useFocusEffect(
    useCallback(() => {
      async function loadStats() {
        const stats = await getLearningStats();
        const wrongQuestions = await getWrongQuestions();
        const lessonProgress = await getLessonProgress();

        setTotalAnswered(stats.totalAnswered);
        setTotalCorrect(stats.totalCorrect);
        setCompletedSessions(stats.completedSessions);
        setWrongQuestionCount(wrongQuestions.length);
        setCompletedLessonCount(Object.keys(lessonProgress).length);
      }

      loadStats();
    }, [])
  );

  async function handleClearStats() {
    await clearLearningStats();
    await clearWrongQuestions();
    await clearLessonProgress();
    setTotalAnswered(0);
    setTotalCorrect(0);
    setCompletedSessions(0);
    setWrongQuestionCount(0);
    setCompletedLessonCount(0);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>我的</Text>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{user.nickname}</Text>
        <Text style={styles.meta}>当前阶段：五十音入门</Text>
        <Text style={styles.meta}>邮箱：{user.email}</Text>
        <Text style={styles.userId}>用户 ID：{user.id}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedLessonCount}/{lessons.length}</Text>
          <Text style={styles.statLabel}>完成课程</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>完成练习</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalAnswered}</Text>
          <Text style={styles.statLabel}>完成题数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>正确率</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{wrongQuestionCount}</Text>
          <Text style={styles.statLabel}>错题</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearStats}>
        <Text style={styles.clearButtonText}>清空测试数据</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutButtonText}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: '#F6F4EF',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#253238',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#253238',
  },
  meta: {
    marginTop: 6,
    color: '#69777D',
  },
  userId: {
    marginTop: 8,
    color: '#69777D',
    fontSize: 12,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F6B46',
  },
  statLabel: {
    marginTop: 6,
    color: '#69777D',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  clearButtonText: {
    color: '#2F6B46',
    fontWeight: '800',
  },
  signOutButton: {
    backgroundColor: '#F8E2E2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7B7B7',
  },
  signOutButtonText: {
    color: '#B94747',
    fontWeight: '800',
  },
});
