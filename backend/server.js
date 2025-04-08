const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const Groq = require("groq-sdk"); // Import the GROQ SDK

const app = express();
const PORT = 5000;

// Initialize the GROQ client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(bodyParser.json());

app.post("/api/groq", async (req, res) => {
  const { prompt, max_tokens } = req.body;

  try {
    // Use the GROQ SDK to create a chat completion
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt, // Pass the user prompt
        },
      ],
      model: "gemma2-9b-it", // Specify the Gemma2 model
      max_tokens, // Specify the maximum number of tokens
    });

    // Return the response to the client
    res.json(response);
  } catch (error) {
    console.error(error.message || "Error communicating with GROQ API");
    res.status(500).send("Error communicating with GROQ API");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
