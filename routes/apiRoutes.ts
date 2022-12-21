import express from "express";

const app = express();

const postsRoutes = require("./postsRoutes");
app.use("/posts", postsRoutes);

const userRoutes = require("./userRoutes");
app.use("/users", userRoutes);

module.exports = app;
