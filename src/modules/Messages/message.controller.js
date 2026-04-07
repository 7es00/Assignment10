import {
  getPublicProfileBySlug,
  sendAnonymousMessage,
  sendPublicMessage,
  getMessageByIdForRecipient,
  listMessagesForUser,
  deleteMessageForUser,
  markMessageRead,
} from "./message.service.js";
import { MESSAGES } from "../../constants/index.js";

export async function handleGetPublicProfile(req, res, next) {
  try {
    const { profileSlug } = req.params;
    const profile = await getPublicProfileBySlug(profileSlug);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleSendPublic(req, res, next) {
  try {
    const { profileSlug } = req.params;
    const { content } = req.body || {};
    const senderId = req.user.userId;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MESSAGE_CONTENT_REQUIRED,
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MESSAGE_TOO_LONG,
      });
    }

    const result = await sendPublicMessage(profileSlug, senderId, content);

    return res.status(201).json({
      success: true,
      message: MESSAGES.MESSAGE_SENT_PUBLIC,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleSendAnonymous(req, res, next) {
  try {
    const { profileSlug } = req.params;
    const { content } = req.body || {};

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MESSAGE_CONTENT_REQUIRED,
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.MESSAGE_TOO_LONG,
      });
    }

    const result = await sendAnonymousMessage(profileSlug, content);

    return res.status(201).json({
      success: true,
      message: MESSAGES.MESSAGE_SENT,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetMessage(req, res, next) {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    const message = await getMessageByIdForRecipient(messageId, userId);

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListMyMessages(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const result = await listMessagesForUser(userId, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteMessage(req, res, next) {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    await deleteMessageForUser(messageId, userId);

    return res.status(200).json({
      success: true,
      message: MESSAGES.MESSAGE_DELETED,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleMarkMessageRead(req, res, next) {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    const message = await markMessageRead(messageId, userId);

    return res.status(200).json({
      success: true,
      message: MESSAGES.MESSAGE_MARKED_READ,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}
