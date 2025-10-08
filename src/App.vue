<template>
  <div id="app">
    <header class="top-bar">
      <div class="logo">RemAIk</div>
      <div class="welcome-text">Welcome to RemAIk!</div>

      <div v-if="user && user.uid">
        <span>Welcome, {{ user.email }}!</span>
        <button @click="logout">Log Out</button>
      </div>
      <div v-else>
        <button @click="openSignup">Sign Up</button>
        <button @click="openLogin">Log In</button>
      </div>
    </header>
    <main>
      <AuthPopup ref="popup" />
      <!-- <p v-if="user">{{ user.email }}</p> -->
      <TimeLine />
    </main>
  </div>
</template>

<script setup>
import AuthPopup from "./components/AuthPopup.vue";
import TimeLine from "./components/TimeLine.vue";
import { ref, provide } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { log } from "./utils/logger.js";
import { auth } from "./utils/firebase.js";

const popup = ref(null);
const openSignup = () => {
  popup.value.isSignUp = true;
  popup.value.openPopup();
};
const openLogin = () => {
  popup.value.isSignUp = false;
  popup.value.openPopup();
};
const logout = () => {
  auth.signOut().then(() => {
    log("User tried to sign out");
  });
};

const user = ref(null);
provide("user", user);

onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    user.value = firebaseUser;
    log("User logged in:", user.value.email);
  } else {
    user.value = null;
    log("User logged out");
  }
});
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
