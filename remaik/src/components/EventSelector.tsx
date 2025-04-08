// filepath: /home/caten/projects/remAIk/src/components/EventSelector.tsx
import React from "react";

interface EventSelectorProps {
  onSelectEvent: (event: string) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ onSelectEvent }) => {
  const events = [
    "World War II begins in 1939",
    "The Moon Landing in 1969",
    "The Fall of the Berlin Wall in 1989",
  ];

  return (
    <div>
      <h2>Select a Historical Event</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <button onClick={() => onSelectEvent(event)}>{event}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventSelector;