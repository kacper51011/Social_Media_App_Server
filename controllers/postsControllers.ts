import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { postSchema } from "../schemas/postsSchemas";

const prisma = new PrismaClient();

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const skip = Number(req.query.skip) | 0;
    const take = 10;

    const count = await prisma.post.count();

    const results = await prisma.post.findMany({
      skip: skip,
      take: take,
    });

    return res.status(200).json({
      posts: results,
      count: count,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: "something went wrong",
    });
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const skip = Number(req.query.skip) | 0;
    const take = 10;

    const count = await prisma.post.count();

    const results = await prisma.post.findMany({
      skip: skip,
      take: take,
      where: {
        userId: String(req.query.id),
      },
    });

    return res.status(200).json({
      posts: results,
      count: count,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: "something went wrong",
    });
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, description, picturePath, location } = req.body;
    const validation = postSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "failed",
        message: "Fullfil every field properly",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).send("unauthorized");
    const newPost = await prisma.post.create({
      data: {
        firstName: String(user.firstName),
        lastName: String(user.lastName),
        userPicturePath: String(user.picturePath),
        userId: String(userId),
        location: String(location),
        picturePath: String(picturePath),
        description: String(description),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        postsIds: {
          push: newPost.id,
        },
      },
    });

    return res.status(200).send("post created");
  } catch (err) {}
};

export const likeUnlikePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, postId } = req.body;

    const likeUser = await prisma.user.findUnique({ where: { id: userId } });
    const likePost = await prisma.post.findUnique({ where: { id: postId } });

    if (!likeUser || !likePost)
      return res.status(400).send("something went wrong!");

    if (likePost.likes.includes(likeUser.id)) {
      likePost.likes.filter((id) => id !== likeUser.id);

      const updatedPostLikes = await prisma.post.update({
        where: { id: likePost.id },
        data: { likes: likePost.likes },
      });
    } else {
      likePost.likes.push(likeUser.id);

      const updatedPostLikes = await prisma.post.update({
        where: { id: likePost.id },
        data: { likes: likePost.likes },
      });
    }
    return res.status(200).send("success");
  } catch (err) {
    return res.status(400).send("something went wrong");
  }
};

export const commentPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, postId, content } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        userId: String(id),
        postId: String(postId),
        content: String(content),
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: String(postId) },
      data: {
        commentsIds: {
          push: newComment.id,
        },
      },
    });
    return res.status(200).json({ data: newComment });
  } catch (err) {}
};
