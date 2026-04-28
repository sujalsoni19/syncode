import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import api from "../config/axios.js";
import { languageMap } from "../utils/languageMap.js";
import { Room } from "../models/room.model.js";

// for local js and ts execution(without using jdoodle api)
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";

const runLocalCode = async (language, code) => {
  if (code.length > 20000) {
    throw new ApiError(400, "Code too large");
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
      throw new ApiError(400, "Unsafe code detected");
    }
  }

  const ext = language === "typescript" ? "ts" : "js";

  await fs.mkdir("temp", { recursive: true });

  const fileName = `script-${Date.now()}.${ext}`;
  const filePath = path.join("temp", fileName);

  await fs.writeFile(filePath, code);

  const command =
    language === "typescript" ? `npx ts-node ${filePath}` : `node ${filePath}`;

  return new Promise((resolve, reject) => {
    exec(command, { timeout: 3000 }, async (err, stdout, stderr) => {
      await fs.unlink(filePath);

      if (err) {
        let errorMessage = stderr || err.message;

        // remove file paths
        errorMessage = errorMessage.replace(
          /file:\/\/.*temp\/.*\.\w+:\d+/g,
          "",
        );

        // remove node internal stack traces
        errorMessage = errorMessage
          .split("\n")
          .filter((line) => !line.includes("node:internal"))
          .join("\n");

        // remove Node version line
        errorMessage = errorMessage.replace(/Node\.js v\d+\.\d+\.\d+/g, "");

        // keep only actual error line
        const errorLine = errorMessage
          .split("\n")
          .find((line) => line.includes("Error"));

        resolve(errorLine || errorMessage.trim());
        return;
      }

      resolve(stdout);
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
  const { language, code, stdin } = req.body;

  if (!language || !code) {
    throw new ApiError(400, "both fields are required");
  }

  if (language === "javascript" || language === "typescript") {
    const output = await runLocalCode(language, code);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { output, memory: null, cpuTime: null },
          "code executed successfully",
        ),
      );
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
