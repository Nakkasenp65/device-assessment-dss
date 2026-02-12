"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LogIn, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setLoading(true);
    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      router.refresh();
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-2000 pointer-events-none" />

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center flex flex-col gap-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/20">
            <LogIn className="w-6 h-6 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-zinc-400">ยินดีต้อนรับกลับสู่ SmartDSS</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ
            </div>
          )}

          <form action={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/50"
              />
              <div className="flex justify-end">
                <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-in shake">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-11"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              เข้าสู่ระบบ
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <div className="text-sm text-zinc-400">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3 h-3 mr-1" /> กลับสู่หน้าหลัก
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
