import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fetch anime image from Jikan (MyAnimeList API)
async function fetchAnimeImage(title) {
  try {
    const query = encodeURIComponent(title);
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=1`);
    const data = await res.json();
    const anime = data.data?.[0];
    if (anime) {
      return {
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
        malScore: anime.score || null,
        episodes: anime.episodes || null,
        status: anime.status || null,
        year: anime.year || anime.aired?.prop?.from?.year || null,
        malUrl: anime.url || null,
      };
    }
  } catch (e) {
    console.error("Jikan fetch error for:", title, e.message);
  }
  return { image: null, malScore: null, episodes: null, status: null, year: null, malUrl: null };
}

app.post("/api/recommend", async (req, res) => {
  const { mood, genres, liked } = req.body;

  const prompt = `You are an expert anime recommender. Based on the user's preferences, recommend exactly 6 anime.

User preferences:
- Mood: ${mood || "any"}
- Genres: ${genres?.length ? genres.join(", ") : "any"}
- Anime they have enjoyed: ${liked?.trim() || "not specified"}

Respond ONLY with a valid JSON array. No markdown, no explanation, no backticks. Just raw JSON.
Each object must have exactly these keys:
- "title": string (official English title as listed on MyAnimeList)
- "japaneseTitle": string (original Japanese title)
- "genres": array of 2-3 genre strings
- "matchReason": string (2 sentences explaining why this matches their taste)
- "synopsis": string (3 sentences describing the plot without spoilers)
- "studio": string (animation studio name)
- "type": string (e.g. "TV Series", "Movie", "OVA")`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");
    const recommendations = JSON.parse(jsonMatch[0]);

    // Fetch images from Jikan for each anime (with small delay to respect rate limit)
    const enriched = [];
    for (let i = 0; i < recommendations.length; i++) {
      const anime = recommendations[i];
      if (i > 0) await new Promise(r => setTimeout(r, 400)); // Jikan rate limit
      const jikanData = await fetchAnimeImage(anime.title);
      enriched.push({ ...anime, ...jikanData });
    }

    res.json({ success: true, recommendations: enriched });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 AniSphere backend running on http://localhost:${PORT}`));
