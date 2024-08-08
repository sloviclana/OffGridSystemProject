// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWzJYkZFyM0L9wZYpoOnF0KMJ-bEMyOcw",
  authDomain: "frontend-9d028.firebaseapp.com",
  projectId: "frontend-9d028",
  storageBucket: "frontend-9d028.appspot.com",
  messagingSenderId: "94836031558",
  appId: "1:94836031558:web:3c24fb92ab0a86c9820a47",
  measurementId: "G-XGLT7NM4EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// gives us an auth instance
const auth = getAuth(app);

// in order to use this auth instance elsewhere
export default auth;