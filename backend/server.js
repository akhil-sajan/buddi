const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const server = http.createServer(app); // Wrap Express app

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Serve frontend and audio files
app.use(express.static("public"));
app.use("/audio", express.static("public/audio"));

// Routes
const voiceRoutes = require("./routes/voiceRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

app.use("/api/voice", voiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

// --- WebSocket Server ---
const wss = new WebSocket.Server({ server });
console.log("✅ WebSocket server attached");

wss.on("connection", (ws) => {
  console.log("🎙️ Client connected to WS");

  // Initialize conversation history
  const conversationHistory = [
    {
      role: "system",
      content: "You are a warm, empathetic, and attentive AI therapist. Your goal is to have a natural, flowing conversation. Speak like a real human, not an AI. Use natural intonation, and occasionally use fillers like 'hmm', 'I see', or 'right' to sound more authentic. Listen carefully to the user, validate their feelings, and ask gentle follow-up questions. Keep your responses concise (1-3 sentences) to maintain a back-and-forth dialogue. Do not lecture. CRITICAL RULE: You MUST ALWAYS respond ONLY in English, no matter what language the user speaks. If the user speaks in another language, understand their message but respond in English. Never use any language other than English in your responses."
    }
  ];

  ws.on("message", async (msg) => {
    try {
      console.log("📨 Received audio blob via WS");

      // Convert base64/buffer
      // Note: If sending Blob from browser, it might come as Buffer directly or encoded.
      // We'll assume standard Buffer if coming from ws.send(blob)
      const audioBuffer = Buffer.from(msg);

      // 1️⃣ Transcribe audio → text
      // We need a temporary file for transcription usually, or a stream. 
      // OpenAI's Node library expects a file-like object or fs.ReadStream.
      // Let's write to a temp file.
      const tempFileName = `temp_${Date.now()}.webm`;
      const tempFilePath = `public/audio/${tempFileName}`;
      fs.writeFileSync(tempFilePath, audioBuffer);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en", // Force English transcription
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      const userText = transcription.text;
      console.log("📝 Transcribed text:", userText);

      if (!userText.trim()) return;

      // Add user message to history
      conversationHistory.push({ role: "user", content: userText });

      // 2️⃣ Generate AI response with history
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationHistory,
      });

      const aiText = completion.choices[0].message.content;
      console.log("🤖 AI says:", aiText);

      // Add AI response to history
      conversationHistory.push({ role: "assistant", content: aiText });

      // 3️⃣ Convert AI text → speech
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "shimmer", // Sweetest, most natural-sounding voice
        input: aiText,
      });

      const audioFileName = `ai_${Date.now()}.mp3`;
      const filePath = `public/audio/${audioFileName}`;
      const buffer = Buffer.from(await speech.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // 4️⃣ Send audio URL back to client
      ws.send(JSON.stringify({
        type: "audio",
        audioUrl: `/audio/${audioFileName}`,
        aiText
      }));

    } catch (err) {
      console.error("🔥 Error processing WS message:", err.message);
      ws.send(JSON.stringify({ type: "error", error: err.message }));
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
