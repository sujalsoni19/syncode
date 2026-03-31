import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import connectDB from "./db/index.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import socketManager from "./sockets/socketManager.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

socketManager(io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed", error);
  });
