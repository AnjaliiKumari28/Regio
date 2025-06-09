import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseStorageConfig = {
  apiKey: import.meta.env.VITE_STORAGE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_STORAGE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_STORAGE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_STORAGE_APP_ID,
  measurementId: import.meta.env.VITE_STORAGE_MEASUREMENT_ID
};

const firebaseAuthConfig = {
  apiKey: import.meta.env.VITE_AUTH_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_PROJECT_ID,
  appId: import.meta.env.VITE_AUTH_APP_ID,
};

// Initialize Firebase Storage App
const storageApp = initializeApp(firebaseStorageConfig, 'storage');
const storage = getStorage(storageApp);

// Initialize Firebase Auth App
const authApp = initializeApp(firebaseAuthConfig, 'auth');
const auth = getAuth(authApp);
auth.useDeviceLanguage();

export { auth, storage };
