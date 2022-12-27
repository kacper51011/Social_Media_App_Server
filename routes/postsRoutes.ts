import express from "express";
import {
  getPosts,
  getUserPosts,
  likeUnlikePost,
  commentPost,
} from "../controllers/postsControllers";
import verifyIsLoggedIn from "../middlewares/verifyIsLoggedIn";

const postRouter = express.Router();

postRouter.use("/likePost", likeUnlikePost);
postRouter.use("/getPosts", getPosts);
postRouter.use("/commentPost", commentPost);
postRouter.use("/getUserPosts", getUserPosts);

export default postRouter;
