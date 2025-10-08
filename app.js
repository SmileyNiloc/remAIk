import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

const gemini = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await gemini.generateContent({ prompt });
    res.json({ text: response.candidates[0].content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
