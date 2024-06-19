import { thirdPartyApi } from "./utils/callApi.js";
import {
  emailSignup,
  emailSignin,
  signout,
  storeAccessToken,
  getUserData,
  updateUserData,
} from "./utils/firebase.js";

import "dotenv/config";
import jwt from "jsonwebtoken";
import functions from "firebase-functions";
import express from "express";

const app = express();
app.use(express.json());

// const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SIBICARA API",
    documentation_url:
      "https://github.com/nikola4512/firebase-api-bangkit-capstone.git",
  });
});

// AUTHENTICATION AND AUTHORIZATION
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
  httpRequest.statusCode === 201 ? storeAccessToken(accessToken) : null;

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

app.delete("/signout", async (req, res) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];
  const result = await signout(token);
  res.json(result);
});

// FEATURE GET AND PUT USER DATA
app.get("/user", authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    const response = await getUserData(user.user_id);
    if (response.statusCode) {
      res.status = userData.statusCode;
      delete response.statusCode;
    }
    res.json(response);
  });
});

app.put("/user/update", authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    const response = await updateUserData(user.user_id, req.body);
    if (response.statusCode) {
      res.status = response.statusCode;
      delete response.statusCode;
    }
    res.json(response);
  });
});

// FEATURE QUIZ
app.get("/quiz/:material", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi(
    "GET",
    `/quiz/${req.params.material}?count=${req.query.count}`
  );
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data.data,
  });
});

// FEATURE LEARNING MATERIAL
app.post("/quiz/:material", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi(
    "POST",
    `/quiz/${req.params.material}`,
    req.body
  );
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data.data,
  });
});

app.get("/material/:material", authenticateToken, async (req, res) => {
  const response = await thirdPartyApi(
    "GET",
    `/material/${req.params.material}`
  );
  res.json({
    status: "Success",
    message: "Successfully get data",
    data: response.data.data,
  });
});

app.get(
  "/material/:material/:submaterial",
  authenticateToken,
  async (req, res) => {
    const response = await thirdPartyApi(
      "GET",
      `/material/${req.params.material}/${req.params.submaterial}`
    );
    res.json({
      status: "Success",
      message: "Successfully get data",
      data: response.data.data,
    });
  }
);

// HANDLE ANOTHER API
app.get("*", (req, res) => {
  res.status(404).send("404 Page Not Found");
});

// TOKEN FUNCTION
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7 days",
  });
}

function authenticateToken(req, res, next) {
  // authorization: Bearer TOKEN // header
  let token = req.headers.authorization.split(" ")[1];
  if (token == null) {
    return res.status(401).json({
      status: "Failed",
      message: "Cant find token in header",
    });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: "Forbidden",
          message: "Cannot authorization",
          error: err,
        });
      } else {
        req.user = user;
        next();
      }
    });
  }
}

// app.listen(port);

// Export the Express app as a Firebase Cloud Function
export const webApp = functions.https.onRequest(app);
