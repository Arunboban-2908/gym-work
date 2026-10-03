import { betterFetch } from "@better-fetch/fetch";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/sign-in", "/sign-up", "/login", "/signup"];

export async function proxy(request: NextRequest) {
    const { data: session } = await betterFetch<{ session: any, user: any }>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                //get the cookie from the request
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    if (session) {
        const role = session.user.role;

        // If user is logged in and tries to access auth routes, redirect them
        if (isAuthRoute) {
            if (role === 'admin') {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.redirect(new URL("/user", request.url));
        }

        // Allow authenticated users to view both Admin Dashboard and Patient Portal
    } else {
        // Not logged in
        if (!isAuthRoute) {
            if (isAdminRoute) {
                return NextResponse.redirect(new URL("/login?portal=admin", request.url));
            }
            return NextResponse.redirect(new URL("/login?portal=patient", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply to all routes except standard Next.js static files and APIs
};
