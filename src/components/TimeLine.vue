<script setup>
import { ref } from "vue";

const events = ref([]);

let idCounter = 0;

const generateTimeline = () => {
  
  
    events.value.push({
    id: idCounter++,
    title: `Event ${idCounter}`,
    description: "This is a description for the event.",
    date: "2024-01-01",
  });
};
</script>

<template>
  <button v-if="events.length == 0" @click="generateTimeline">
    Generate the timeline
  </button>

  <div v-if="events.length > 0" class="timeline">
    <div v-for="event in events" :key="event.id" class="event-card">
      <div class="event-header">
        <span class="event-title">{{ event.title }}</span>
        <span class="event-date">{{ event.date }}</span>
      </div>
      <div class="event-description">{{ event.description }}</div>
    </div>
  </div>
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
  overflow: hidden;
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
</style>
