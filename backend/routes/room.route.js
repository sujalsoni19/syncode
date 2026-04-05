import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  runCode,
} from "../controllers/room.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createRoom);

router.route("/room").post(joinRoom);

router.route("/room/:roomId/run").post(runCode);

export default router;
