// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvUwZm4ySLuam-LFQ3MEFjIc3TKBKRelk",
  authDomain: "remaik-987e9.firebaseapp.com",
  databaseURL: "https://remaik-987e9-default-rtdb.firebaseio.com",
  projectId: "remaik-987e9",
  storageBucket: "remaik-987e9.firebasestorage.app",
  messagingSenderId: "1065941433155",
  appId: "1:1065941433155:web:d8b47e2b3b8d678dc20df6",
  measurementId: "G-YDWPXFR873",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
