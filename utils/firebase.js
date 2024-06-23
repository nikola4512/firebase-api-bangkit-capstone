// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBh-IDQKOcy7y_CrwAiPbomNvKN_JoOMWE",
  authDomain: "capstone-1-424914.firebaseapp.com",
  databaseURL:
    "https://capstone-1-424914-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "capstone-1-424914",
  storageBucket: "capstone-1-424914.appspot.com",
  messagingSenderId: "867581057691",
  appId: "1:867581057691:web:e3356b508161c9a530043e",
  measurementId: "G-L4HFBFWL02",
};

const app = initializeApp(firebaseConfig);

const emailSignup = async (userData) => {
  const auth = getAuth();
  const db = getFirestore();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    const user = userCredential.user;
    try {
      delete userData.password;
      await setDoc(doc(db, "users", user.uid), userData);
      const result = {
        statusCode: 201,
        status: "Success",
        message: "Signup successful",
        userId: user.uid,
        data: {},
      };
      return result;
    } catch (error) {
      const result = {
        statusCode: 500,
        status: "Failed",
        message: "Error writing document",
        error: error,
      };
      return result;
    }
  } catch (error) {
    const result = {
      statusCode: 400,
      status: "Failed",
      message: "Email Already Exists",
    };
    return result;
  }
};

const emailSignin = async (userData) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    const user = userCredential.user;
    const response = {
      statusCode: 200,
      status: "Success",
      message: "Signin success",
      userId: user.uid,
      data: {},
    };
    return response;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      const result = {
        statusCode: 401,
        status: "Failed",
        message: "Incorrect email or password",
      };
      return result;
    }
  }
};

const signout = async (token) => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "access_token"));
  snapshot.forEach((doc) => {
    if (doc.data().token === token) {
      const documentId = doc.id;
      deleteAccessToken(documentId);
    }
  });
};

const getUserData = async (userId) => {
  try {
    const db = getFirestore();
    const userData = await getDoc(doc(db, "users", userId));
    return {
      statusCode: 200,
      status: "Success",
      message: "Get user data success",
      data: userData.data(),
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "Failed",
      message: "Get user data failed",
      error: error,
    };
  }
};

const updateUserData = async (userId, userData) => {
  try {
    const db = getFirestore();
    console.log(userId);
    await updateDoc(doc(db, "users", userId), userData);
    return {
      statusCode: 200,
      status: "Success",
      message: "Update user data success",
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "Failed",
      message: "Update user data failed",
      error: error,
    };
  }
};

const storeAccessToken = async (token) => {
  const db = getFirestore();
  const currentDate = new Date();
  await addDoc(collection(db, "access_token"), {
    token: token,
    created: currentDate,
  });
};

const deleteAccessToken = async (documentId) => {
  const db = getFirestore();
  await deleteDoc(doc(db, "access_token", documentId));
};

export {
  emailSignup,
  emailSignin,
  signout,
  storeAccessToken,
  deleteAccessToken,
  getUserData,
  updateUserData,
};
