// Define "require"
import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
import { thirdPartyApi } from "./callApi.js";
import { getUserData, updateUserData } from "./firebaseAuth.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to SIBICARA API, please read our URL below to use this API",
    documentation_url: "https://dicoding.com/",
  });
});

app.get("/quiz", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi("GET", "/quiz");
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data,
  });
});

app.get("/material", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi("GET", "/material");
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data,
  });
});

app.get("/material/:letter", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi("GET", `/material/${req.params.letter}`);
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data,
  });
});

app.get("/user", (req, res) => {
  try {
    try {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        const userData = getUserData(user.user_id);
        console.log({
          userData: userData,
          error: err,
        });
        // res.json({
        //   status: "Success",
        //   message: "Get user data success",
        //   error: err,
        //   data: userData,
        // });
      });
    } catch (error) {
      res.status(403);
      res.json({
        status: "Failed",
        message: "Can't authenticate access",
        error: error,
        data: null,
      });
    }
  } catch (error) {
    res.json({
      status: "Failed",
      message: "Can't get user data",
      error: error,
      data: null,
    });
  }
});

app.patch("/user/:userid/change", (req, res) => {});

app.post("/analyzes", (req, res) => {});

app.get("*", (req, res) => {
  res.status(404).send("404 Page Not Found");
});

function authenticateToken(req, res, next) {
  // authorization: Bearer TOKEN // header
  let token = req.headers.authorization.split(" ")[1];
  if (token == null) {
    return res.status(401).json({
      status: "Failed",
      message: "Can't find authorization in request header",
      error: null,
      data: null,
    });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: "Failed",
          message: "Forbiden, authorization invalid",
          error: err,
          data: null,
        });
      } else {
        req.user = user;
        next();
      }
    });
  }
}

app.listen(3000);
