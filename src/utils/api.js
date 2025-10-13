import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
});

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    api.interceptors.request.use(async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  } else {
    console.log("No user signed in yet");
  }
});

export default api;
