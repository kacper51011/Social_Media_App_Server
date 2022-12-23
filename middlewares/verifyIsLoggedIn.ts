import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

dotenv.config();

interface UserRequest extends Request {
  user?: JwtPayload;
}

const verifyIsLoggedIn = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(403).send("access denied");
    const key = process.env.JWT_SECRET;
    if (!key) return res.status(500).send("server error");
    try {
      const decoded = await jwt.verify(token, key as Secret);
      // assigning the req.user to the decoded token, it allow us to use user data after authorization
      const { decodedInfo } = decoded as JwtPayload;
      req.user = decodedInfo;
    } catch (err) {
      next(err);
    }
  } catch (err) {
    return next(err);
  }

  next();
};

export default verifyIsLoggedIn;
