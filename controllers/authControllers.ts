import { Request, Response, NextFunction } from "express";
import { userRegisterSchema } from "../schemas/authSchemas";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";

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
    console.log(req.file.path);

    // inputs check
    console.log(req.body);
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
        picturePath: String(req.file.path),
        location: String(location),
        job: String(job),
      },
    });

    res
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "10d",
      }
    );

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({
        status: "success",
        user: user,
      });
    next();
  } catch (err) {
    next(err);
  }
};
