import { createApp } from "vue";
import App from "./App.vue";

import { VueFire, VueFireDatabaseOptionsAPI } from "vuefire";
import { firebaseApp } from "./utils/firebase.js";

const app = createApp(App);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireDatabaseOptionsAPI()],
});
app.mount("#app");
