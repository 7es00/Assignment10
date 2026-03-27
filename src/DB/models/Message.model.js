import mongoose from "mongoose";
import { MESSAGES } from "../../constants/index.js";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, MESSAGES.MESSAGE_CONTENT_REQUIRED],
      maxlength: [2000, MESSAGES.MESSAGE_TOO_LONG],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ recipient: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
