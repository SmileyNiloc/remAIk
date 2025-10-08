import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();const app = express();
app.use(cors());
app.use(express.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post("/api/ask", async (req, res) => {  
	try {    const { prompt } = req.body;
    	const completion = await openai.chat.completions.create({      
    		model: "gpt-4o-mini",      
    		messages: [{ role: "user", content: prompt }],    
    			});    
    		res.json({ reply: completion.choices[0].message.content });  
    		} catch (err) {    
    		console.error(err);   import express from "express";import cors from "cors";import dotenv from "dotenv";import OpenAI from "openai";dotenv.config();const app = express();app.use(cors());app.use(express.json());const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });app.post("/api/ask", async (req, res) => {  try {    const { prompt } = req.body;    const completion = await openai.chat.completions.create({      model: "gpt-4o-mini",      messages: [{ role: "user", content: prompt }],    });    res.json({ reply: completion.choices[0].message.content });  } catch (err) {    console.error(err);    res.status(500).json({ error: "Error calling OpenAI API" });  }});const port = process.env.PORT || 8080;app.listen(port, "0.0.0.0", () => console.log(`🚀 Running on port ${port}`));
