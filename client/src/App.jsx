import { useState } from "react";
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import ReviewOutput from "./components/ReviewOutput";
import "./App.css";

const API_URL = "/api";

function App() {
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSubmit = async (code, language) => {
    setIsLoading(true);
    setReview("");
    setError("");
    setStats(null);

    const startTime = Date.now();

    try {
      const response = await fetch(`${API_URL}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setReview(data.review);
      setStats({
        time: ((Date.now() - startTime) / 1000).toFixed(1),
        lines: code.split("\n").length,
        language,
      });
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">
          {/* Info Banner */}
          <div className="info-banner">
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Paste your code</span>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>AI analyzes it</span>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Get improvements</span>
            </div>
          </div>

          {/* Editor Section */}
          <section className="section">
            <CodeEditor onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <p className="loading-text">Analyzing your code with NVIDIA Nemotron 30B...</p>
            </div>
          )}

          {/* Stats Bar */}
          {stats && (
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-label">Language</span>
                <span className="stat-value">{stats.language}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Lines Analyzed</span>
                <span className="stat-value">{stats.lines}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Response Time</span>
                <span className="stat-value">{stats.time}s</span>
              </div>
            </div>
          )}

          {/* Review Output */}
          <section className="section">
            <ReviewOutput review={review} error={error} />
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>CopyRight of @Akash Narkar</p>
      </footer>
    </div>
  );
}

export default App;
