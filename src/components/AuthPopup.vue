<template>
  <div id="AuthPopup" v-if="visible" @click.self="closePopup">
    <div class="popup-box">
      <button class="close-button" @click="closePopup" aria-label="Close popup">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h2>{{ isSignUp ? "Create Account" : "Login" }}</h2>
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button v-if="isSignUp" @click="signUp">Create Account</button>
      <button v-if="!isSignUp" @click="login">Log In</button>
      <button @click="isSignUp = !isSignUp">
        {{
          isSignUp
            ? "Already have an account? Log in here!"
            : "Don't have an account? Create one here!"
        }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, defineExpose } from "vue";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../utils/firebase.js";
import { log, warn, serror } from "../utils/logger.js";

const email = ref("");
const password = ref("");
const visible = ref(false);
const isSignUp = ref(false);

function openPopup() {
  visible.value = true;
}

function closePopup() {
  visible.value = false;
}

// const auth = getAuth(app);

const signUp = () => {
  if (!email.value || !password.value) {
    alert("Email and password must be provided");
    return;
  }
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      closePopup();
      log(userCredential);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode + errorMessage);
      serror(errorCode);
      serror(errorMessage);
    });
};

const login = () => {
  if (!email.value || !password.value) {
    alert("Email and password must be provided");
    return;
  }
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      closePopup();
      log(userCredential);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      log(errorCode);
      log(errorMessage);
      warn(errorCode);
      warn(errorMessage);
      serror(errorCode);
      serror(errorMessage);
    });
};

defineExpose({ openPopup, closePopup, visible, isSignUp });
</script>
<style>
#AuthPopup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* stays above other elements */
  transition: opacity 0.2s ease-in-out;
}

/* Inner popup box */
#AuthPopup .popup-box {
  background: #fff;
  color: #222;
  padding: 1.75rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  position: relative;
}

/* Close button styling */
#AuthPopup .close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  z-index: 1;
}

#AuthPopup .close-button:hover {
  background-color: #e0e0e0;
  color: #333;
  transform: scale(1.05);
}

#AuthPopup .close-button:active {
  transform: scale(0.95);
}

#AuthPopup .close-button svg {
  width: 16px;
  height: 16px;
}

/* Input styling */
#AuthPopup input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
}

/* Button styling (excluding close button) */
#AuthPopup button:not(.close-button) {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #1976d2;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

#AuthPopup button:not(.close-button):hover {
  background-color: #1565c0;
}
</style>
