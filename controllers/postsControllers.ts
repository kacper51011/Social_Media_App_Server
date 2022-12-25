import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const skip = Number(req.query.skip) | 0;
    const take = 10;

    const results = await prisma.post.findMany({
      skip: skip,
      take: take,
    });

    return res.status(200).json({
      posts: results,
    });
  } catch (err) {}
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const skip = Number(req.query.skip) | 0;
    const take = 10;

    const results = await prisma.post.findMany({
      skip: skip,
      take: take,
      where: {
        userId: String(req.query.id),
      },
    });

    return res.status(200).json({
      posts: results,
    });
  } catch (err) {}
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, content, picturePath } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (err) {}
};

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (err) {}
};

export const commentPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (err) {}
};
