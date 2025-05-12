import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    // Fallback or throw error, depending on how critical Firebase is at this point
    // For now, we'll let it proceed, and other parts of the app might fail if Firebase is needed.
  }
} else {
  app = getApp();
}

// Ensure app is initialized before getting other services
if (app!) {
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Handle the case where app initialization failed
  // This is a simplified handler; a real app might have more robust error recovery or reporting
  console.error("Firebase app not initialized. Auth and Firestore will not be available.");
  // Assign dummy objects or throw to prevent further execution if Firebase is critical
  // For example purposes, we'll let it be, but auth and db would be undefined.
}


export { app, auth, db };
