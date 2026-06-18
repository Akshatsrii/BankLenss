import { initializeApp } from "firebase/app";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";



const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// if (window.location.hostname === "localhost") {
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
// }

if (false) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export default app;