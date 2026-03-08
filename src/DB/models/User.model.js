import mongoose from "mongoose";
import { ROLES } from "../../constants/role.constants.js";
import { MESSAGES } from "../../constants/index.js";
import { hash, compare } from "../../utils/index.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => /^\S+@\S+\.\S+$/.test(value),
        message: MESSAGES.EMAIL_FORMAT_INVALID,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: [18, MESSAGES.AGE_MIN_18],
      max: [60, MESSAGES.AGE_MAX_60],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function handleSecureFields() {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }

  if (this.isModified("phone")) {
    this.phone = await hash(this.phone);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  delete obj.phone; // phone is hashed, not reversible
  return obj;
};

export const User = mongoose.model("User", userSchema);

