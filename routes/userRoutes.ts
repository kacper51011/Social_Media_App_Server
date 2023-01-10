import express from "express";
import verifyIsLoggedIn from "../middlewares/verifyIsLoggedIn";
import { register, login, upload } from "../controllers/authControllers";
import { followUnfollow } from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePhoto"), register);
userRouter.route("/login").post(login);

userRouter.route("/follow").patch(followUnfollow);

export default userRouter;
