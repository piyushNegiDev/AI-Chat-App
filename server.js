import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const USE_FAKE_AI = false;
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- BASIC RATE LIMIT -------------------- */
let lastRequestTime = 0;
const MIN_INTERVAL = 1000; // 1 request / second

/* -------------------- CHAT ENDPOINT -------------------- */
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    /* ---------- Validate request ---------- */
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid messages format",
      });
    }

    /* ---------- Rate limiting ---------- */
    const now = Date.now();
    if (now - lastRequestTime < MIN_INTERVAL) {
      return res.status(429).json({
        error: "Too many requests. Slow down.",
      });
    }
    lastRequestTime = now;

    /* ---------- Sanitize & trim messages ---------- */
    const safeMessages = messages
      .filter(
        (m) =>
          typeof m?.content === "string" &&
          (m.role === "user" || m.role === "model")
      )
      .slice(-10); // keep last 10 messages only

    if (safeMessages.length === 0) {
      return res.status(400).json({
        error: "No valid messages provided",
      });
    }

    /* ================= FAKE AI MODE ================= */
    if (USE_FAKE_AI) {
      await new Promise((r) => setTimeout(r, 1200));

      const lastUserMessage = safeMessages.at(-1)?.content ?? "No message";

      return res.json({
        reply: `🤖 Fake AI says: I received your message → "${lastUserMessage}"`,
      });
    }

    /* ================= REAL GEMINI MODE ================= */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: safeMessages.map((msg) => ({
            role: msg.role, // already sanitized
            parts: [{ text: msg.content }],
          })),
        }),
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    /* ---------- Gemini error handling ---------- */
    if (data?.error) {
      console.error("GEMINI ERROR:", data.error);
      return res.status(502).json({
        error: data.error.message || "Upstream AI error",
      });
    }

    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from AI";

    return res.json({ reply: aiReply });
  } catch (err) {
    /* ---------- Timeout handling ---------- */
    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "AI request timed out",
      });
    }

    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/* -------------------- SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
