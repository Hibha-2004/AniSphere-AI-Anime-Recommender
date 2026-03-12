import { useState, useRef } from "react";

const MOODS = [
  { label: "Chill & Relaxing", icon: "🌸" },
  { label: "Action-Packed", icon: "⚡" },
  { label: "Emotional & Deep", icon: "💧" },
  { label: "Mind-Bending", icon: "🌀" },
  { label: "Fun & Lighthearted", icon: "✨" },
  { label: "Dark & Intense", icon: "🌑" },
];

const GENRES = [
  "Shonen", "Isekai", "Romance", "Sci-Fi", "Fantasy",
  "Slice of Life", "Horror", "Mecha", "Sports", "Mystery",
  "Psychological", "Supernatural", "Comedy", "Thriller"
];

function AnimeCard({ anime, index }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="anime-card" style={{ animationDelay: `${index * 120}ms` }}>
      <div className="card-poster">
        {anime.image && !imgError ? (
          <img src={anime.image} alt={anime.title} onError={() => setImgError(true)} />
        ) : (
          <div className="card-poster-fallback"><span>🎌</span><p>{anime.title}</p></div>
        )}
        <div className="card-poster-overlay">
          <div className="card-index">#{String(index + 1).padStart(2, "0")}</div>
          {anime.malScore && <div className="card-score">⭐ {anime.malScore}</div>}
        </div>
        <div className="card-type-badge">{anime.type || "TV Series"}</div>
      </div>
      <div className="card-body">
        <div className="card-titles">
          <h3 className="card-title">{anime.title}</h3>
          {anime.japaneseTitle && <p className="card-jp-title">{anime.japaneseTitle}</p>}
        </div>
        <div className="card-meta-row">
          {anime.year && <span className="meta-pill year">{anime.year}</span>}
          {anime.episodes && <span className="meta-pill eps">{anime.episodes} eps</span>}
          {anime.studio && <span className="meta-pill studio">{anime.studio}</span>}
        </div>
        <div className="card-genres">
          {anime.genres?.map(g => <span key={g} className="genre-tag">{g}</span>)}
        </div>
        <div className="card-match-reason">
          <span className="match-icon">◈</span>
          <p>{anime.matchReason}</p>
        </div>
        <p className="card-synopsis">{anime.synopsis}</p>
        {anime.malUrl && <a href={anime.malUrl} target="_blank" rel="noreferrer" className="mal-link">View on MyAnimeList →</a>}
      </div>
    </div>
  );
}

export default function App() {
  const [mood, setMood] = useState("");
  const [genres, setGenres] = useState([]);
  const [liked, setLiked] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const resultsRef = useRef(null);

  const loadingPhrases = [
    "Scanning the anime universe...",
    "Consulting the sacred scrolls...",
    "Traversing the AniSphere...",
    "Awakening the oracle...",
    "Fetching anime data...",
  ];

  const toggleGenre = (g) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const getRecommendations = async () => {
    if (!mood && genres.length === 0 && !liked.trim()) return;
    setLoading(true); setError(""); setResults(null);
    let phraseIdx = 0;
    setLoadingText(loadingPhrases[0]);
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % loadingPhrases.length;
      setLoadingText(loadingPhrases[phraseIdx]);
    }, 1800);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, genres, liked }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResults(data.recommendations);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError("Something went wrong. Please check your API key and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="app">
        {/* Decorative background shapes */}
        <div className="bg-shape shape1" />
        <div className="bg-shape shape2" />
        <div className="bg-shape shape3" />

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <span className="logo-sphere">⬡</span>
            <span className="logo-text">AniSphere</span>
          </div>
          <div className="nav-tagline">AI-Powered Anime Discovery</div>
        </nav>

        {/* HERO */}
        <header className="hero">
          <div className="hero-content">
            <div className="hero-badge">✦ Powered by Gemini AI + Jikan API</div>
            <h1 className="hero-title">
              Find Your Next<br />
              <span className="hero-title-accent">Anime Obsession</span>
            </h1>
            <p className="hero-subtitle">
              Tell us your vibe. AniSphere's AI engine dives into the anime universe
              and surfaces the perfect titles just for you — with real posters, scores, and synopses.
            </p>
          </div>
          <div className="hero-divider">
            <span className="divider-line" />
            <span className="divider-gem">◆</span>
            <span className="divider-line" />
          </div>
        </header>

        {/* FORM */}
        <main className="form-section">
          <div className="form-container">
            <div className="form-group">
              <div className="form-label">
                <span className="label-num">01</span>
                <span className="label-text">What's your mood?</span>
              </div>
              <div className="mood-grid">
                {MOODS.map(m => (
                  <button key={m.label} className={`mood-btn ${mood === m.label ? "active" : ""}`}
                    onClick={() => setMood(mood === m.label ? "" : m.label)}>
                    <span className="mood-icon">{m.icon}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span className="label-num">02</span>
                <span className="label-text">Pick your genres <span className="label-hint">(select multiple)</span></span>
              </div>
              <div className="genre-grid">
                {GENRES.map(g => (
                  <button key={g} className={`genre-btn ${genres.includes(g) ? "active" : ""}`}
                    onClick={() => toggleGenre(g)}>{g}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span className="label-num">03</span>
                <span className="label-text">Anime you've loved <span className="label-hint">(optional)</span></span>
              </div>
              <textarea className="liked-input"
                placeholder="e.g. Attack on Titan, Demon Slayer, Your Name..."
                value={liked} onChange={e => setLiked(e.target.value)} rows={3} />
            </div>

            <button className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={getRecommendations}
              disabled={loading || (!mood && !genres.length && !liked.trim())}>
              {loading ? (
                <span className="btn-loading"><span className="spinner" />{loadingText}</span>
              ) : (
                <span>◆ Explore the AniSphere</span>
              )}
            </button>

            {error && <div className="error-msg">⚠ {error}</div>}
          </div>
        </main>

        {/* RESULTS */}
        {results && (
          <section className="results-section" ref={resultsRef}>
            <div className="results-header">
              <p className="results-eyebrow">✦ curated for you ✦</p>
              <h2 className="results-title">Your AniSphere Picks</h2>
              <p className="results-subtitle">{results.length} anime selected just for you</p>
            </div>
            <div className="results-grid">
              {results.map((anime, i) => <AnimeCard key={i} anime={anime} index={i} />)}
            </div>
            <button className="retry-btn" onClick={() => { setResults(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              ↺ Get New Recommendations
            </button>
          </section>
        )}

        <footer className="footer">
          <span className="footer-logo">⬡ AniSphere</span>
          <span className="footer-divider">◆</span>
          <span className="footer-text">Built with Gemini AI & Jikan API · Made by Hibha</span>
        </footer>
      </div>

      <style>{`
        .app {
          position: relative; min-height: 100vh; overflow-x: hidden;
          background: linear-gradient(160deg, #2a1020 0%, #3d1828 40%, #2e1422 70%, #241018 100%);
          background-attachment: fixed;
          font-family: 'Outfit', sans-serif; color: #f0e0e4;
        }

        /* BG SHAPES */
        .bg-shape { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .shape1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(200,80,110,0.2) 0%, transparent 70%);
          top: -200px; right: -200px; filter: blur(80px);
          animation: shapeFloat 12s ease-in-out infinite alternate;
        }
        .shape2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(180,80,100,0.18) 0%, transparent 70%);
          bottom: 0; left: -150px; filter: blur(80px);
          animation: shapeFloat 15s ease-in-out infinite alternate-reverse;
        }
        .shape3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(212,140,100,0.12) 0%, transparent 70%);
          top: 40%; left: 50%; transform: translate(-50%, -50%); filter: blur(100px);
          animation: shapeFloat 10s ease-in-out infinite alternate;
        }
        @keyframes shapeFloat {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(20px) scale(1.04); }
        }

        /* NAV */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 52px; position: sticky; top: 0; z-index: 100;
          background: rgba(30,10,20,0.75); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(200,100,130,0.2);
          box-shadow: 0 1px 30px rgba(0,0,0,0.3);
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; }
        .logo-sphere { font-size: 20px; color: #e8a0b0; filter: drop-shadow(0 0 8px rgba(232,160,176,0.6)); }
        .logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 4px; color: #f0e0e4; }
        .nav-tagline { font-size: 10px; letter-spacing: 4px; color: #b06878; text-transform: uppercase; font-weight: 300; }

        /* HERO */
        .hero { position: relative; padding: 100px 52px 70px; text-align: center; z-index: 1; }
        .hero-content { max-width: 680px; margin: 0 auto; }
        .hero-badge {
          display: inline-block; padding: 7px 20px; margin-bottom: 30px;
          border: 1px solid rgba(232,160,176,0.3); border-radius: 30px;
          font-size: 10px; letter-spacing: 3px; color: #e8a0b0;
          background: rgba(232,160,176,0.08); text-transform: uppercase;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(50px, 9vw, 92px);
          line-height: 0.95; letter-spacing: 2px;
          color: #f0e0e4; margin-bottom: 22px;
          text-shadow: 0 0 40px rgba(200,80,110,0.3);
        }
        .hero-title-accent {
          background: linear-gradient(135deg, #e8a0b0, #d46880, #f0b8c8, #c85070);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-subtitle { font-size: 15px; line-height: 1.8; color: #c898a8; font-weight: 300; max-width: 520px; margin: 0 auto 48px; }
        .hero-divider { display: flex; align-items: center; gap: 16px; max-width: 300px; margin: 0 auto; }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,160,176,0.3), transparent); }
        .divider-gem { color: #c87888; font-size: 10px; }

        /* FORM */
        .form-section { padding: 60px 52px; max-width: 880px; margin: 0 auto; position: relative; z-index: 1; }
        .form-container { display: flex; flex-direction: column; gap: 52px; }
        .form-label { display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px; }
        .label-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: rgba(232,160,176,0.2); line-height: 1; }
        .label-text { font-size: 17px; font-weight: 500; color: #f0e0e4; letter-spacing: 0.3px; }
        .label-hint { font-size: 13px; color: #a07080; font-weight: 300; }

        /* MOOD */
        .mood-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media(max-width: 600px) { .mood-grid { grid-template-columns: repeat(2, 1fr); } }
        .mood-btn {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 22px 12px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(200,100,130,0.2);
          border-radius: 14px; cursor: pointer; transition: all 0.25s;
          color: #a07888; backdrop-filter: blur(8px);
        }
        .mood-btn:hover { border-color: #d07090; color: #f0e0e4; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(180,60,90,0.2); }
        .mood-btn.active {
          border-color: #e8a0b0; background: rgba(200,80,110,0.12);
          color: #f0e0e4; box-shadow: 0 4px 20px rgba(200,80,110,0.25);
        }
        .mood-icon { font-size: 26px; }
        .mood-label { font-size: 12px; letter-spacing: 0.5px; text-align: center; color: inherit; }

        /* GENRES */
        .genre-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .genre-btn {
          padding: 9px 20px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(200,100,130,0.2);
          border-radius: 30px; cursor: pointer; transition: all 0.2s;
          color: #a07888; font-family: 'Outfit', sans-serif; font-size: 13px;
          backdrop-filter: blur(8px);
        }
        .genre-btn:hover { border-color: #d07090; color: #f0e0e4; }
        .genre-btn.active {
          border-color: #e8a0b0; background: rgba(200,80,110,0.15);
          color: #f0c0cc; font-weight: 500;
        }

        /* TEXTAREA */
        .liked-input {
          width: 100%; padding: 16px 20px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(200,100,130,0.2);
          border-radius: 12px; color: #f0e0e4;
          font-family: 'Outfit', sans-serif; font-size: 14px;
          resize: vertical; outline: none; transition: all 0.2s; line-height: 1.7;
          backdrop-filter: blur(8px);
        }
        .liked-input:focus { border-color: #e8a0b0; box-shadow: 0 0 0 3px rgba(200,80,110,0.12); }
        .liked-input::placeholder { color: #704050; }

        /* SUBMIT */
        .submit-btn {
          width: 100%; padding: 20px;
          background: linear-gradient(135deg, #c07878, #a05858, #c88880);
          border: none; border-radius: 12px; cursor: pointer;
          color: #fff; font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 5px;
          transition: all 0.3s;
          box-shadow: 0 6px 28px rgba(184,120,120,0.32);
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #d08888, #b06868, #d89898);
          transform: translateY(-2px); box-shadow: 0 12px 40px rgba(184,120,120,0.42);
        }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 14px; letter-spacing: 2px; font-family: 'Outfit', sans-serif; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-msg { text-align: center; padding: 16px; background: rgba(200,80,80,0.06); border: 1px solid rgba(200,80,80,0.18); border-radius: 8px; color: #b06060; font-size: 13px; }

        /* RESULTS */
        .results-section { padding: 80px 52px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .results-header { text-align: center; margin-bottom: 64px; }
        .results-eyebrow { font-size: 11px; letter-spacing: 4px; color: #e8a0b0; text-transform: uppercase; margin-bottom: 12px; }
        .results-title { font-family: 'Bebas Neue', sans-serif; font-size: 50px; letter-spacing: 3px; color: #f0e0e4; margin-bottom: 8px; }
        .results-subtitle { color: #a07888; font-size: 14px; letter-spacing: 1px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }

        /* ANIME CARD */
        .anime-card {
          background: rgba(40,15,25,0.85); border: 1px solid rgba(200,100,130,0.2);
          border-radius: 18px; overflow: hidden;
          animation: cardIn 0.5s ease both;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          display: flex; flex-direction: column;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .anime-card:hover { transform: translateY(-6px); border-color: #d07090; box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(200,80,110,0.1); }
        @keyframes cardIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .card-poster { position: relative; aspect-ratio: 2/3; overflow: hidden; background: #f5eced; max-height: 280px; }
        .card-poster img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .anime-card:hover .card-poster img { transform: scale(1.04); }
        .card-poster-fallback {
          width: 100%; height: 100%; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          background: linear-gradient(135deg, #f5eced, #eddde0); color: #c0a0a8;
        }
        .card-poster-fallback span { font-size: 48px; }
        .card-poster-fallback p { font-size: 13px; text-align: center; padding: 0 20px; color: #a08088; }
        .card-poster-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(61,32,48,0.8) 0%, transparent 55%);
          display: flex; align-items: flex-end; justify-content: space-between; padding: 16px;
        }
        .card-index { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: rgba(255,255,255,0.18); letter-spacing: 2px; }
        .card-score { background: rgba(212,170,140,0.25); border: 1px solid rgba(220,180,150,0.45); color: #fff; font-size: 12px; padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(4px); }
        .card-type-badge { position: absolute; top: 12px; left: 12px; background: rgba(184,120,120,0.22); border: 1px solid rgba(200,140,140,0.4); color: #fff; font-size: 10px; letter-spacing: 2px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; backdrop-filter: blur(4px); }

        .card-body { padding: 22px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .card-title { font-size: 17px; font-weight: 600; color: #f0e0e4; line-height: 1.25; margin-bottom: 3px; }
        .card-jp-title { font-family: 'Noto Sans JP', sans-serif; font-size: 12px; color: #a07888; font-weight: 300; }
        .card-meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .meta-pill { font-size: 11px; padding: 3px 11px; border-radius: 20px; letter-spacing: 0.3px; }
        .meta-pill.year { background: rgba(200,80,110,0.15); color: #e8a0b8; border: 1px solid rgba(200,80,110,0.25); }
        .meta-pill.eps { background: rgba(180,80,100,0.12); color: #d890a8; border: 1px solid rgba(180,80,100,0.22); }
        .meta-pill.studio { background: rgba(255,255,255,0.06); color: #c898a8; border: 1px solid rgba(200,100,130,0.18); }
        .card-genres { display: flex; flex-wrap: wrap; gap: 6px; }
        .genre-tag { font-size: 10px; padding: 3px 11px; border-radius: 20px; background: rgba(200,80,110,0.1); border: 1px solid rgba(200,80,110,0.22); color: #e8a0b8; letter-spacing: 0.3px; }
        .card-match-reason { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: rgba(200,80,110,0.07); border-radius: 10px; border-left: 2px solid rgba(232,160,176,0.45); }
        .match-icon { color: #e8a0b0; font-size: 13px; flex-shrink: 0; margin-top: 2px; }
        .card-match-reason p { font-size: 12px; color: #c898a8; line-height: 1.65; font-style: italic; }
        .card-synopsis { font-size: 13px; color: #b08898; line-height: 1.75; font-weight: 300; flex: 1; }
        .mal-link { display: inline-block; margin-top: 4px; font-size: 12px; color: #e8a0b0; text-decoration: none; letter-spacing: 0.3px; transition: color 0.2s; }
        .mal-link:hover { color: #f0c0cc; }

        .retry-btn {
          display: block; margin: 60px auto 0; padding: 14px 44px;
          background: transparent; border: 1px solid rgba(232,160,176,0.3);
          border-radius: 30px; color: #e8a0b0; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 14px; letter-spacing: 1px; transition: all 0.2s;
        }
        .retry-btn:hover { background: rgba(200,80,110,0.1); border-color: #e8a0b0; color: #f0c0cc; }

        .footer {
          text-align: center; padding: 40px 52px;
          border-top: 1px solid rgba(200,100,130,0.15);
          background: rgba(20,8,15,0.5); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
          position: relative; z-index: 1;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 3px; color: #e8a0b0; }
        .footer-divider { color: rgba(232,160,176,0.3); font-size: 8px; }
        .footer-text { font-size: 12px; color: #a07888; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .nav-tagline { display: none; }
          .hero { padding: 60px 24px 50px; }
          .form-section, .results-section { padding: 40px 24px; }
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
