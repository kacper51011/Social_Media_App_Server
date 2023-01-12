import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserRequest } from "../middlewares/verifyIsLoggedIn";

const prisma = new PrismaClient();

export const getAuthorizedUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return next();
    const id = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) return res.status(400).send("couldn`t find the user");

    return res.status(200).json({
      user: user,
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// todo: change the message data
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

// export const getUserFollows = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const id = req.params.id;
//     const user = await prisma.user.findUnique({ where: { id: id } });

//     if (!user) return res.status(400).send("couldn`t find the user");

//     // todo

//     const followedByUser = await Promise.all(
//       user.followingIDs.map((follow) =>
//         prisma.user.findUnique({ where: { id: follow } })
//       )
//     );
//   } catch {}
// };

export const followUnfollow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userToFollowId } = req.body;

    // finding both users
    const user = await prisma.user.findUnique({ where: { id: id } });
    const userToFollow = await prisma.user.findUnique({
      where: { id: userToFollowId },
    });

    if (!user || !userToFollow)
      return res.status(400).send("something went wrong");

    // checking if the first user follow second user (at first if he does)
    if (user.followingIDs.includes(userToFollowId) && userToFollow) {
      user.followingIDs = user.followingIDs.filter(
        (id) => id !== userToFollowId
      );
      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          followingIDs: user.followingIDs,
        },
      });

      userToFollow.followedByIDs = userToFollow?.followedByIDs.filter(
        (followedByid) => followedByid !== id
      );
      const updatedSecondUser = await prisma.user.update({
        where: {
          id: userToFollowId,
        },
        data: {
          followedByIDs: userToFollow.followedByIDs,
        },
      });

      // if he dont follow
    } else if (user && userToFollow) {
      // updating first user follows
      user.followingIDs.push(userToFollowId);
      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          followingIDs: user.followingIDs,
        },
      });

      //  updating second user follows
      userToFollow.followedByIDs.push(id);
      const updatedSecondUser = await prisma.user.update({
        where: {
          id: userToFollowId,
        },
        data: {
          followedByIDs: userToFollow.followedByIDs,
        },
      });
    }

    return res.status(200).send("success");
  } catch (err) {
    return res.status(400).send("there was a problem, can`t follow/unfollow");
  }
};
