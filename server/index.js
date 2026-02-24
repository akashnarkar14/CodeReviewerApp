const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";

const SYSTEM_PROMPT = `You are an expert senior code reviewer. Respond using EXACTLY these six markdown sections with these EXACT headings:

## Code Quality Score
Rate the code X/10 and briefly explain why.

## Issues Found
List every bug, logic error, and syntax problem as bullet points (- item). If none, write "No issues found."

## Security Concerns
List security vulnerabilities as bullet points. If none, write "No security concerns found."

## Performance
List performance improvements as bullet points. If none, write "No performance issues found."

## Best Practices
List coding standard violations as bullet points. If none, write "Code follows best practices."

## Improved Code
Provide the complete corrected/improved version inside a fenced code block with the language tag.

Be specific with line references. Keep suggestions actionable and concise.`;

app.post("/api/review", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code is required" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenRouter API key is not configured" });
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Review the following ${language || "code"}:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter error:", response.status, errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || `API request failed with status ${response.status}`,
      });
    }

    const data = await response.json();
    const review = data.choices?.[0]?.message?.content;

    if (!review) {
      return res.status(500).json({ error: "No review generated" });
    }

    res.json({ review });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Failed to connect to AI service" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve React static files in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));
  app.get("/*splat", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
