import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
  },
  { timestamps: true },
);

export const Room = mongoose.model("Room", roomSchema);
