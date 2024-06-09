require("dotenv").config();

const jwt = require("jsonwebtoken");
const express = require("express");

const app = express();
app.use(express.json());

app.post("/signup", (req, res) => {
  const user = { email: req.body.email };
  const accessToken = generateAccessToken(user);

  // ganti dengan push accessToken ke firestore

  let signupData = {
    username: req.body.username,
    email: req.body.username,
    password: req.body.password,
  };

  httpRequest = emailSignup(signupData);

  res.statusCode(httpRequest.statusCode);
  res.json({
    status: httpRequest.status,
    message: httpRequest.message,
    data: {
      accessToken: accessToken,
    },
  });
});

app.post("/signin", (req, res) => {
  const user = { email: req.body.email };
  const accessToken = generateAccessToken(user);

  // ganti dengan push accessToken ke firestore

  let signinData = {
    email: req.body.email,
    password: req.body.password,
  };

  httpRequest = emailSignin(signinData);

  res.statusCode(httpRequest.statusCode);
  res.json({
    status: httpRequest.status,
    message: httpRequest.message,
    data: {
      accessToken: accessToken,
    },
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

function authenticateToken(req, res, next) {
  // authorization: Bearer TOKEN // example auth header
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    // console.log(user);
    req.user = user;
    next();
  });
}

app.listen(4000);
