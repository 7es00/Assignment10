import mongoose from "mongoose";
import { ROLES } from "../../constants/role.constants.js";
import { MESSAGES } from "../../constants/index.js";
import { hash, compare } from "../../utils/index.js";
import { slugifyName, randomSlugSuffix } from "../../utils/slug.utils.js";

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
    profileSlug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(-[a-z0-9]+)*$/, MESSAGES.PROFILE_SLUG_FORMAT_INVALID],
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otpHash: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    profilePic: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function handleSecureFields() {
  if (!this.profileSlug) {
    const base = slugifyName(this.name);
    const Model = this.constructor;
    let slug = `${base}-${randomSlugSuffix()}`;
    for (let i = 0; i < 12; i++) {
      const exists = await Model.findOne({
        profileSlug: slug,
        _id: { $ne: this._id },
      }).lean();
      if (!exists) break;
      slug = `${base}-${randomSlugSuffix()}`;
    }
    this.profileSlug = slug;
  }

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
  delete obj.otpHash;
  delete obj.otpExpiresAt;
  return obj;
};

export const User = mongoose.model("User", userSchema);

