// Define "require"
import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
import {
  emailSignup,
  emailSignin,
  signout,
  storeAccessToken,
} from "./firebaseAuth.js";
const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  let signupData = {
    name: req.body.name,
    birth_date: req.body.birth_date,
    gender: req.body.gender,
    phone_number: req.body.phone_number,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address,
  };
  const httpRequest = await emailSignup(signupData);
  const user = { user_id: httpRequest.user_id };
  const accessToken = generateAccessToken(user);
  httpRequest.statusCode === 200 ? storeAccessToken(accessToken) : null;

  res.status(httpRequest.statusCode);
  res.json({
    status: httpRequest.status,
    message: httpRequest.message,
    error: httpRequest.error,
    data: {
      user_id: httpRequest.user_id,
      accessToken: accessToken,
    },
  });
});

app.post("/signin", async (req, res) => {
  let signinData = {
    email: req.body.email,
    password: req.body.password,
  };
  const httpRequest = await emailSignin(signinData);
  const user = { user_id: httpRequest.user_id };
  const accessToken = generateAccessToken(user);
  httpRequest.statusCode === 200 ? storeAccessToken(accessToken) : null;

  res.status(httpRequest.statusCode);
  res.json({
    status: httpRequest.status,
    message: httpRequest.message,
    error: httpRequest.error,
    data: {
      user_id: httpRequest.user_id,
      accessToken: accessToken,
    },
  });
});

app.delete("/signout", (req, res) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];
  signout(token);
  res.json({
    status: "Success",
    message: "Signout complete",
    error: null,
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7 days",
  });
}

app.listen(4000);
