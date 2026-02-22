require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { topic, difficulty, count } = req.body;

  try {
    const prompt = `
Return ONLY valid JSON. No explanation.

Format:

{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "exact correct option text"
    }
  ]
}

Generate ${count} ${difficulty} multiple choice questions about ${topic}.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;

    const quizData = JSON.parse(text);

    res.json(quizData);

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});