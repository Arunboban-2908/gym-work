import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
// If your Prisma file is located elsewhere, you can change the path
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";

const isDev = process.env.NODE_ENV !== "production";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    baseURL: isDev
        ? "http://localhost:3000"
        : (process.env.BETTER_AUTH_URL || "https://gym-work-three.vercel.app"),
    secret: process.env.BETTER_AUTH_SECRET,
    debug: isDev,
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://gym-work-three.vercel.app",
        process.env.BETTER_AUTH_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ].filter(Boolean) as string[],
    plugins: [nextCookies(), admin({
        defaultRole: "patient",
    })],
});