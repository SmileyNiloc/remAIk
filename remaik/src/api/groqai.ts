import axios from "axios";

export const fetchAlternateHistory = async (
  event: string,
  userInput: string
): Promise<string> => {
  const response = await axios.post(
    "http://localhost:5000/api/groq", // Updated to match the new backend endpoint
    {
      prompt: `Given the historical event: "${event}", and the user modification: "${userInput}", describe how the timeline of humanity changes.`,
      max_tokens: 500, // Pass the max_tokens parameter
    }
  );

  // Assuming the GROQ API response structure is similar to OpenAI's
  return (
    response.data.choices[0]?.message?.content || "No response from GROQ API"
  );
};
