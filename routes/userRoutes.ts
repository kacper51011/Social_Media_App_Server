import express from "express";
import verifyIsLoggedIn from "../middlewares/verifyIsLoggedIn";
import { register, login } from "../controllers/authControllers";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);

export default userRouter;
