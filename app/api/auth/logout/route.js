import { COOKIE_NAME, requireAuth } from "@/lib/auth";

export async function POST(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const response = Response.json({ ok: true });
    response.headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
    );

    return response;
}