import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import {
  verifyFirebaseToken,
  updateDatabase,
  onceDatabase,
  replaceDatabase,
  addToDatabase,
} from "./auth.js";

const port = process.env.PORT || 4000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

const allowedOrigin = ["https://remaik-987e9.web.app"];

app.use(
  cors({
    origin: [allowedOrigin],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// app.use(cors());
app.use(express.json());

app.get("/test", async (req, res) => {
  const testdata = [
    {
      title: "war of 1812",
      date: "1812",
      description: "there was a war in 1812...",
    },
  ];
  await updateDatabase("/test/", "testTimeline3", testdata);
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/add-event", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  console.log(`Adding new event for user: ${uid}`);
  await updateDatabase(`/test/${uid}`, "Timeline", {
    title: "",
    date: "",
    description: "",
  });
});

app.post("/extend-timeline", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  console.log(`Request from uid`, uid);
  try {
    // const events = JSON.stringify(req.body.events, null, 2);
    console.log("Getting timeline stored at /test/${uid}/Timeline");
    let events = await onceDatabase(`/test/${uid}/Timeline`);
    events = JSON.stringify(events);
    console.log(`Previous Events found: ${events}`);
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
        temperature: 1.2,
        topP: 0.9,
        topK: 40,
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 2,
          minItems: 2,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING, format: "date-time" },
              description: { type: Type.STRING },
            },
            propertyOrdering: ["title", "date", "description"],
          },
        },
      },
    });
    let content = response.candidates[0].content.parts[0].text;
    content = JSON.stringify(JSON.parse(content));
    console.log(`updating database with: ${content} `);
    // console.log(
    //   `Test taking index 0: ${content[0]}
    //   , and index 1: ${JSON.parse(content[1])}`
    // );
    const old_events = JSON.parse(events);
    const new_events = JSON.parse(content);
    const combined_events = [...old_events, ...new_events].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    console.log("updating database with:", JSON.stringify(combined_events));
    await replaceDatabase(`/test/${uid}/`, "Timeline", combined_events);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-initial", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  console.log(`generating initial: ${uid}`);
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Create Unique Historical events that have a title, date, and description",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        temperature: 1.2,
        topP: 0.9,
        topK: 40,
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 3,
          minItems: 3,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING, format: "date-time" },
              description: { type: Type.STRING },
            },
            propertyOrdering: ["title", "date", "description"],
          },
        },
      },
    });

    const content = response.candidates[0].content.parts[0].text;
    const sorted_content = JSON.parse(content).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    await replaceDatabase(`/test/${uid}`, "Timeline", sorted_content);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port:${port}`));
