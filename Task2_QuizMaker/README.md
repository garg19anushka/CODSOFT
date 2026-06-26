# Markwise — Quiz Maker (Firebase Edition)

A platform for creating and taking multiple-choice quizzes, with instant scoring and answer review.
Built with **React (Vite)**, **Firebase** (Firestore + Authentication), and **Tailwind CSS**.

## Features

- **Home page** — welcome message, choice to create or take a quiz
- **Quiz creation** — add multiple questions, each with 2–6 multiple-choice options, mark the correct one
- **Quiz listing** — browse all available quizzes with search
- **Quiz taking** — one question at a time, progress bar, previous/next navigation
- **Quiz results** — final score as a percentage, plus a full answer review showing what you picked vs. the correct answer
- **My Quizzes** — creators can view and delete quizzes they've made
- **Auth** — email/password signup & login via Firebase Authentication
- **Mobile responsive** across every page

## 1. Set up Firebase (5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name → finish the wizard (Google Analytics is optional, you can skip it)
2. In the left sidebar, click **Build → Authentication** → **Get started** → enable the **Email/Password** sign-in method
3. Click **Build → Firestore Database** → **Create database** → choose **Start in production mode** → pick a location close to you
4. Go to **Project settings** (gear icon, top left) → scroll to **Your apps** → click the **</> (Web)** icon → register an app (any nickname) → you'll be shown a `firebaseConfig` object with your keys — keep this tab open

## 2. Apply the security rules

1. In Firestore Database, click the **Rules** tab
2. Open `firestore.rules` (in this folder), copy everything, paste it in, replacing the default rules
3. Click **Publish**

This locks the database down properly: anyone can browse/take quizzes, but only the creator can edit or delete their own quiz, and attempt scores stay private to the user who made them.

## 3. Configure the app

```bash
cp .env.example .env
```

Open `.env` and fill in the values from the `firebaseConfig` object you copied in step 1:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

Try it:
- Sign up → go to **Create Quiz** → add a few questions, mark a correct answer for each → Publish
- Go to **Browse Quizzes** → take the quiz you made
- Finish it → see your score and the full answer review
- Go to **My Quizzes** → see attempt counts on the quizzes you made

### A note on one query and a possible one-time prompt
The **My Quizzes** page filters by your account *and* sorts by date at the same time. The very first time you load that page, Firestore may show an error in the browser console with a link to **create a composite index** — this is normal for this kind of combined query. Just click the link, click **Create Index** on the Firebase page it opens, wait about a minute, then reload. You'll only ever need to do this once.

## 5. Build for production

```bash
npm run build
```

## 6. Deploy

### Vercel
1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. If this project lives in a subfolder of a larger repo, set **Root Directory** to that subfolder (e.g. `Task2_QuizMaker`)
4. Add all six `VITE_FIREBASE_*` environment variables from your `.env`
5. Deploy

### Netlify
Same idea — build command `npm run build`, publish directory `dist`, add the same six env vars.

**Important:** after deploying, go back to Firebase Console → **Authentication → Settings → Authorized domains** → add your live domain (e.g. `your-app.vercel.app`). Firebase blocks sign-in/signup from domains it doesn't recognize.

## Project structure

```
src/
  lib/firebase.js          → Firebase app/auth/Firestore initialization
  lib/errors.js             → converts Firebase error codes to plain English
  contexts/AuthContext.jsx → auth state, signup/login/logout
  components/
    Navbar.jsx
    ProtectedRoute.jsx
    OptionBubble.jsx       → the multiple-choice bubble UI (used in both taking & results)
  pages/
    Home.jsx
    QuizListing.jsx
    CreateQuiz.jsx
    TakeQuiz.jsx
    QuizResults.jsx
    MyQuizzes.jsx
    auth/Login.jsx, Signup.jsx
firestore.rules            → paste into Firebase Console → Firestore → Rules
```

## Data model (Firestore)

Unlike a SQL database, Firestore stores data as documents in collections, not tables and rows:

```
users/{uid}                              { email, fullName, createdAt }
quizzes/{quizId}                          { title, description, creatorId, creatorName,
                                             createdAt, questionCount, attemptCount }
quizzes/{quizId}/questions/{questionId}   { questionText, position,
                                             options: [{ id, text, isCorrect }] }
attempts/{attemptId}                      { quizId, userId, score, totalQuestions,
                                             createdAt, answers: [{questionId, selectedOptionId, isCorrect}] }
```

Options are nested directly inside each question document (not a separate collection) so a question and its choices are always read and written together in one trip.

## Notes for your internship submission

All 7 task requirements are implemented as separate, dedicated pages/features:
Home Page, Quiz Creation, Quiz Taking, Quiz Results, Quiz Listing, User Authentication, and Mobile Responsiveness — backed entirely by Firebase (Authentication + Firestore), not Supabase.
