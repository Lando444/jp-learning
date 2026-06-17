import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  clearWrongQuestions,
  getWrongQuestions,
  type StoredWrongQuestion,
} from '../storage/wrongQuestionStorage';

const practiceItems = ['今日推荐', '五十音专项', 'N5 单词练习', 'N5 语法练习'];

export function PracticeScreen() {
  const navigation = useNavigation<any>();
  const [wrongQuestions, setWrongQuestions] = useState<StoredWrongQuestion[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadWrongQuestions() {
        const storedWrongQuestions = await getWrongQuestions();
        setWrongQuestions(storedWrongQuestions);
      }

      loadWrongQuestions();
    }, [])
  );

  async function handleClearWrongQuestions() {
    await clearWrongQuestions();
    setWrongQuestions([]);
  }

  function handleStartWrongPractice() {
    if (wrongQuestions.length === 0) {
      return;
    }

    navigation.navigate('Quiz', {
      mode: 'wrong',
      questions: wrongQuestions,
    });
  }

  function handleStartSingleWrongQuestion(wrongQuestion: StoredWrongQuestion) {
    navigation.navigate('Quiz', {
      mode: 'wrong',
      questions: [wrongQuestion],
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>练习</Text>
      <Text style={styles.subtitle}>根据你的学习进度和错题情况安排练习。</Text>

      <TouchableOpacity style={styles.highlightCard} onPress={handleStartWrongPractice}>
        <Text style={styles.cardTitle}>错题强化</Text>
        <Text style={styles.cardText}>当前错题 {wrongQuestions.length} 道</Text>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearWrongQuestions}>
          <Text style={styles.clearButtonText}>清空测试错题</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {wrongQuestions.length > 0 && (
        <View style={styles.wrongListCard}>
          <Text style={styles.cardTitle}>错题列表</Text>

          {wrongQuestions.map((wrongQuestion) => (
            <TouchableOpacity
              key={wrongQuestion.id}
              style={styles.wrongItem}
              onPress={() => handleStartSingleWrongQuestion(wrongQuestion)}
            >
              <Text style={styles.wrongStem}>{wrongQuestion.stem}</Text>
              <Text style={styles.wrongMeta}>知识点：{wrongQuestion.knowledgePoint}</Text>
              <Text style={styles.wrongMeta}>错误次数：{wrongQuestion.wrongCount}</Text>
              <Text style={styles.wrongAction}>点这里只练这一题</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {practiceItems.map((item) => (
        <View key={item} style={styles.card}>
          <Text style={styles.cardTitle}>{item}</Text>
          <Text style={styles.cardText}>10 题，预计 6 分钟</Text>
        </View>
      ))}
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
  highlightCard: {
    backgroundColor: '#DDEBDD',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFD8C2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#253238',
  },
  cardText: {
    marginTop: 6,
    color: '#69777D',
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#2F6B46',
    fontWeight: '800',
  },
  wrongListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
    gap: 12,
  },
  wrongItem: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4DED3',
  },
  wrongStem: {
    fontSize: 15,
    fontWeight: '800',
    color: '#253238',
  },
  wrongMeta: {
    marginTop: 4,
    color: '#69777D',
  },
  wrongAction: {
    marginTop: 8,
    color: '#2F6B46',
    fontWeight: '800',
  },
});
