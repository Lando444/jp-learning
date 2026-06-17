# JP Learning

JP Learning is an Expo React Native app for beginner Japanese learning.

## Current MVP

- Email/password account flow backed by a local Node API
- User ID, profile, lesson progress, wrong questions, and stats stored by backend user
- Home dashboard with learning progress and weak-point summary
- Lesson path for hiragana lessons
- JSON-based lesson content and question banks
- Randomized quiz questions and options
- Wrong-question review and single-question retry
- Course completion tracking

## Run The Backend

```powershell
npm.cmd run server
```

The API runs at:

```text
http://localhost:4000/api
```

Health check:

```text
http://localhost:4000/api/health
```

## Run The App

In another terminal:

```powershell
npm.cmd run start
```

Open the QR code with Expo Go on iPhone.

## iPhone API URL

If Expo Go runs on your iPhone, `localhost` means the phone itself, not the PC.
Set the API base URL to your Windows PC LAN IP before starting Expo:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://YOUR_PC_IP:4000/api"
npm.cmd run start
```

Example:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.23:4000/api"
npm.cmd run start
```

Keep `npm.cmd run server` running while using the app.

## Project Structure

```text
backend
  server.js
  data
src
  content
    lessonCatalog.json
    lessons
    questions
    lessonContent.ts
    questionSets.ts
  context
  screens
  services
  storage
  types
```

## Cloud Upgrade Path

The current backend uses a local JSON database for development. The API boundary is already in place, so a production version can move the same data model to PostgreSQL/Supabase and deploy the API to a cloud host.
