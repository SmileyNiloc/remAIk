<script setup>
import { reactive, ref } from "vue";
import api from "../utils/api.js";
import { log, serror } from "@/utils/logger.js";
import { EditableDatabaseList } from "../utils/editableDatabase.js";
import { inject } from "vue";

// Loading state
const isLoading = ref(false);
// Event Factory Function (used to create new events locally), makes sure they are formatted correctly
function createEvent(firebaseData) {
  return reactive({
    id: firebaseData.id, // Vuefire adds automatically?
    title: firebaseData.title || "",
    date: firebaseData.date || "",
    description: firebaseData.description || "",
  });
}
const user = inject("user");

// Get the database reference and create an editable list (will have to handle this with authentication later)
const eventsDb = new EditableDatabaseList(user.value.dbRef, createEvent, 500);
const events = eventsDb.items;

// Add new Event
// const addEvent = async () => {
//   try {
//     await eventsDb.items.push({
//       title: "",
//       date: "", // empty string
//       description: "",
//     });
//     eventsDb._setupSync();
//   } catch (error) {
//     serror("Failed to add event:", error);
//   }
// };

// Delete event
// const deleteEvent = async (eventId) => {
//   if (!eventId) {
//     serror("Cannot delete event: Invalid event ID");
//     return;
//   }
//   try {
//     await eventsDb.removeItem(eventId);
//   } catch (error) {
//     serror("Failed to delete event:", error);
//   }
// };

const generateTimeline = async () => {
  isLoading.value = true;
  try {
    log("Generating using url:", api.defaults.baseURL + "/generate-initial");
    const res = await api.post("/generate-initial");
    // for (const data of res.data) {
    //   events.push(createEvent(data.title, data.date, data.description));
    // }
    log("Timeline generation response:", res.data);
  } catch (error) {
    serror("Error generating timeline:", error);
  } finally {
    isLoading.value = false;
    // events.sort((a, b) => a.date - b.date);
    log("Timeline generated with events:", events);
  }
};
const extendTimeline = async () => {
  isLoading.value = true;
  try {
    log("Extending using url:", api.defaults.baseURL + "/extend-timeline");
    const res = await api.post("/extend-timeline");
    // for (const data of res.data) {
    //   events.push(createEvent(data.title, data.date, data.description));
    // }
    log("Timeline extension response:", res.data);
  } catch (error) {
    serror("Error extending timeline:", error);
  } finally {
    isLoading.value = false;
    // events.sort((a, b) => a.date - b.date);
    log("Timeline extended with events:", events);
  }
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString; // return original if invalid
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};
// Auto-resize textarea as user types
const autoResize = (event) => {
  const textarea = event.target;
  textarea.style.height = "auto"; // Reset height
  textarea.style.height = textarea.scrollHeight + "px"; // Set to scroll height
};
</script>

<template>
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Generating your timeline...</p>
    </div>
  </div>

  <button v-if="events.length == 0" @click="generateTimeline">
    Generate an initial timeline!
  </button>

  <div v-if="events.length > 0" class="timeline">
    <div v-for="event in events" :key="event.id" class="event-card">
      <div class="event-header">
        <textarea
          v-model="event.title"
          class="event-title"
          placeholder="Title"
          rows="1"
          @input="autoResize"
        />
        <textarea
          :value="formatDate(event.date)"
          class="event-date"
          placeholder="Date"
          rows="1"
          @input="autoResize"
        />
      </div>
      <textarea
        v-model="event.description"
        class="event-description"
        placeholder="Description"
        rows="3"
        @input="autoResize"
      />
      <!-- <button @click="deleteEvent(event.id)">Delete Event</button> -->
    </div>
    <button @click="extendTimeline()">
      Submit changes and extend the timeline!
    </button>
  </div>
  <br />
  <!-- <button @click="addEvent()">Add new Event</button> -->
  <button v-if="events.length > 0" @click="generateTimeline()">
    Generate a new timeline!
  </button>
</template>

<style scoped>
/* Timeline container */
.timeline {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Event card with scroll look */
.event-card {
  background: #fdf5e6; /* parchment color */
  border: 2px solid #d4b483;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  font-family: "Papyrus", "Comic Sans MS", cursive, sans-serif;
  position: relative;
  overflow: visible; /* Changed from hidden to visible */
  min-height: fit-content; /* Allow card to expand */
  height: auto; /* Automatic height based on content */
}

/* Add scroll effect with pseudo-elements */
.event-card::before,
.event-card::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 15px;
  background: linear-gradient(to right, #fdf5e6 0%, #d4b483 50%, #fdf5e6 100%);
  border-radius: 50%;
}
.event-card::before {
  top: -10px;
}
.event-card::after {
  bottom: -10px;
}

/* Event header: title and date on same line */
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 1.1em;
}

/* Event description */
.event-description {
  font-size: 0.95em;
  line-height: 1.4;
}

/* Input styling */
input,
textarea {
  background: rgba(255, 248, 220, 0.6);
  height: auto;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: "Papyrus", "Comic Sans MS", cursive, sans-serif;
  font-size: 1em;
  color: #3e2723;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

input:focus,
textarea:focus {
  outline: none;
  background: rgba(255, 248, 220, 0.9);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(212, 175, 55, 0.2);
}

input:hover,
textarea:hover {
  background: rgba(255, 248, 220, 0.8);
}

input::placeholder,
textarea::placeholder {
  color: #9e8a6a;
  font-style: italic;
  opacity: 0.7;
}

/* Event title specific styling */
.event-title {
  font-weight: bold;
  font-size: 1.1em;
  flex: 1;
  margin-right: 15px;
  min-height: 40px; /* Minimum height */
  height: auto; /* Auto height */
  overflow: hidden; /* Hide scrollbars */
  resize: none; /* Prevent manual resizing */
  line-height: 1.4; /* Consistent line height */
}

/* Event date specific styling */
.event-date {
  min-width: 150px; /* Changed from width to min-width */
  max-width: 200px; /* Maximum width to prevent over-expansion */
  text-align: center;
  font-weight: 600;
  color: #6d4c41;
  min-height: 40px; /* Minimum height */
  height: auto; /* Auto height */
  overflow: hidden; /* Hide scrollbars */
  resize: none; /* Prevent manual resizing */
  line-height: 1.4; /* Consistent line height */
}

/* Event description specific styling */
.event-description {
  margin-top: 10px;
  min-height: 60px;
  resize: vertical; /* Allow manual vertical resizing */
  overflow-y: auto; /* Show scrollbar if content exceeds max-height */
  max-height: none; /* No maximum height restriction */
  height: auto; /* Auto-adjust height */
  line-height: 1.5; /* Improve readability */
}

/* Button styling */
button {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #8b6914 0%, #b8860b 50%, #8b6914 100%);
  border: 2px solid #d4af37;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: "Papyrus", "Comic Sans MS", cursive, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  margin: 10px 0;
}

button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

button:hover {
  background: linear-gradient(135deg, #b8860b 0%, #daa520 50%, #b8860b 100%);
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

button:hover::before {
  left: 100%;
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

button:focus {
  outline: 3px solid rgba(212, 175, 55, 0.5);
  outline-offset: 2px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  text-align: center;
  color: #ffd700;
  font-family: "Papyrus", "Comic Sans MS", cursive, sans-serif;
}

.loading-spinner p {
  margin-top: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

/* Spinner Animation */
.spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border: 8px solid rgba(255, 215, 0, 0.2);
  border-top: 8px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
