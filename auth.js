import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { getHeapSnapshot } from "v8";
// Determine the service account to use
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: parse JSON from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("test" + serviceAccount);
} else {
  // Development: load local JSON file
  const filePath = path.resolve(
    "/home/caten/cpeg470/remaik/remaik-987e9-firebase-adminsdk-fbsvc-15b9f8c6b9.json"
  );
  serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log("test2" + serviceAccount);
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://remaik-987e9-default-rtdb.firebaseio.com",
});

const db = admin.database();

export async function verifyFirebaseToken(req, res, next) {
  console.log(`Recieved request to verify firebase.
    req: ${req}
    res: ${res}`);
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function updateDatabase(path, key, data) {
  await db.ref(path).update({
    [key]: data,
  });
}

export async function replaceDatabase(path, key, data) {
  console.log(`replacing database at ${path} with ${key}:${data}`);
  await db.ref(path).set({
    [key]: data,
  });
}

export async function addToDatabase(path, data) {
  console.log(`adding to database at ${path} with ${data}`);
  // let snapshot = await onceDatabase(path + "/Timeline");

  // data.forEach((event) => {
  //   snapshot.get("Timeline", []).push(event);
  // });
  // data = JSON.parse(JSON.stringify(snapshot) + JSON.stringify(data));
  await db.ref(path).push(data);
}

export async function onceDatabase(path) {
  try {
    const snapshot = await db.ref(path).once("value");
    if (snapshot.exists()) {
      console.log(`Database path: ${path} returned ${snapshot.val()}`);
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error reading database:", error);
    throw error;
  }
}
