// app/utils/firebaseClient.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (typeof window !== "undefined") {
  // DEBUG: quitar luego
  console.log("[firebaseConfig] apiKey:", firebaseConfig.apiKey);
  if (!firebaseConfig.apiKey) {
    console.error(
      "[Firebase] apiKey VACÍA en el cliente. Revisa NEXT_PUBLIC_FIREBASE_API_KEY en .env.local"
    );
  }
}

// Evitar inicializar más de una vez en Next
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutFirebase() {
  await signOut(auth);
}

export type FirebaseUser = User;
