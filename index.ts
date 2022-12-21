import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { createBrotliCompress } from "zlib";
const helmet = require("helmet");
// configs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// storage

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/assets");
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});
