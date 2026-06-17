import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAuthToken } from '../services/api';
import type { UserProfile } from '../types/learning';

const CURRENT_USER_KEY = 'jp-learning:current-user';
const AUTH_TOKEN_KEY = 'jp-learning:auth-token';

type AuthResponse = {
  user: UserProfile;
  token: string;
};

export async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function getCurrentUser() {
  const rawValue = await AsyncStorage.getItem(CURRENT_USER_KEY);
  const token = await getAuthToken();

  if (token) {
    setAuthToken(token);
  }

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as UserProfile;
}

export async function signInOrCreateLocalUser(email: string, nickname: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: {
      email,
      nickname: nickname.trim() || '日语学习者',
      password,
    },
    skipAuth: true,
  });

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
  setAuthToken(response.token);

  return response.user;
}

export async function signOutLocalUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  setAuthToken(null);
}
