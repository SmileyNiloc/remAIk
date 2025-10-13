import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import admin from "firebase-admin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://remaik-987e9-default-rtdb.firebaseio.com",
});

// const allowedOrigin = ["https://"];

// app.use(
//   cors({
//     origin: [allowedOrigin],
//   })
// );

app.use(cors());
app.use(express.json());

app.get("/test", async (req, res) => {
  res.json(serviceAccount);
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/extend-timeline", async (req, res) => {
  try {
    const events = JSON.stringify(req.body.events, null, 2);
    let sysInstr = `
      Use the given timeline and extend it by 2 to 4 events.
      DO NOT RETURN any of the old events.
      You are creating an alternate timeline given changes to real historical events that are provided. Here is the given timeline:

      ${events}
      `;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Extend given timeline with new Unique made-up and/or changed Historical based on the changed historical events given that have a title, date, and description. DO NOT GIVE give me any of the old events",
      config: {
        systemInstruction: sysInstr,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 2,
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
