import crypto from "node:crypto";
import config from "../../config/Config.service.js";

const ALGORITHM = "aes-256-cbc";
const DEFAULT_KEY = Buffer.from(
  config.encryptionKey || "4668a1ccbb82e78940e6a71f14c8887aa74bfce034456c1f26867ef7ab4efe2a",
).subarray(0, 32);

function getKey(secretKey) {
  if (secretKey != null && secretKey !== "") {
    return crypto.createHash("sha256").update(String(secretKey)).digest();
  }
  return DEFAULT_KEY;
}

export function encryption(plaintext, secretKey) {
  const key = getKey(secretKey);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encryptedData = cipher.update(plaintext, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedData}`;
}

export function decryption(encryptedData, secretKey) {
  const [iv, encryptedValue] = encryptedData.split(":");
  const key = getKey(secretKey);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );
  let decrypted = decipher.update(encryptedValue, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

export const encrypt = encryption;
export const decrypt = decryption;
