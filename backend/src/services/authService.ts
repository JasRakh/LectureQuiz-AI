import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { env } from "../config/env";

const SALT_ROUNDS = 10;

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  role: "student" | "professor";
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email }
  });
  if (existing) {
    throw new Error("Email is already in use");
  }

  const hash = await bcrypt.hash(params.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      password: hash,
      role: params.role
    }
  });

  const token = signToken(user.id, user.role);

  return { user, token };
}

export async function loginUser(params: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: params.email }
  });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(params.password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = signToken(user.id, user.role);
  return { user, token };
}

function signToken(userId: string, role: "student" | "professor") {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: "7d"
  });
}

