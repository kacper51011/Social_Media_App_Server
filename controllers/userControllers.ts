import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) return res.status(400).send("couldn`t find the user");

    return res.status(200).json({
      user: user,
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

export const getUserFollows = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) return res.status(400).send("couldn`t find the user");

    const followedByUser = await Promise.all(
      user.followingIDs.map((follow) =>
        prisma.user.findUnique({ where: { id: follow } })
      )
    );
  } catch {}
};
