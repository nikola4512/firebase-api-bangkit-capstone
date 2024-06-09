// const express = require("express");
// const { userPost } = require("./firebaseAuth.js");

import { express } from "express";
import { userPost } from "./firebaseAuth.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/post", (req, res) => {
  const post = {
    username: req.body.username,
    post: req.body.post,
  };

  const response = userPost(post);

  res.json(response);
});

app.listen(3000);
