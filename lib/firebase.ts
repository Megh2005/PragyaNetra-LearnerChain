import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCjwh-4DcZciPFffHqW-2eGK0u0h4Zk-aA",
  authDomain: "educ-a-thon-tjp.firebaseapp.com",
  projectId: "educ-a-thon-tjp",
  storageBucket: "educ-a-thon-tjp.firebasestorage.app",
  messagingSenderId: "567433192123",
  appId: "1:567433192123:web:6ac832bb14b6ecda66bf9e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };