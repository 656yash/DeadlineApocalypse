import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAk_lZSwp6d3GdvpxUX5rMfWdyrsoyC5Zc",
  authDomain: "adwise-4e978.firebaseapp.com",
  projectId: "adwise-4e978",
  storageBucket: "adwise-4e978.firebasestorage.app",
  messagingSenderId: "455694870731",
  appId: "1:455694870731:web:0a4ea7019ce604df49534e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
