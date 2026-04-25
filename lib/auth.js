import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "nsb_admin_session";

const encoder = new TextEncoder();

function getSecretKey() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error("AUTH_SECRET is not configured.");
    }

    return encoder.encode(secret);
}

export async function signSession(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("12h")
        .sign(getSecretKey());
}

export async function verifySession(token) {
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        return payload;
    } catch {
        return null;
    }
}

export function unauthorizedJson() {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireAuth(request) {
    const cookie = request.cookies.get(COOKIE_NAME);
    const token = cookie ? cookie.value : undefined;
    const payload = await verifySession(token);
    if (!payload) {
        return { ok: false, response: unauthorizedJson() };
    }

    return { ok: true, payload };
}