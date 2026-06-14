import { initializeApp } from "firebase/app";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqX8ELKKZXgwSsRXotfWt0gmfG1EUnubM",
  authDomain: "ak-project-caace.firebaseapp.com",
  projectId: "ak-project-caace",
  storageBucket: "ak-project-caace.firebasestorage.app",
  messagingSenderId: "116538745274",
  appId: "1:116538745274:web:612d0663990e75a73f3d83",
  measurementId: "G-G1XHRDRMCC",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export default app;