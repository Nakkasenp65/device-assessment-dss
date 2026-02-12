"use server";

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  console.log("[loginAction] Backend URL:", backendUrl);

  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[loginAction] Backend returned error:", data.error || res.statusText);
      // Translate common backend errors to Thai
      let errorMessage = data.error || "เข้าสู่ระบบไม่สำเร็จ";
      if (errorMessage === "Invalid credentials") {
        errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      }
      return { error: errorMessage };
    }

    // Set HttpOnly cookie
    if (data.data?.token) {
      console.log("[loginAction] Setting cookie for user:", data.data.role);
      const cookieStore = await cookies();
      cookieStore.set("token", data.data.token, {
        httpOnly: true,
        secure: false, // Force false for dev/http
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: "lax",
      });
      console.log("[loginAction] Cookie set successfully");
      return { success: true, role: data.data?.role };
    } else {
      console.error("[loginAction] No token received from backend:", data);
      return { error: "Login failed: No token received" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to connect to backend" };
  }

}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name") || email; // Use email as name if not provided
  const backendUrl = process.env.BACKEND_INTERNAL_URL;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const res = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role: "user" }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Registration failed" };
    }

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Failed to connect to backend" };
  }
}
