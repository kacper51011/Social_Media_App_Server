import express from "express";
import { upload } from "../controllers/authControllers";
import {
  getPosts,
  getUserPosts,
  likeUnlikePost,
  commentPost,
  createPost,
  deletePost,
} from "../controllers/postsControllers";

const postRouter = express.Router();

postRouter.route("/likePost").patch(likeUnlikePost);
postRouter.route("/getPosts/:page").get(getPosts);
postRouter.route("/commentPost").post(commentPost);
postRouter.route("/getUserPosts/:id/:page").get(getUserPosts);
postRouter.route("/createPost").post(upload.single("postPhoto"), createPost);
postRouter.route("/deletePost").delete(deletePost);

export default postRouter;
