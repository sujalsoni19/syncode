import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createRoom, joinRoom } from "../controllers/room.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createRoom);

router.route("/room").post(joinRoom);

export default router;