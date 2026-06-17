import { useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { questionSetsById } from '../content/questionSets';
import { addCompletedSession } from '../storage/learningStatsStorage';
import { markLessonCompleted } from '../storage/lessonProgressStorage';
import { addWrongQuestion, removeWrongQuestion } from '../storage/wrongQuestionStorage';
import type { QuestionOption, QuizQuestion } from '../types/learning';

type QuizMode = 'lesson' | 'wrong';

type RuntimeQuestion = Omit<QuizQuestion, 'options' | 'answer'> & {
  options: QuestionOption[];
  answer: string;
};

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildRuntimeQuestions(source: QuizQuestion[]) {
  return shuffleArray(source).map((question) => {
    const correctOption = question.options.find((option) => option.id === question.answer);
    const shuffledOptions = shuffleArray(question.options).map((option, index) => ({
      ...option,
      id: String.fromCharCode(65 + index),
    }));
    const newAnswer =
      shuffledOptions.find((option) => option.text === correctOption?.text)?.id ?? question.answer;

    return {
      ...question,
      options: shuffledOptions,
      answer: newAnswer,
    };
  });
}

export function QuizScreen() {
  const route = useRoute<any>();
  const mode: QuizMode = route.params?.mode ?? 'lesson';
  const routeQuestions = route.params?.questions as QuizQuestion[] | undefined;
  const lessonId = route.params?.lessonId as string | undefined;
  const questionSetId = (route.params?.questionSetId as string | undefined) ?? 'kana-a';
  const quizTitle = (route.params?.title as string | undefined) ?? '平假名 あ行小测';
  const sourceQuestions = questionSetsById[questionSetId] ?? questionSetsById['kana-a'];

  const [quizRound, setQuizRound] = useState(1);
  const questions = useMemo(
    () => buildRuntimeQuestions(routeQuestions && routeQuestions.length > 0 ? routeQuestions : sourceQuestions),
    [quizRound, routeQuestions, sourceQuestions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<RuntimeQuestion[]>([]);

  const question = questions[currentIndex];
  const isCorrect = selectedOption === question.answer;
  const isLastQuestion = currentIndex === questions.length - 1;
  const accuracy = Math.round((correctCount / questions.length) * 100);

  async function handleSubmit() {
    if (!selectedOption) {
      return;
    }

    if (!submitted) {
      const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;

      if (isCorrect) {
        setCorrectCount(nextCorrectCount);

        if (mode === 'wrong') {
          await removeWrongQuestion(question.id);
        }
      } else {
        setWrongQuestions((items) => [...items, question]);

        if (mode !== 'wrong') {
          await addWrongQuestion(question);
        }
      }

      setSubmitted(true);
      return;
    }

    if (isLastQuestion) {
      if (mode !== 'wrong') {
        await addCompletedSession(questions.length, correctCount);

        if (lessonId) {
          await markLessonCompleted(lessonId);
        }
      }

      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedOption(null);
    setSubmitted(false);
  }

  function resetQuiz() {
    setQuizRound((round) => round + 1);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setCorrectCount(0);
    setWrongQuestions([]);
    setFinished(false);
  }

  if (finished) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>练习完成</Text>
        <Text style={styles.title}>{mode === 'wrong' ? '错题强化' : quizTitle}</Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultValue}>
            {correctCount}/{questions.length}
          </Text>
          <Text style={styles.resultLabel}>答对题数</Text>
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>正确率 {accuracy}%</Text>
          <Text style={styles.feedbackText}>
            {accuracy >= 80
              ? '表现不错，可以继续学习下一课。'
              : '建议再复习一次，特别注意容易混淆的假名。'}
          </Text>
        </View>

        {wrongQuestions.length > 0 && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>本次错题</Text>
            {wrongQuestions.map((wrongQuestion) => (
              <View key={wrongQuestion.id} style={styles.wrongItem}>
                <Text style={styles.wrongStem}>{wrongQuestion.stem}</Text>
                <Text style={styles.wrongMeta}>知识点：{wrongQuestion.knowledgePoint}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={resetQuiz}>
          <Text style={styles.primaryButtonText}>再练一次</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>
        {mode === 'wrong' ? '错题强化' : '课后小测'} {currentIndex + 1}/{questions.length}
      </Text>
      <Text style={styles.title}>{question.stem}</Text>

      <View style={styles.options}>
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const shouldShowCorrect = submitted && option.id === question.answer;
          const shouldShowWrong = submitted && isSelected && option.id !== question.answer;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                shouldShowCorrect && styles.optionCorrect,
                shouldShowWrong && styles.optionWrong,
              ]}
              disabled={submitted}
              onPress={() => setSelectedOption(option.id)}
            >
              <Text style={styles.optionLabel}>{option.id}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>{isCorrect ? '答对了' : '答错了'}</Text>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, !selectedOption && styles.primaryButtonDisabled]}
        disabled={!selectedOption}
        onPress={handleSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {submitted ? (isLastQuestion ? '查看结果' : '下一题') : '提交答案'}
        </Text>
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
  eyebrow: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F6B46',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#253238',
    lineHeight: 36,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  optionSelected: {
    borderColor: '#2F6B46',
    backgroundColor: '#F2F8F2',
  },
  optionCorrect: {
    borderColor: '#2F6B46',
    backgroundColor: '#DDEBDD',
  },
  optionWrong: {
    borderColor: '#B94747',
    backgroundColor: '#F8E2E2',
  },
  optionLabel: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF1EF',
    textAlign: 'center',
    lineHeight: 34,
    fontWeight: '800',
    color: '#253238',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#253238',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#253238',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: '#69777D',
  },
  primaryButton: {
    backgroundColor: '#2F6B46',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#A9B8AD',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4DED3',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2F6B46',
  },
  resultLabel: {
    marginTop: 6,
    fontSize: 16,
    color: '#69777D',
  },
  wrongItem: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4DED3',
  },
  wrongStem: {
    fontSize: 15,
    fontWeight: '700',
    color: '#253238',
  },
  wrongMeta: {
    marginTop: 4,
    fontSize: 14,
    color: '#69777D',
  },
});
