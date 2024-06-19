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
      const httpResponse = {
        statusCode: 201,
        status: "Success",
        message: "Signup successful",
        user_id: user.uid,
        error: null,
      };
      return httpResponse;
    } catch (error) {
      const httpResponse = {
        statusCode: 500,
        status: "Failed",
        message: "Error writing document",
        error: error,
      };
      return httpResponse;
    }
  } catch (error) {
    const httpResponse = {
      statusCode: 400,
      status: "Failed",
      message: "Email address Already Exists",
      error: error,
    };
    return httpResponse;
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
    const httpResponse = {
      statusCode: 200,
      status: "Success",
      message: "Signin success",
      user_id: user.uid,
      error: null,
    };
    // console.log(httpResponse); //
    return httpResponse;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      const httpResponse = {
        statusCode: 400,
        status: "Failed",
        message: "Incorrect Email or Password",
        error: null,
      };
      return httpResponse;
    } else {
      const httpResponse = {
        statusCode: 400,
        status: "Failed",
        message: "Account does not Exist",
        error: null,
      };
      return httpResponse;
    }
  }
};

const signout = async (token) => {
  try {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, "access_token"));
    snapshot.forEach((doc) => {
      if (doc.data().token === token) {
        const documentId = doc.id;
        deleteAccessToken(documentId);
      }
    });
    return {
      status: "Success",
      message: "Signout complete",
      error: null,
    };
  } catch (error) {
    return {
      status: "Failed",
      message: "Signout failed",
      error: error,
    };
  }
};

const storeAccessToken = async (token) => {
  const db = getFirestore();
  try {
    const currentDate = new Date();
    await addDoc(collection(db, "access_token"), {
      token: token,
      created: currentDate,
    });
    return {
      statusCode: 201,
      status: "Success",
      message: "The token already stored",
      error: null,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "Failed",
      message: "Failed to store token",
      error: error,
    };
  }
};

const deleteAccessToken = async (documentId) => {
  const db = getFirestore();
  await deleteDoc(doc(db, "access_token", documentId));
};

const getUserData = async (userId) => {
  try {
    try {
      const db = getFirestore();
      const userData = await getDoc(doc(db, "users", userId));
      // console.log(userData.data());
      return {
        status: "Success",
        message: "Get user data success",
        data: userData.data(),
      };
    } catch (error) {
      return {
        statusCode: 403,
        status: "Forbidden",
        message: "Can't authenticate access",
        error: error,
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      status: "Failed",
      message: "Can't get user data",
      error: error,
    };
  }
};

const updateUserData = async (userId, userData) => {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, "users", userId), userData);
    return {
      status: "Success",
      message: "Update user data success",
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "Failed",
      message: "Cannot update user data",
      error: error,
    };
  }
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
