import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKbZgh6rP1BerWXczW5de1IBNalKa4CyI",
  authDomain: "pragyanetra.firebaseapp.com",
  projectId: "pragyanetra",
  storageBucket: "pragyanetra.firebasestorage.app",
  messagingSenderId: "77189208122",
  appId: "1:77189208122:web:ab5344fd73a92b9096fd03"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };