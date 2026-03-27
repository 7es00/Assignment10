import crypto from "crypto";

export function slugifyName(name) {
  if (!name || typeof name !== "string") {
    return "user";
  }
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return s || "user";
}

export function randomSlugSuffix() {
  return crypto.randomBytes(5).toString("hex");
}
