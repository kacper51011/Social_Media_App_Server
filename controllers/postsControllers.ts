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
    if (!req.params.page)
      return res
        .status(400)
        .json({ status: "failed", message: "no page provided" });

    const take = 3;
    const count = await prisma.post.count();

    const results = await prisma.post.findMany({
      skip: +req.params.page * 3 - 3,
      take: take,
      include: { comments: true },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      posts: results,
      count: count,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page } = req.params;
    if (!page)
      return res
        .status(400)
        .json({ status: "failed", message: "no page provided" });

    const take = 3;

    const count = await prisma.post.count();

    const results = await prisma.post.findMany({
      skip: +req.params.page * 3 - 3,
      take: take,
      where: {
        userId: String(req.params.id),
      },
      include: { comments: true },
      orderBy: {
        createdAt: "desc",
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
    const { userId, description } = req.body;
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "failed", message: "Provide correct post photo" });
    }

    const validation = postSchema.safeParse({
      userId: userId,
      picturePath: req.file.filename,
      description: description,
    });
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
        picturePath: String(req.file.filename),
        description: String(description),
        job: String(user.job),
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

    return res.status(200).json({
      status: "succes",
      message: newPost,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: "something went wrong",
    });
  }
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
      likePost.likes = likePost.likes.filter((id) => id !== likeUser.id);
      likeUser.likedPostsIDs = likeUser.likedPostsIDs.filter(
        (id) => id !== likePost.id
      );

      const updatedPostLikes = await prisma.post.update({
        where: { id: likePost.id },
        data: { likes: likePost.likes },
      });
      const updatedUserLikes = await prisma.user.update({
        where: { id: likeUser.id },
        data: { likedPostsIDs: likeUser.likedPostsIDs },
      });
    } else {
      likePost.likes.push(likeUser.id);
      likeUser.likedPostsIDs.push(likePost.id);

      const updatedPostLikes = await prisma.post.update({
        where: { id: likePost.id },
        data: { likes: likePost.likes },
      });

      const updatedUserLikes = await prisma.user.update({
        where: { id: likeUser.id },
        data: { likedPostsIDs: likeUser.likedPostsIDs },
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
    const user = await prisma.user.findUnique({ where: { id: id } });

    const newComment = await prisma.comment.create({
      data: {
        userId: String(id),
        userFirstName: String(user?.firstName),
        userLastName: String(user?.lastName),
        userPhotoPicturePath: String(user?.picturePath),
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
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "success",
    });
  }
};
