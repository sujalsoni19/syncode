import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import { Room } from "../models/room.model.js";

const createRoom = asyncHandler(async (req, res) => {
  let roomId;
  let existingRoom;

  do {
    roomId = crypto.randomBytes(4).toString("hex");
    existingRoom = await Room.findOne({ roomId });
  } while (existingRoom);

  const room = await Room.create({
    roomId,
    ownerId: req.user._id,
  });

  if (!room) {
    throw new ApiError(500, "Something went wrong while creating room");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, room, "Room created successfully"));
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    throw new ApiError(400, "roomId is required");
  }

  const room = await Room.findOne({ roomId, isActive: true }).populate(
    "ownerId",
    "username fullname",
  );

  if (!room) {
    throw new ApiError(404, "room not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "room joined successfully"));
});

export { createRoom, joinRoom };
