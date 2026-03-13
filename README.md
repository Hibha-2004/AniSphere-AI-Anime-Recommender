# ⬡ AniSphere — AI Anime Recommender

🎌 Discover your next anime obsession. AniSphere uses Google Gemini AI to generate personalized recommendations based on your mood, genres, and watch history — with real posters and MAL scores.

---

## Live Demo

🔗 [ani-sphere-ai-anime-recommender.vercel.app](https://ani-sphere-ai-anime-recommender.vercel.app)

---

## Features
- 🤖 Gemini AI generates personalized anime recommendations
- 🖼️ Real anime posters fetched from MyAnimeList via Jikan API
- ⭐ Shows MAL scores, episode counts, genres, studios
- 🌹 Elegant Rose Quartz dark theme

---

## Setup Instructions

### 1. Get your Gemini API Key
- Go to: https://aistudio.google.com/app/apikey
- Create a new API key (it's free)

### 2. Setup Backend
```bash
cd backend
npm install
```
- Open `backend/.env`
- Replace `your_gemini_api_key_here` with your actual Gemini API key

### 3. Setup Frontend
```bash
cd frontend
npm install
```

### 4. Run the App

**Terminal 1 — Start Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

Open http://localhost:3000 in your browser — you're good to go! 🎌

---

## Project Structure
```
anisphere/
├── backend/
│   ├── server.js       ← Express server + Gemini API + Jikan fetcher
│   ├── .env            ← Your API key goes here
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx     ← Main UI component
    │   ├── main.jsx    ← React entry point
    │   └── index.css   ← Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI:** Google Gemini 2.5 Flash
- **Anime Data:** Jikan API (MyAnimeList)
- **Fonts:** Bebas Neue, Outfit, Noto Sans JP
