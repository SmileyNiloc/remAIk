import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/test", async (req, res) => {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "List a few popular cookie recipes, and include the amounts of ingredients.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            propertyOrdering: ["recipeName", "ingredients"],
          },
        },
      },
    });

    // Gemini responses usually have a "candidates" array
    res.json(response.candidates ? response.candidates[0].content : response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/test2", async (req, res) => {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "List a few popular cookie recipes, and include the amounts of ingredients.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            propertyOrdering: ["recipeName", "ingredients"],
          },
        },
      },
    });

    // Gemini responses usually have a "candidates" array
    res.json(response);
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

// app.post("/generate-initial", async (req, res) => {
//   const { prompt } = req.body;
//   try {
//     const response = await gemini.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents:
//         "Create 3 Unique Historical events that have a title, date, and description",
//       config: {
//         thinkingConfig: { thinkingBudget: 0 },
//         systemInstruction:
//           "You are a game revolving around letting users create alternate histories",
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.ARRAY,
//           maxItems: 3,
//           minItems: 3,
//           uniqueItems: true,
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               title: {
//                 type: Type.STRING,
//               },
//               date: {
//                 type: Type.STRING,
//               },
//               description: {
//                 type: Type.STRING,
//               },
//               propertyOrdering: ["title", "date", "description"],
//             },
//           },
//         },
//       },
//     });
//     res.json({ data: response });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.listen(3000, () => console.log("Server running on port 3000"));
