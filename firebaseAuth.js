// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  // DISESUAIN AJA INI DENGAN YG ADA DI FIREBASE
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
  const db = getFirestore();

  let deleteDocumentId = null;
  const querySnapshot = await getDocs(collection(db, "access_token"));
  querySnapshot.forEach((doc) => {
    if (doc.data().token === token) {
      deleteDocumentId = doc.id;
      deleteAccessToken(deleteDocumentId);
    }
  });
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

const deleteAccessToken = async (deleteDocumentId) => {
  const db = getFirestore();
  await deleteDoc(doc(db, "access_token", deleteDocumentId));
  // await db.collection("access_token").doc(deleteDocumentId).delete(); //
};

// DIBAWAH INI BELUM KELAR
const getUserData = async (userId) => {
  const db = getFirestore();
  // let userData = null;
  // const snapshot = await getDocs(collection(db, "users"));
  // console.log(snapshot);
  // snapshot.forEach((doc) => {
  //   doc.id === userId ? (userData = doc.data()) : null;
  // });
  return userData;
};

const updateUserData = async (userId, userData) => {
  const db = getFirestore();
  await updateDoc(doc(db, "users", userId, { userData }));
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
