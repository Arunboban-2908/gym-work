import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
// If your Prisma file is located elsewhere, you can change the path
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    debug: true,
    trustedOrigins: [`${process.env.BETTER_AUTH_URL}`],
    plugins: [nextCookies(), admin({
        defaultRole: "patient",
    })],
});