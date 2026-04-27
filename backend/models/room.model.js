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
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// TTL index to automatically delete closed rooms after 7 days
roomSchema.index({ closedAt: 1 }, { expireAfterSeconds: 604800 });

// Query optimization index
roomSchema.index({ ownerId: 1, createdAt: -1 });

export const Room = mongoose.model("Room", roomSchema);
