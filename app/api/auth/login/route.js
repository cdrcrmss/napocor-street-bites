import { z } from "zod";
import { COOKIE_NAME, signSession } from "@/lib/auth";

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "Invalid login payload" }, { status: 400 });
    }

    const configuredUser = process.env.ADMIN_USERNAME;
    const configuredPass = process.env.ADMIN_PASSWORD;

    if (!configuredUser || !configuredPass) {
        return Response.json({ error: "Admin credentials are not configured" }, { status: 500 });
    }

    const { username, password } = parsed.data;
    if (username !== configuredUser || password !== configuredPass) {
        return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await signSession({ role: "admin", username });

    const response = Response.json({ ok: true });
    response.headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=43200; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
    );

    return response;
}