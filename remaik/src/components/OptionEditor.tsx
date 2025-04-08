// filepath: /home/caten/projects/remAIk/src/components/OptionEditor.tsx
import React, { useState } from "react";
import { fetchAlternateHistory } from "../api/groqai";

interface OptionEditorProps {
  event: string;
  onUpdateTimeline: (newEntry: string) => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  event,
  onUpdateTimeline,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");

  const generateOptions = async () => {
    const aiResponse = await fetchAlternateHistory(event, userInput);
    setOptions(aiResponse.split("\n")); // Assuming AI returns options as a list.
  };

  const handleSubmit = (option: string) => {
    onUpdateTimeline(option);
  };

  return (
    <div>
      <h2>Modify the Event</h2>
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Edit the event or add your own..."
      />
      <button onClick={generateOptions}>Generate Options</button>
      <ul>
        {options.map((option, index) => (
          <li key={index}>
            <button onClick={() => handleSubmit(option)}>{option}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptionEditor;