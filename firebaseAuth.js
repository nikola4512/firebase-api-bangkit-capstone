// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDurUFIOsBc0Qqzrnh_KLUuWToEZ-lLvbE",
  authDomain: "test-d12ec.firebaseapp.com",
  databaseURL: "https://test-d12ec-default-rtdb.firebaseio.com",
  projectId: "test-d12ec",
  storageBucket: "test-d12ec.appspot.com",
  messagingSenderId: "266859066579",
  appId: "1:266859066579:web:f432d728d91d8f7b009026",
  measurementId: "G-HCSJFB2FBE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function emailSignup(userData) {
  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
      const user = userCredential.user;
      try {
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData);
        const httpResponse = {
          statusCode: 201,
          status: "Success",
          message: "Signup successful",
        };
        return httpResponse;
      } catch (error) {
        const httpResponse = {
          statusCode: 500,
          status: "Failed",
          message: "Error writing document",
        };
        return httpResponse;
      }
    })
    .catch((error) => {
      const httpResponse = {
        statusCode: 400,
        status: "Failed",
        message: "Address Already Exists",
      };
      return httpResponse;
    });
}

function emailSignin(userData) {
  const email = userData.email;
  const password = userData.password;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "homepage.html";
    })
    .catch((error) => {
      const errorCode = error.code;
    });
}

function userPost(post) {
  const db = getFirestore();
  setDoc(doc(db, "posts"))
    .then(() => {
      return { status: "Success", error: null };
    })
    .catch((error) => {
      return { status: "Failed", error: error };
    });
}

module.exports = { emailSignup, emailSignin, userPost };
