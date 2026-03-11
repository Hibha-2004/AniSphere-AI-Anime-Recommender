import { useState, useEffect, useRef } from "react";

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

function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2,
      alpha: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1) s.speed *= -1;
        if (s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${s.alpha * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function AnimeCard({ anime, index }) {
  const [imgError, setImgError] = useState(false);
  const delay = index * 120;

  return (
    <div className="anime-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="card-poster">
        {anime.image && !imgError ? (
          <img src={anime.image} alt={anime.title} onError={() => setImgError(true)} />
        ) : (
          <div className="card-poster-fallback">
            <span>🎌</span>
            <p>{anime.title}</p>
          </div>
        )}
        <div className="card-poster-overlay">
          <div className="card-index">#{String(index + 1).padStart(2, "0")}</div>
          {anime.malScore && (
            <div className="card-score">⭐ {anime.malScore}</div>
          )}
        </div>
        <div className="card-type-badge">{anime.type || "TV Series"}</div>
      </div>

      <div className="card-body">
        <div className="card-titles">
          <h3 className="card-title">{anime.title}</h3>
          {anime.japaneseTitle && (
            <p className="card-jp-title">{anime.japaneseTitle}</p>
          )}
        </div>

        <div className="card-meta-row">
          {anime.year && <span className="meta-pill year">{anime.year}</span>}
          {anime.episodes && <span className="meta-pill eps">{anime.episodes} eps</span>}
          {anime.studio && <span className="meta-pill studio">{anime.studio}</span>}
        </div>

        <div className="card-genres">
          {anime.genres?.map(g => (
            <span key={g} className="genre-tag">{g}</span>
          ))}
        </div>

        <div className="card-match-reason">
          <span className="match-icon">◈</span>
          <p>{anime.matchReason}</p>
        </div>

        <p className="card-synopsis">{anime.synopsis}</p>

        {anime.malUrl && (
          <a href={anime.malUrl} target="_blank" rel="noreferrer" className="mal-link">
            View on MyAnimeList →
          </a>
        )}
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
      <StarField />
      <div className="app">

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
          <div className="hero-bg-glow glow-blue" />
          <div className="hero-bg-glow glow-pink" />
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
        </header>

        {/* FORM */}
        <main className="form-section">
          <div className="form-container">

            {/* MOOD */}
            <div className="form-group">
              <div className="form-label">
                <span className="label-num">01</span>
                <span className="label-text">What's your mood?</span>
              </div>
              <div className="mood-grid">
                {MOODS.map(m => (
                  <button
                    key={m.label}
                    className={`mood-btn ${mood === m.label ? "active" : ""}`}
                    onClick={() => setMood(mood === m.label ? "" : m.label)}
                  >
                    <span className="mood-icon">{m.icon}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GENRES */}
            <div className="form-group">
              <div className="form-label">
                <span className="label-num">02</span>
                <span className="label-text">Pick your genres <span className="label-hint">(select multiple)</span></span>
              </div>
              <div className="genre-grid">
                {GENRES.map(g => (
                  <button
                    key={g}
                    className={`genre-btn ${genres.includes(g) ? "active" : ""}`}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* LIKED */}
            <div className="form-group">
              <div className="form-label">
                <span className="label-num">03</span>
                <span className="label-text">Anime you've loved <span className="label-hint">(optional)</span></span>
              </div>
              <textarea
                className="liked-input"
                placeholder="e.g. Attack on Titan, Demon Slayer, Your Name, One Punch Man..."
                value={liked}
                onChange={e => setLiked(e.target.value)}
                rows={3}
              />
            </div>

            {/* SUBMIT */}
            <button
              className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={getRecommendations}
              disabled={loading || (!mood && !genres.length && !liked.trim())}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  {loadingText}
                </span>
              ) : (
                <span>⬡ Explore the AniSphere</span>
              )}
            </button>

            {error && <div className="error-msg">⚠ {error}</div>}
          </div>
        </main>

        {/* RESULTS */}
        {results && (
          <section className="results-section" ref={resultsRef}>
            <div className="results-header">
              <h2 className="results-title">Your AniSphere Picks</h2>
              <p className="results-subtitle">{results.length} anime curated just for you</p>
            </div>
            <div className="results-grid">
              {results.map((anime, i) => (
                <AnimeCard key={i} anime={anime} index={i} />
              ))}
            </div>
            <button className="retry-btn" onClick={() => { setResults(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              ↺ Get New Recommendations
            </button>
          </section>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <span className="footer-logo">⬡ AniSphere</span>
          <span className="footer-text">Built with Gemini AI & Jikan API · Made by Hibha</span>
        </footer>
      </div>

      <style>{`
        .app { position: relative; z-index: 1; min-height: 100vh; }

        /* NAV */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; border-bottom: 1px solid #1a1e30;
          backdrop-filter: blur(12px); background: rgba(7,8,15,0.7);
          position: sticky; top: 0; z-index: 100;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .logo-sphere { font-size: 22px; color: #4f7fff; filter: drop-shadow(0 0 8px #4f7fff80); }
        .logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 3px; color: #dde3f5; }
        .nav-tagline { font-size: 11px; letter-spacing: 3px; color: #3a4060; text-transform: uppercase; }

        /* HERO */
        .hero {
          position: relative; padding: 100px 48px 80px;
          text-align: center; overflow: hidden;
        }
        .hero-bg-glow {
          position: absolute; border-radius: 50%;
          filter: blur(140px); pointer-events: none;
        }
        .glow-blue { width: 600px; height: 400px; background: rgba(79,127,255,0.08); top: -100px; left: 50%; transform: translateX(-70%); }
        .glow-pink { width: 500px; height: 300px; background: rgba(255,79,127,0.06); top: 0; right: -100px; }
        .hero-content { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .hero-badge {
          display: inline-block; padding: 6px 18px;
          border: 1px solid #2e3a6e; border-radius: 20px;
          font-size: 11px; letter-spacing: 2px; color: #4f7fff;
          margin-bottom: 32px; background: rgba(79,127,255,0.05);
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 9vw, 96px);
          line-height: 0.95; letter-spacing: 2px;
          color: #dde3f5; margin-bottom: 24px;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, #4f7fff, #ff4f7f, #ffe566);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-subtitle {
          font-size: 16px; line-height: 1.7; color: #5a6280;
          font-weight: 300; max-width: 560px; margin: 0 auto;
        }

        /* FORM */
        .form-section { padding: 60px 48px; max-width: 900px; margin: 0 auto; }
        .form-container { display: flex; flex-direction: column; gap: 48px; }
        .form-group {}
        .form-label {
          display: flex; align-items: baseline; gap: 14px; margin-bottom: 20px;
        }
        .label-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          color: #2e3a6e; line-height: 1;
        }
        .label-text { font-size: 18px; font-weight: 500; color: #dde3f5; }
        .label-hint { font-size: 13px; color: #3a4060; font-weight: 300; }

        /* MOOD */
        .mood-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media(max-width: 600px) { .mood-grid { grid-template-columns: repeat(2, 1fr); } }
        .mood-btn {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 20px 12px;
          background: rgba(14,16,24,0.8); border: 1px solid #1e2130;
          border-radius: 12px; cursor: pointer; transition: all 0.25s;
          color: #5a6280;
        }
        .mood-btn:hover { border-color: #2e3a6e; color: #dde3f5; transform: translateY(-2px); }
        .mood-btn.active {
          border-color: #4f7fff; background: rgba(79,127,255,0.08);
          color: #dde3f5; box-shadow: 0 0 20px rgba(79,127,255,0.15);
        }
        .mood-icon { font-size: 28px; }
        .mood-label { font-size: 12px; letter-spacing: 0.5px; text-align: center; }

        /* GENRES */
        .genre-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .genre-btn {
          padding: 9px 20px;
          background: rgba(14,16,24,0.8); border: 1px solid #1e2130;
          border-radius: 6px; cursor: pointer; transition: all 0.2s;
          color: #5a6280; font-family: 'Outfit', sans-serif; font-size: 13px;
        }
        .genre-btn:hover { border-color: #2e3a6e; color: #dde3f5; }
        .genre-btn.active {
          border-color: #ff4f7f; background: rgba(255,79,127,0.08);
          color: #ff4f7f;
        }

        /* TEXTAREA */
        .liked-input {
          width: 100%; padding: 16px 20px;
          background: rgba(14,16,24,0.8); border: 1px solid #1e2130;
          border-radius: 10px; color: #dde3f5;
          font-family: 'Outfit', sans-serif; font-size: 14px;
          resize: vertical; outline: none; transition: border-color 0.2s;
          line-height: 1.6;
        }
        .liked-input:focus { border-color: #2e3a6e; }
        .liked-input::placeholder { color: #2a3050; }

        /* SUBMIT */
        .submit-btn {
          width: 100%; padding: 20px;
          background: linear-gradient(135deg, #2a4fff, #1a2da0);
          border: none; border-radius: 12px; cursor: pointer;
          color: #dde3f5; font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4060ff, #2a3abf);
          transform: translateY(-2px); box-shadow: 0 12px 40px rgba(79,127,255,0.3);
        }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 14px; letter-spacing: 2px; font-family: 'Outfit', sans-serif; }
        .spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-msg {
          text-align: center; padding: 16px;
          background: rgba(255,79,79,0.08); border: 1px solid rgba(255,79,79,0.2);
          border-radius: 8px; color: #ff6060; font-size: 13px;
        }

        /* RESULTS */
        .results-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
        .results-header { text-align: center; margin-bottom: 60px; }
        .results-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 52px;
          letter-spacing: 3px; color: #dde3f5; margin-bottom: 8px;
        }
        .results-subtitle { color: #3a4060; font-size: 14px; letter-spacing: 2px; }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        /* ANIME CARD */
        .anime-card {
          background: rgba(14,16,24,0.9); border: 1px solid #1e2130;
          border-radius: 16px; overflow: hidden;
          animation: cardIn 0.5s ease both;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          display: flex; flex-direction: column;
        }
        .anime-card:hover {
          transform: translateY(-6px); border-color: #2e3a6e;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(79,127,255,0.08);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-poster {
          position: relative; aspect-ratio: 2/3; overflow: hidden;
          background: #0e1018; max-height: 280px;
        }
        .card-poster img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s;
        }
        .anime-card:hover .card-poster img { transform: scale(1.04); }
        .card-poster-fallback {
          width: 100%; height: 100%; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          background: linear-gradient(135deg, #0e1018, #141620);
          color: #3a4060;
        }
        .card-poster-fallback span { font-size: 48px; }
        .card-poster-fallback p { font-size: 13px; text-align: center; padding: 0 20px; }
        .card-poster-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(7,8,15,0.9) 0%, transparent 50%);
          display: flex; align-items: flex-end; justify-content: space-between;
          padding: 16px;
        }
        .card-index {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          color: rgba(255,255,255,0.15); letter-spacing: 2px;
        }
        .card-score {
          background: rgba(255,229,102,0.15); border: 1px solid rgba(255,229,102,0.3);
          color: #ffe566; font-size: 12px; padding: 4px 10px; border-radius: 20px;
        }
        .card-type-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(79,127,255,0.2); border: 1px solid rgba(79,127,255,0.3);
          color: #4f7fff; font-size: 10px; letter-spacing: 2px;
          padding: 4px 10px; border-radius: 4px; text-transform: uppercase;
        }

        .card-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .card-titles {}
        .card-title { font-size: 18px; font-weight: 600; color: #dde3f5; line-height: 1.2; margin-bottom: 4px; }
        .card-jp-title { font-family: 'Noto Sans JP', sans-serif; font-size: 12px; color: #3a4060; font-weight: 300; }
        .card-meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .meta-pill {
          font-size: 11px; padding: 3px 10px; border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .meta-pill.year { background: rgba(79,127,255,0.1); color: #4f7fff; }
        .meta-pill.eps { background: rgba(255,229,102,0.08); color: #ffe566; }
        .meta-pill.studio { background: rgba(255,255,255,0.04); color: #5a6280; border: 1px solid #1e2130; }
        .card-genres { display: flex; flex-wrap: wrap; gap: 6px; }
        .genre-tag {
          font-size: 10px; padding: 3px 10px; border-radius: 20px;
          background: rgba(255,79,127,0.08); border: 1px solid rgba(255,79,127,0.2);
          color: #ff4f7f; letter-spacing: 0.5px;
        }
        .card-match-reason {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 12px; background: rgba(79,127,255,0.05);
          border-radius: 8px; border-left: 2px solid #4f7fff;
        }
        .match-icon { color: #4f7fff; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .card-match-reason p { font-size: 12px; color: #7a8aaa; line-height: 1.6; font-style: italic; }
        .card-synopsis { font-size: 13px; color: #3a4060; line-height: 1.7; font-weight: 300; flex: 1; }
        .mal-link {
          display: inline-block; margin-top: 4px;
          font-size: 12px; color: #4f7fff; text-decoration: none; letter-spacing: 0.5px;
          transition: color 0.2s;
        }
        .mal-link:hover { color: #7fa5ff; }

        /* RETRY */
        .retry-btn {
          display: block; margin: 60px auto 0;
          padding: 14px 40px;
          background: transparent; border: 1px solid #2e3a6e;
          border-radius: 8px; color: #4f7fff; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 14px; letter-spacing: 1px;
          transition: all 0.2s;
        }
        .retry-btn:hover { background: rgba(79,127,255,0.08); border-color: #4f7fff; }

        /* FOOTER */
        .footer {
          text-align: center; padding: 40px 48px;
          border-top: 1px solid #1a1e30;
          display: flex; align-items: center; justify-content: center; gap: 24px;
          flex-wrap: wrap;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: #4f7fff; }
        .footer-text { font-size: 12px; color: #2a3050; letter-spacing: 1px; }

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
