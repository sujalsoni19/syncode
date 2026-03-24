import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./db/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("mongodb connection failed", error);
  });
