import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  runCode,
  getRoomsDetails,
  getRoomDetails
} from "../controllers/room.controller.js";
import { runCodeLimiter } from "../middlewares/runCodeLimiter.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createRoom);

router.route("/room").post(joinRoom);

router.route("/room/:roomId/run").post(runCodeLimiter, runCode);

router.route("/").get(verifyJWT, getRoomsDetails);

router.route("/room/:roomId").get(getRoomDetails);

export default router;
