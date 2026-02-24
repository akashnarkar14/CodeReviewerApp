import { useState } from "react";
import "./CodeEditor.css";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "Other",
];

const CodeEditor = ({ onSubmit, isLoading }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");

  const handleSubmit = () => {
    if (!code.trim()) return;
    onSubmit(code, language);
  };

  const handleClear = () => {
    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <span className="line-count">{lineCount} lines</span>
          {code.length > 0 && (
            <button className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="editor-body">
        <div className="line-numbers" aria-hidden="true">
          {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
        </div>
        <textarea
          className="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your code here..."
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="editor-footer">
        <div className="footer-info">
          {code.length > 0 && (
            <span className="char-count">{code.length} characters</span>
          )}
        </div>
        <button
          className="btn-review"
          onClick={handleSubmit}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Review Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
