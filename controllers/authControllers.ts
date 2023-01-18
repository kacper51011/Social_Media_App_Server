import { Request, Response, NextFunction } from "express";
import { userRegisterSchema } from "../schemas/authSchemas";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { UserRequest } from "../middlewares/verifyIsLoggedIn";

const prisma = new PrismaClient();
dotenv.config();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/assets");
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1000 * 1000 },
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, job, location, password } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "failed", message: "Provide correct profile photo" });
    }

    // inputs check

    const validation = userRegisterSchema.safeParse({
      firstName,
      lastName,
      email,
      job,
      location,
      password,
    });
    if (!validation.success) {
      return res.status(400).json({
        status: "failed",
        message: validation.error,
      });
    }

    // email already in database check
    let userExists = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (userExists) {
      return res.status(400).json({
        status: "failed",
        message: "Email already in use!",
      });
    }

    // creating user
    req.body.password = await bcrypt.hash(req.body.password, 12);
    const newUser = await prisma.user.create({
      data: {
        firstName: String(firstName),
        lastName: String(lastName),
        password: String(req.body.password),
        email: String(email),
        picturePath: String(req.file.filename),
        location: String(location),
        job: String(job),
      },
    });

    return res
      .status(201)

      .json({
        status: "success",
        message: "successfully registered, now log in!",
      });
    next();
  } catch (err) {
    next(console.log(err));
  }
};

// login

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // email and password input check

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Provide email and password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picturePath: true,
            job: true,
          },
        },
      },
    });

    // is user existing in database check

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Can`t find any user with that email",
      });
    }

    // is the password correct check

    const passwordValidation = await bcrypt.compare(password, user.password);
    if (!passwordValidation) {
      return res.status(400).json({
        status: "failed",
        message: "Uncorrect password",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: 90000000,
      }
    );

    res.status(200).cookie("access_token", token).json({
      status: "success",
      user: user,
    });
    next();
  } catch (err) {
    return next(err);
  }
};

export const logout = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "user logged out" });
  } catch (err) {
    return res.status(400).json({ message: "user can not log out" });
  }
};
