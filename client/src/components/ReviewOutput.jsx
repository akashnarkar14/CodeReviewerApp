import { useState } from "react";
import "./ReviewOutput.css";

// ─── helpers ──────────────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function extractScore(text) {
  const m = text.match(/\b(\d+)\s*(?:\/\s*10)?/);
  return m ? Math.min(10, Math.max(0, parseInt(m[1]))) : null;
}

function scoreGrade(n) {
  if (n >= 8) return "good";
  if (n >= 5) return "fair";
  return "poor";
}

function scoreLabel(n) {
  if (n >= 8) return "Great";
  if (n >= 5) return "Needs Work";
  return "Poor";
}

function parseSections(review) {
  const map = {};
  const lines = review.split("\n");
  let heading = null;
  let buf = [];
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+)/);
    if (m) {
      if (heading !== null) map[heading] = buf.join("\n").trim();
      heading = m[1]
        .toLowerCase()
        .replace(/^\d+\.\s*/, "")
        .replace(/\*\*/g, "")
        .trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (heading !== null) map[heading] = buf.join("\n").trim();
  return map;
}

function findSection(map, titles) {
  for (const [k, v] of Object.entries(map)) {
    if (titles.some((t) => k.includes(t))) return v ?? "";
  }
  return null;
}

function formatContent(text) {
  // fenced code blocks
  let html = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<div class="rc-code-block"><div class="rc-code-lang">${lang || "code"}</div><pre><code>${escapeHtml(code.trim())}</code></pre></div>`
  );

  // inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rc-inline">$1</code>');

  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const result = [];
  let inList = false;

  for (const line of html.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) { result.push("</ul>"); inList = false; }
      continue;
    }

    if (trimmed.startsWith('<div class="rc-code-block">')) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(trimmed);
      continue;
    }

    const liMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (liMatch) {
      if (!inList) { result.push('<ul class="rc-list">'); inList = true; }
      result.push(`<li>${liMatch[1]}</li>`);
      continue;
    }

    const oliMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (oliMatch) {
      if (!inList) { result.push('<ul class="rc-list">'); inList = true; }
      result.push(`<li>${oliMatch[1]}</li>`);
      continue;
    }

    if (inList) { result.push("</ul>"); inList = false; }
    result.push(`<p class="rc-p">${trimmed}</p>`);
  }

  if (inList) result.push("</ul>");
  return result.join("\n");
}

// ─── icons ────────────────────────────────────────────────────────

const StarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const WarningIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CodeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// ─── section card ─────────────────────────────────────────────────

const SectionCard = ({ label, accent, icon, children }) => (
  <div className={`rc-card rc-card--${accent}`}>
    <div className="rc-card-header">
      <span className={`rc-card-icon rc-icon--${accent}`}>{icon}</span>
      <h3 className="rc-card-title">{label}</h3>
    </div>
    <div className="rc-card-body">{children}</div>
  </div>
);

// ─── main component ───────────────────────────────────────────────

const ReviewOutput = ({ review, error }) => {
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div className="rc-error">
        <div className="rc-error-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div>
          <h3>Analysis Failed</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const sections = parseSections(review);

  const scoreText     = findSection(sections, ["code quality score"]);
  const issuesText    = findSection(sections, ["issues found", "issues"]);
  const securityText  = findSection(sections, ["security concerns", "security"]);
  const perfText      = findSection(sections, ["performance"]);
  const practicesText = findSection(sections, ["best practices"]);
  const improvedText  = findSection(sections, ["improved code"]);

  const score = scoreText !== null ? extractScore(scoreText) : null;
  const grade = score !== null ? scoreGrade(score) : null;

  const hasSections = [scoreText, issuesText, securityText, perfText, practicesText, improvedText].some(
    (s) => s !== null
  );

  return (
    <div className="rc-root">
      {/* ── top bar ── */}
      <div className="rc-topbar">
        <div className="rc-topbar-left">
          <FileIcon />
          <span>Review Results</span>
        </div>
        <button className="rc-copy-btn" onClick={handleCopy}>
          {copied ? <><CheckIcon /><span>Copied!</span></> : <><CopyIcon /><span>Copy</span></>}
        </button>
      </div>

      {hasSections ? (
        <div className="rc-sections">

          {/* ── Score ── */}
          {scoreText !== null && (
            <SectionCard label="Code Quality Score" accent="score" icon={<StarIcon />}>
              <div className="rc-score-wrap">
                {score !== null && (
                  <div className={`rc-score-badge rc-score--${grade}`}>
                    <span className="rc-score-num">{score}</span>
                    <span className="rc-score-denom">/10</span>
                    <span className="rc-score-label">{scoreLabel(score)}</span>
                  </div>
                )}
                <div
                  className="rc-score-desc"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(
                      score !== null
                        ? scoreText.replace(new RegExp(`\\b${score}\\s*\\/\\s*10\\b`), "").trim()
                        : scoreText
                    ),
                  }}
                />
              </div>
            </SectionCard>
          )}

          {/* ── Issues ── */}
          {issuesText !== null && (
            <SectionCard label="Issues Found" accent="warning" icon={<WarningIcon />}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(issuesText) }} />
            </SectionCard>
          )}

          {/* ── Security ── */}
          {securityText !== null && (
            <SectionCard label="Security Concerns" accent="danger" icon={<ShieldIcon />}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(securityText) }} />
            </SectionCard>
          )}

          {/* ── Performance ── */}
          {perfText !== null && (
            <SectionCard label="Performance" accent="info" icon={<ZapIcon />}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(perfText) }} />
            </SectionCard>
          )}

          {/* ── Best Practices ── */}
          {practicesText !== null && (
            <SectionCard label="Best Practices" accent="success" icon={<CheckCircleIcon />}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(practicesText) }} />
            </SectionCard>
          )}

          {/* ── Improved Code ── */}
          {improvedText !== null && (
            <SectionCard label="Improved Code" accent="code" icon={<CodeIcon />}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(improvedText) }} />
            </SectionCard>
          )}

        </div>
      ) : (
        /* fallback: raw formatted markdown */
        <div
          className="rc-fallback"
          dangerouslySetInnerHTML={{ __html: formatContent(review) }}
        />
      )}
    </div>
  );
};

export default ReviewOutput;
