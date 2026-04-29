import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import api from "../config/axios.js";
import { languageMap } from "../utils/languageMap.js";
import { Room } from "../models/room.model.js";
import { getIO } from "../sockets/io.js";

import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const runLocalCode = async (language, code, stdin = "") => {
  if (!code || code.length > 20000) {
    throw new Error("Code too large");
  }

  const bannedPatterns = [
    "require('fs')",
    'require("fs")',
    "child_process",
    "process.env",
    "worker_threads",
    "cluster",
  ];

  for (const pattern of bannedPatterns) {
    if (code.includes(pattern)) {
      throw new Error("Unsafe code detected");
    }
  }

  const ext = language === "typescript" ? "ts" : "js";

  const tempDir = path.join(process.cwd(), "temp");
  await fs.mkdir(tempDir, { recursive: true });

  const fileName = `script-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const filePath = path.join(tempDir, fileName);

  await fs.writeFile(filePath, code);

  return new Promise((resolve) => {
    let command = "node";
    let args = [filePath];

    if (language === "typescript") {
      args = ["-r", "ts-node/register", filePath];
    }

    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", async () => {
      await fs.unlink(filePath).catch(() => {});
      resolve("Execution failed");
    });

    // stdin support
    if (stdin) {
      child.stdin.write(stdin + "\n");
    }

    child.stdin.end();

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      stderr = "Execution timed out (3s limit)";
    }, 3000);

    child.on("close", async () => {
      clearTimeout(timeout);

      await fs.unlink(filePath).catch(() => {});

      let result = "";

      if (stderr.trim()) {
        const lines = stderr.split("\n");

        const cleanError =
          lines.find((line) =>
            /(SyntaxError|ReferenceError|TypeError|Error)/.test(line),
          ) || lines[0];

        result = cleanError.trim();
      } else {
        result = stdout.trim();
      }

      resolve(result || "");
    });
  });
};

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
    throw new ApiError(
      404,
      "Room not found. Ask the host to share the correct code.",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "room joined successfully"));
});

const runCode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { language, code, stdin, executedBy } = req.body;

  if (!language || !code) {
    throw new ApiError(400, "both fields are required");
  }

  let data;

  // LOCAL EXECUTION (JS / TS)
  if (language === "javascript" || language === "typescript") {
    const output = await runLocalCode(language, code, stdin);

    data = {
      output,
      memory: null,
      cpuTime: null,
    };
  } else {
    const mappedLanguage = languageMap[language];

    if (!mappedLanguage) {
      throw new ApiError(400, "language not supported");
    }

    const response = await api.post("/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: stdin || "",
      language: mappedLanguage,
      versionIndex: "0",
    });

    if (!response) {
      throw new ApiError(502, "something wrong while executing the code");
    }

    data = {
      output: response.data.output,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime,
    };
  }

  //Broadcast output to all users in room
  if (roomId) {
    const io = getIO();
    io.to(roomId).emit("code-output", {
      ...data,
      executedBy: executedBy || "Guest",
      stdin: stdin || "",
    });
  }

  // REST response
  res
    .status(200)
    .json(new ApiResponse(200, data, "code executed successfully"));
});

const getRoomsDetails = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ ownerId: req.user._id }).sort({
    createdAt: -1,
  });

  const activeRooms = rooms.filter((r) => r.isActive);
  const closedRooms = rooms.filter((r) => !r.isActive);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { activeRooms, closedRooms },
        "rooms fetched successfully",
      ),
    );
});

const getRoomDetails = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new ApiError(404, "Room does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "Room fetched successfully"));
});

export { createRoom, joinRoom, runCode, getRoomsDetails, getRoomDetails };
