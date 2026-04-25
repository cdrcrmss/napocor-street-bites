import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    const isPublicRoute = pathname.startsWith("/login");
    if (isPublicRoute) {
        return NextResponse.next();
    }

    const cookie = request.cookies.get(COOKIE_NAME);
    const token = cookie ? cookie.value : undefined;
    const session = await verifySession(token);

    if (session) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};