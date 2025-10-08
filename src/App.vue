<template>
  <div id="app">
    <header class="top-bar">
      <div class="logo">RemAIk</div>
      <div class="welcome-text">Welcome to RemAIk!</div>
      <button @click="openSignup">Sign Up</button>
      <button @click="openLogin">Log In</button>
    </header>
    <main>
      <AuthPopup ref="popup" />
    </main>
  </div>
</template>

<script setup>
import AuthPopup from "./components/AuthPopup.vue";
import { ref } from "vue";

const popup = ref(null);
const openSignup = () => {
  popup.value.isSignUp = true;
  popup.value.openPopup();
};
const openLogin = () => {
  popup.value.isSignUp = false;
  popup.value.openPopup();
};
</script>

<style>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #2b2d42;
  color: white;
}
.logo {
  font-weight: bold;
  font-size: 1.5rem;
}
.welcome-text {
  margin-left: 1rem;
  flex-grow: 1;
}
</style>
