import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { UserContext } from './src/context/UserContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LearnScreen } from './src/screens/LearnScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { getCurrentUser, signOutLocalUser } from './src/storage/userStorage';
import type { UserProfile } from './src/types/learning';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2F6B46',
        tabBarInactiveTintColor: '#7B878D',
        tabBarStyle: {
          borderTopColor: '#E4DED3',
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === '首页') {
            iconName = 'home-outline';
          }

          if (route.name === '学习') {
            iconName = 'book-outline';
          }

          if (route.name === '练习') {
            iconName = 'create-outline';
          }

          if (route.name === '我的') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="首页" component={HomeScreen} />
      <Tab.Screen name="学习" component={LearnScreen} />
      <Tab.Screen name="练习" component={PracticeScreen} />
      <Tab.Screen name="我的" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoadingUser(false);
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await signOutLocalUser();
    setUser(null);
  }

  if (isLoadingUser) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F4EF' }}>
        <ActivityIndicator color="#2F6B46" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onSignedIn={setUser} />;
  }

  return (
    <UserContext.Provider value={{ user, signOut: handleSignOut }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Lesson"
            component={LessonScreen}
            options={{
              title: '课时详情',
              headerBackTitle: '返回',
              headerTintColor: '#2F6B46',
              headerStyle: {
                backgroundColor: '#F6F4EF',
              },
            }}
          />
          <Stack.Screen
            name="Quiz"
            component={QuizScreen}
            options={{
              title: '课后小测',
              headerBackTitle: '返回',
              headerTintColor: '#2F6B46',
              headerStyle: {
                backgroundColor: '#F6F4EF',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
