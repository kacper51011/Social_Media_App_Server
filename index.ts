import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import apiRoutes from "./routes/apiRoutes";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(morgan("common"));

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// route

app.use("/api", apiRoutes);

// setting up server

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log("new server started");
});
