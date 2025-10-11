import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

// const allowedOrigin = ["https://"];

// app.use(
//   cors({
//     origin: [allowedOrigin],
//   })
// );
app.use(cors());
app.use(express.json());

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/extend-timeline", async (req, res) => {
  try {
    const events = JSON.stringify(req.body.events);
    let sysInstr = `
      Use the given timeline and extend it by 2 to 4 events.
      You are creating an alternate timeline. Here is the given timeline:

      ${JSON.stringify(events, null, 2)}
      `;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Extend given timeline with Unique made-up/changed Historical events that have a title, date, and description",
      config: {
        systemInstruction: sysInstr,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 4,
          minItems: 2,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            propertyOrdering: ["title", "date", "description"],
          },
        },
      },
    });

    const content = response.candidates[0].content.parts[0].text;
    res.json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/generate-initial", async (req, res) => {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Create Unique Historical events that have a title, date, and description",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 3,
          minItems: 3,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            propertyOrdering: ["title", "date", "description"],
          },
        },
      },
    });

    const content = response.candidates[0].content.parts[0].text;
    res.json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
