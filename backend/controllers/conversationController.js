const db = require("../db/db");
const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sendVoiceMessage = async (req, res) => {
  const { conversationId } = req.params;

  if (!req.files || !req.files.audio) {
    return res.status(400).json({ error: "Audio file required" });
  }

  try {
    const audioFile = req.files.audio;
    const fileName = `user_${Date.now()}.webm`;
    const filePath = `public/audio/${fileName}`;

    // Save uploaded audio
    await audioFile.mv(filePath);

    // Convert speech → text
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    const userText = transcription.text;

    // Save user message
    await db.query(
      "INSERT INTO messages (conversation_id, sender, message) VALUES (?, ?, ?)",
      [conversationId, "user", userText]
    );

    // Generate AI reply
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a calm, supportive AI therapist." },
        { role: "user", content: userText },
      ],
    });

    const aiText = completion.choices[0].message.content;

    // Save AI message
    await db.query(
      "INSERT INTO messages (conversation_id, sender, message) VALUES (?, ?, ?)",
      [conversationId, "ai", aiText]
    );

    // Convert AI text → speech
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: aiText,
    });

    const aiFileName = `ai_${Date.now()}.mp3`;
    const aiFilePath = `public/audio/${aiFileName}`;
    const buffer = Buffer.from(await speech.arrayBuffer());
    fs.writeFileSync(aiFilePath, buffer);

    res.status(201).json({
      aiText,
      aiAudioUrl: `/audio/${aiFileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { sendVoiceMessage };
