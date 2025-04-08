import React, { useState } from "react";
import EventSelector from "./components/EventSelector";
import OptionEditor from "./components/OptionEditor";
import TimelineViewer from "./components/TimelineViewer";

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string[]>([]);

  return (
    <div>
      <h1>remAIk: Alternate History Game</h1>
      {!selectedEvent ? (
        <EventSelector onSelectEvent={setSelectedEvent} />
      ) : (
        <>
          <OptionEditor
            event={selectedEvent}
            onUpdateTimeline={(newEntry) =>
              setTimeline((prev) => [...prev, newEntry])
            }
          />
          <TimelineViewer timeline={timeline} />
        </>
      )}
    </div>
  );
};

export default App;
