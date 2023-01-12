import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

dotenv.config();

export interface UserRequest extends Request {
  user?: UserPayload | undefined;
}
interface UserPayload {
  id: string;
}

const verifyIsLoggedIn = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["access_token"];

    try {
      const decoded = (await jwt.verify(
        token,
        process.env.JWT_SECRET as Secret
      )) as UserPayload;
      // assigning the req.user to the decoded token, it allow us to use user data after authorization
      req.user = decoded;
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }

  next();
};

export default verifyIsLoggedIn;
