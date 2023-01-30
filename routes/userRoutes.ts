import express from "express";
import verifyIsLoggedIn from "../middlewares/verifyIsLoggedIn";
import {
  register,
  login,
  upload,
  logout,
} from "../controllers/authControllers";
import {
  followUnfollow,
  getAuthorizedUser,
  getUser,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePhoto"), register);
userRouter.route("/login").post(login);

userRouter.use(verifyIsLoggedIn);
userRouter.route("/checkIsVerified").get(getAuthorizedUser);
userRouter.route("/logout").delete(logout);

userRouter.route("/follow").patch(followUnfollow);
userRouter.route("/getUser/:id").get(getUser);

export default userRouter;
