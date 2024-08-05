// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSz5qMYbjI2pl0UtDwFkdhWfJb3J6C4ZM",
  authDomain: "pantry-b1ee8.firebaseapp.com",
  projectId: "pantry-b1ee8",
  storageBucket: "pantry-b1ee8.appspot.com",
  messagingSenderId: "199131724471",
  appId: "1:199131724471:web:4e276d2a20e0d07fb32b32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export{app, firestore}