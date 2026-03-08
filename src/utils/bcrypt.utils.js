import pkg from "bcrypt";

export async function hash(password) {
  return await pkg.hash(password, 12);
}

export async function compare(password, hashedPassword) {
  return await pkg.compare(password, hashedPassword);
}
