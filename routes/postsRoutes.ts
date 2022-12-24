import express from "express";
import {
  getPosts,
  getUserPosts,
  likePost,
  commentPost,
} from "../controllers/postsControllers";
import verifyIsLoggedIn from "../middlewares/verifyIsLoggedIn";

const router = express.Router();
