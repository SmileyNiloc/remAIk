// filepath: /home/caten/projects/remAIk/src/components/TimelineViewer.tsx
import React from "react";

interface TimelineViewerProps {
  timeline: string[];
}

const TimelineViewer: React.FC<TimelineViewerProps> = ({ timeline }) => (
  <div>
    <h2>Timeline</h2>
    <ul>
      {timeline.map((entry, index) => (
        <li key={index}>{entry}</li>
      ))}
    </ul>
  </div>
);

export default TimelineViewer;