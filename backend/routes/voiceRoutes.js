const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const router = express.Router();

// Setup multer to save uploaded files
const upload = multer({ dest: "uploads/" });

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/voice
router.post("/", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

        const filePath = req.file.path;

        // 1️⃣ Transcribe audio with Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });

        const userText = transcription.text;
        console.log("User said:", userText);

        // 2️⃣ Generate AI therapist reply
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a calm, supportive AI therapist." },
                { role: "user", content: userText },
            ],
        });

        const aiText = completion.choices[0].message.content;

        // 3️⃣ Convert AI text to speech
        const speech = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "alloy",
            input: aiText,
        });

        // 4️⃣ Save MP3 file
        const audioFileName = `ai_${Date.now()}.mp3`;
        const audioPath = path.join(__dirname, "../public/audio", audioFileName);
        const buffer = Buffer.from(await speech.arrayBuffer());
        fs.writeFileSync(audioPath, buffer);

        // 5️⃣ Return AI text + audio URL
        res.json({ aiText, audioUrl: `/audio/${audioFileName}` });

        // 6️⃣ Cleanup uploaded audio
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
