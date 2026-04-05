import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import api from "../config/axios.js";
import { languageMap } from "../utils/languageMap.js";
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

const runCode = asyncHandler(async (req, res) => {
  const { language, code, stdin } = req.body;

  if (!language || !code) {
    throw new ApiError(400, "both fields are required");
  }

  const mappedLangauage = languageMap[language];

  if (!mappedLangauage) {
    throw new ApiError(400, "language not supported");
  }

  const response = await api.post("/execute", {
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    script: code,
    stdin: stdin || "",
    language: mappedLangauage,
    versionIndex: "0",
  });

  if (!response) {
    throw new ApiError(502, "something wrong while executing the code");
  }

  const data = {
    output: response.data.output,
    memory: response.data.memory,
    cpuTime: response.data.cpuTime,
  };

  res
    .status(200)
    .json(new ApiResponse(200, data, "code executed successfully"));
});

export { createRoom, joinRoom, runCode };
