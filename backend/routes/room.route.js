import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  runCode,
} from "../controllers/room.controller.js";
import { runCodeLimiter } from "../middlewares/runCodeLimiter.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createRoom);

router.route("/room").post(joinRoom);

router.route("/room/:roomId/run").post(runCodeLimiter, runCode);

export default router;
