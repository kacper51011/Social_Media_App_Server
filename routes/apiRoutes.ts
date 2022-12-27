import express from "express";
import userRouter from "./userRoutes";
import postRouter from "./postsRoutes";

const app = express();

app.use("/user", userRouter);
app.use("/post", postRouter);

export default app;
