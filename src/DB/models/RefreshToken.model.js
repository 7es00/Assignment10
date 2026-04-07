import mongoose from "mongoose";

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
