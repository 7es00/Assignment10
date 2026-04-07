import mongoose from "mongoose";
import { Message } from "../../DB/models/Message.model.js";
import { User } from "../../DB/models/User.model.js";
import { AppError } from "../../utils/index.js";
import { MESSAGES } from "../../constants/index.js";

export async function getPublicProfileBySlug(profileSlug) {
  const slug = String(profileSlug || "").trim().toLowerCase();
  const user = await User.findOne({ profileSlug: slug })
    .select("name profileSlug")
    .lean();
  if (!user) {
    throw new AppError(MESSAGES.RECIPIENT_NOT_FOUND, 404);
  }
  return { name: user.name, profileSlug: user.profileSlug };
}

export async function sendAnonymousMessage(profileSlug, content) {
  const slug = String(profileSlug || "").trim().toLowerCase();
  const recipient = await User.findOne({ profileSlug: slug }).select("_id").lean();
  if (!recipient) {
    throw new AppError(MESSAGES.RECIPIENT_NOT_FOUND, 404);
  }

  const message = await Message.create({
    recipient: recipient._id,
    content: content.trim(),
    isAnonymous: true,
    sender: null,
  });

  return {
    id: message._id.toString(),
    createdAt: message.createdAt,
  };
}

export async function sendPublicMessage(profileSlug, senderId, content) {
  const slug = String(profileSlug || "").trim().toLowerCase();
  const recipient = await User.findOne({ profileSlug: slug }).select("_id").lean();
  if (!recipient) {
    throw new AppError(MESSAGES.RECIPIENT_NOT_FOUND, 404);
  }

  const message = await Message.create({
    recipient: recipient._id,
    content: content.trim(),
    isAnonymous: false,
    sender: senderId,
  });

  return {
    id: message._id.toString(),
    createdAt: message.createdAt,
  };
}

export async function getMessageByIdForRecipient(messageId, userId) {
  if (!mongoose.isValidObjectId(messageId)) {
    throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  const message = await Message.findOne({
    _id: messageId,
    recipient: userId,
  })
    .populate("sender", "name profileSlug profilePic")
    .lean();

  if (!message) {
    throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  if (message.isAnonymous) {
    message.sender = null;
  }

  return message;
}

export async function listMessagesForUser(userId, page = 1, limit = 20) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [items, total, unreadCount] = await Promise.all([
    Message.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Message.countDocuments({ recipient: userId }),
    Message.countDocuments({ recipient: userId, read: false }),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    unreadCount,
  };
}

export async function deleteMessageForUser(messageId, userId) {
  const message = await Message.findOneAndDelete({
    _id: messageId,
    recipient: userId,
  }).lean();
  if (!message) {
    throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
  }
  return { id: message._id.toString() };
}

export async function markMessageRead(messageId, userId) {
  const message = await Message.findOneAndUpdate(
    { _id: messageId, recipient: userId },
    { read: true },
    { new: true }
  ).lean();
  if (!message) {
    throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
  }
  return message;
}
