import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const USE_FAKE_AI = false;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // 🧪 FAKE MODE
    if (USE_FAKE_AI) {
      await new Promise((r) => setTimeout(r, 1200));

      const lastUserMessage = messages[messages.length - 1]?.content;

      return res.json({
        reply: `🤖 Fake AI says: I received your message -> "${lastUserMessage}"`,
      });
    }

    // 🔥 REAL GEMINI MODE
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
        }),
      }
    );

    const data = await response.json();

    // Safety check
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const aiReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from AI";

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
