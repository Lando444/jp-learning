# JP Learning

JP Learning is a beginner-friendly Japanese learning app built with Expo React Native. It helps new learners start from hiragana, practice with quizzes, save wrong questions, and review weak points based on their own learning record.

The current version is an MVP with a React Native mobile app and a local Node.js backend. It already has the core structure needed to evolve into a cloud-backed product.

## Features

- Account registration and login with a user ID
- Personal learning stats for each user
- Lesson list and lesson detail pages
- Hiragana lessons for あ行, か行, and さ行
- JSON-based lesson content and question banks
- Randomized quiz options so answers do not always stay in the same position
- Wrong-question collection and review
- Single wrong-question retry
- Learning progress tracking
- Home dashboard with daily tasks, stage progress, and weak-point reminders
- Local backend API that can later be moved to a cloud database

## Tech Stack

- Expo SDK 54
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Node.js backend
- JSON file storage for MVP development

## Project Structure

```text
jp-learning-sdk54
  App.tsx
  backend
    server.js
    data
      db.json
  src
    content
      lessonCatalog.json
      lessonContent.ts
      questionSets.ts
      lessons
      questions
    context
      UserContext.tsx
    screens
      AuthScreen.tsx
      HomeScreen.tsx
      LearnScreen.tsx
      LessonScreen.tsx
      PracticeScreen.tsx
      ProfileScreen.tsx
      QuizScreen.tsx
    services
      api.ts
    storage
      learningStatsStorage.ts
      lessonProgressStorage.ts
      userStorage.ts
      wrongQuestionStorage.ts
    types
      learning.ts
```

## Getting Started

Install dependencies:

```powershell
npm.cmd install
```

Start the backend API:

```powershell
npm.cmd run server
```

The local API runs at:

```text
http://localhost:4000/api
```

Health check:

```text
http://localhost:4000/api/health
```

Start the Expo app in another terminal:

```powershell
npm.cmd run start
```

Then scan the QR code with Expo Go on iPhone.

## Running On iPhone

When the app runs inside Expo Go on iPhone, `localhost` means the phone itself, not the Windows computer.

Before starting Expo, set the API URL to your computer's LAN IP:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://YOUR_PC_IP:4000/api"
npm.cmd run start
```

Example:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.23:4000/api"
npm.cmd run start
```

Keep the backend running while using the app:

```powershell
npm.cmd run server
```

## Backend API

The backend currently provides:

- User registration and login
- Current user profile
- Learning stats
- Lesson progress
- Wrong-question storage
- Lesson and question content endpoints

For MVP development, user data is saved in `backend/data/db.json`. This file is ignored by Git so local test accounts and learning records are not uploaded.

## Content Model

Lessons and questions are stored as JSON files under `src/content`.

This keeps the beginner-stage app easy to edit while avoiding large hard-coded question banks inside screen components. Later, the same structure can be moved to a database or content management system.

## Roadmap

- Add more kana lessons
- Add vocabulary and grammar modules
- Add daily review scheduling
- Add spaced repetition logic
- Add cloud database support
- Add password hashing and token-based authentication
- Add admin tools for editing lessons and questions
- Add production deployment for the API
- Add app build and TestFlight release workflow

## Repository About

Beginner Japanese learning app with Expo React Native, quizzes, wrong-question review, personal progress tracking, and a local Node.js backend ready for future cloud deployment.

Suggested topics:

```text
react-native, expo, typescript, japanese-learning, language-learning, nodejs, mobile-app
```
