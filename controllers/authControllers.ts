import { Request, Response, NextFunction } from "express";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

interface IJWT {
  id: string;
  email: string;
  nickname: string;
  photo: string;
}

interface UserRequest extends Request {
  user: IJWT | undefined;
}

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nickname, email, password, confirmPassword } = req.body;

    // inputs check
    if (!(nickname && email && password)) {
      return res.status(400).json({
        status: "failed",
        message: "Provide all inputs!",
      });
    }
    // email already in database check
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "failed",
        message: "email already in use!",
      });
    }

    // nickname already in database check
    userExists = await User.findOne({ nickname });
    if (userExists) {
      return res.status(400).json({
        status: "failed",
        message: "nickname already in use!",
      });
    }
    // confirm password === password check
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "failed",
        message: "passwords do not match!",
      });
    }
    const newUser = await User.create(req.body);

    const token = jwt.sign(
      { id: newUser._id, nickname: newUser.nickname, email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({
        status: "success",
        message: "successfully registered, now log in!",
      });
    next();
  } catch (err) {
    next(console.log(err));
  }
};
