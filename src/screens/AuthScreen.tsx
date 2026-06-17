import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signInOrCreateLocalUser } from '../storage/userStorage';
import type { UserProfile } from '../types/learning';

type AuthScreenProps = {
  onSignedIn: (user: UserProfile) => void;
};

export function AuthScreen({ onSignedIn }: AuthScreenProps) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const safeEmail = email.trim();

    if (!safeEmail.includes('@')) {
      Alert.alert('邮箱格式不对', '请输入一个邮箱地址，用来识别你的学习账号。');
      return;
    }

    if (password.length < 6) {
      Alert.alert('密码太短', '密码至少需要 6 位。');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signInOrCreateLocalUser(safeEmail, nickname, password);
      onSignedIn(user);
    } catch (error) {
      Alert.alert('登录失败', error instanceof Error ? error.message : '请检查后端服务是否已经启动。');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>JP Learning</Text>
        <Text style={styles.title}>开始你的日语学习</Text>
        <Text style={styles.subtitle}>
          创建或登录学习账号。你的课程进度、错题和学习报告会同步到后端。
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>昵称</Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="例如：林同学"
          style={styles.input}
        />

        <Text style={styles.label}>邮箱</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          style={styles.input}
        />

        <Text style={styles.label}>密码</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="至少 6 位"
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryButton} disabled={isSubmitting} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? '进入中...' : '进入学习'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        当前使用本地 Node 后端。后续部署到云服务器后，同一账号可以在多设备同步学习数据。
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F6F4EF',
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2F6B46',
  },
  title: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '800',
    color: '#253238',
  },
  subtitle: {
    marginTop: 10,
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
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#253238',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4DED3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#253238',
    backgroundColor: '#FBFAF7',
  },
  primaryButton: {
    marginTop: 8,
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
  note: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 20,
    color: '#69777D',
  },
});
