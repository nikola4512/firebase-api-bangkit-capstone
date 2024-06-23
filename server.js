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
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";
import express from "express";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// const swaggerSpec = swaggerJSDoc(options);
const swaggerSpec = YAML.parse(fs.readFileSync("doc.yaml", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    status: "Success",
    message: "Welcome to SIBICARA API, documentation using Swagger.",
    repositoryUrl: "https://github.com/nikola4512/sibicara-firebase-api",
  });
});

// AUTHENTICATION AND AUTHORIZATION
app.post("/signup", async (req, res) => {
  let signupData = {
    name: req.body.name,
    birthDate: req.body.birthDate,
    gender: req.body.gender,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address,
  };
  const response = await emailSignup(signupData);
  if (response.statusCode === 201) {
    const user = { userId: response.userId };
    const accessToken = generateAccessToken(user);
    await storeAccessToken(accessToken);
    response.data.accessToken = accessToken;
  }
  res.status(response.statusCode);
  delete response.statusCode;
  delete response.userId;
  res.json(response);
});

app.post("/signin", async (req, res) => {
  let signinData = {
    email: req.body.email,
    password: req.body.password,
  };
  const response = await emailSignin(signinData);
  if (response.statusCode === 200) {
    const user = { userId: response.userId };
    const accessToken = generateAccessToken(user);
    await storeAccessToken(accessToken);
    response.data.accessToken = accessToken;
  }
  res.status(response.statusCode);
  delete response.statusCode;
  delete response.userId;
  res.json(response);
});

app.delete("/signout", authenticateToken, async (req, res) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    const result = await signout(token);
    res.json({
      status: "Success",
      message: "Signout success",
    });
  });
});

// FEATURE GET AND PUT USER DATA
app.get("/user", authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (!err) {
      const response = await getUserData(user.userId);
      res.status(response.statusCode);
      delete response.statusCode;
      res.json(response);
    } else {
      res.status(401);
      res.json({
        error: err,
      });
    }
  });
});

app.put("/user/update", authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (!err) {
      const response = await updateUserData(user.userId, req.body);
      res.status(response.statusCode);
      delete response.statusCode;
      res.json(response);
    } else {
      res.status(401);
      res.json({
        error: err,
      });
    }
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
  let token = req.headers.authorization;
  if (token === undefined) {
    return res.status(401).json({
      status: "Failed",
      message: "Can't find JWT token",
    });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: "Forbidden",
          message: "JWT token invalid",
        });
      } else {
        req.user = user;
        next();
      }
    });
  }
}

app.listen(port);

// Export the Express app as a Firebase Cloud Function
// export const webApp = functions.https.onRequest(app);
