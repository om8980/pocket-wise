# PocketWise

Student aur parent dono ke liye AI-based pocket money allocation app.
Next.js (React) + Firebase Firestore + Anthropic API (Claude) se AI suggestions.

## Step 1 — Local setup

```bash
cd pocketwise-app
npm install
```

## Step 2 — Firebase project banayein

1. https://console.firebase.google.com pe jaayein, "Add project" karein.
2. Project ke andar left menu se **Build > Firestore Database** > "Create database" > **test mode** mein start karein (baad mein rules update karenge).
3. Left menu se **Project settings** (gear icon) > "Your apps" > **</> (Web)** icon pe click karke ek web app register karein.
4. Jo config object milega (apiKey, authDomain, projectId, etc.) — usko note kar lein.

## Step 3 — Environment variables set karein

`.env.local.example` ko copy karke `.env.local` banayein:

```bash
cp .env.local.example .env.local
```

Firebase config wale saare `NEXT_PUBLIC_FIREBASE_*` values fill karein (Step 2 se).

`ANTHROPIC_API_KEY` ke liye https://console.anthropic.com pe jaakar API key banayein aur paste karein. (Isके bina bhi app chalega, bas AI default 30/40/30 split dega.)

## Step 4 — Firestore rules deploy karein

Firebase console mein **Firestore Database > Rules** tab kholein, is repo ki `firestore.rules` file ka content paste karein aur **Publish** karein.

(Yeh demo-level rule hai — koi bhi family code jaanne wala uska data padh/likh sakta hai. Production ke liye Firebase Auth add karke rules ko strict banayein.)

## Step 5 — Local test

```bash
npm run dev
```

http://localhost:3000 kholein, "Parent" role se ek family code banayein, dusre browser tab mein "Student" role se same code se connect karein.

## Step 6 — GitHub pe push karein

```bash
git init
git add .
git commit -m "PocketWise initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/pocketwise.git
git push -u origin main
```

## Step 7 — Vercel pe deploy karein

1. https://vercel.com pe GitHub se login karein.
2. "Add New Project" > apna `pocketwise` repo import karein.
3. Framework auto-detect ho jayega (Next.js).
4. **Environment Variables** section mein `.env.local` ke saare variables add karein (`NEXT_PUBLIC_FIREBASE_*` aur `ANTHROPIC_API_KEY`).
5. "Deploy" pe click karein. 2-3 minute mein live URL mil jayega.

## Step 8 — Test on live URL

Live URL kholke dono roles (Parent/Student) se test karein — parent amount set kare, student dusre device/browser se same code se connect karke dekhe ki live sync ho raha hai.

## Project structure

```
pocketwise-app/
  lib/
    firebase.js       Firebase init
    categories.js      shared constants (emergency/saving/enjoyment)
  components/
    SplitBar.js         allocation bar
    CategoryCard.js     per-category progress card
  pages/
    index.js            role select + family code
    parent.js            parent setup + dashboard
    student.js            student dashboard + spend log + AI ask
    api/
      suggest.js          AI allocation suggestion (server-side, uses ANTHROPIC_API_KEY)
      ask.js               AI spending advice (server-side)
  firestore.rules       Firestore security rules (demo-level)
```

## Next improvements (optional)

- Firebase Auth (phone/email OTP) add karke rules strict karein
- Saving goals (cycle, phone) track karne ka feature
- Monthly analytics/trends chart
- Push notifications jab student overspend kare
