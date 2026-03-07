// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: false
  },
  trustedOrigins: [
    "https://web3x.space",
    process.env.NEXT_PUBLIC_BASE_URL!,
  ],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
  secret: process.env.AUTH_SECRET!,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
    },
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  // Add session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});