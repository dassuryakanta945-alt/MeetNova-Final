import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCr77yHNzXwpJ9X1bEwnccDCXsulon4JN8",
  authDomain: "meetnova-9a907.firebaseapp.com",
  databaseURL: "https://meetnova-9a907-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "meetnova-9a907",
  storageBucket: "meetnova-9a907.firebasestorage.app",
  messagingSenderId: "98114874829",
  appId: "1:98114874829:web:af87541c2987c5cef2e884",
  measurementId: "G-8172F2DCGZ"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb };