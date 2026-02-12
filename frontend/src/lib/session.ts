import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:4000";
    const res = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[getSession] Failed to verify session", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    if (data.success && data.data) {
      return data.data as SessionUser;
    }

    return null;
  } catch (error) {
    console.error("[getSession] Error verifying session:", error);
    return null;
  }
}
