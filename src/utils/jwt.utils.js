import jwt from "jsonwebtoken";
import config from "../../config/Config.service.js";

const { jwtSecret, jwtExpiresIn } = config.auth;

export function sign(payload, expiresIn = jwtExpiresIn) {
  return jwt.sign(payload, jwtSecret, { expiresIn });
}


export function verify(token) {
  return jwt.verify(token, jwtSecret);
}