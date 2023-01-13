import express from "express";
import { upload } from "../controllers/authControllers";
import {
  getPosts,
  getUserPosts,
  likeUnlikePost,
  commentPost,
  createPost,
} from "../controllers/postsControllers";

const postRouter = express.Router();

postRouter.route("/likePost").post(likeUnlikePost);
postRouter.route("/getPosts").get(getPosts);
postRouter.route("/commentPost").post(commentPost);
postRouter.route("/getUserPosts").get(getUserPosts);
postRouter.route("/createPost").post(upload.single("postPhoto"), createPost);

export default postRouter;
