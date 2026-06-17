import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lessonContentById } from '../content/lessonContent';

export function LessonScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const lessonId = route.params?.lessonId ?? 'kana-a';
  const lesson = lessonContentById[lessonId] ?? lessonContentById['kana-a'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{lesson.stage}</Text>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.subtitle}>{lesson.subtitle}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>本节目标</Text>
        <Text style={styles.bodyText}>{lesson.goal}</Text>
      </View>

      <View style={styles.kanaGrid}>
        {lesson.kanaItems.map((item) => (
          <View key={item.kana} style={styles.kanaCard}>
            <Text style={styles.kana}>{item.kana}</Text>
            <Text style={styles.romaji}>{item.romaji}</Text>
            <Text style={styles.tip}>{item.tip}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>易错提醒</Text>
        <Text style={styles.bodyText}>{lesson.commonMistake}</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          navigation.navigate('Quiz', {
            mode: 'lesson',
            lessonId: lesson.id,
            questionSetId: lesson.questionSetId,
            title: `${lesson.title}小测`,
          })
        }
      >
        <Text style={styles.primaryButtonText}>开始练习</Text>
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
    fontSize: 32,
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
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#253238',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#69777D',
  },
  kanaGrid: {
    gap: 12,
  },
  kanaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4DED3',
  },
  kana: {
    fontSize: 44,
    fontWeight: '800',
    color: '#253238',
  },
  romaji: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#E3A23B',
  },
  tip: {
    marginTop: 8,
    fontSize: 15,
    color: '#69777D',
  },
  primaryButton: {
    backgroundColor: '#2F6B46',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
