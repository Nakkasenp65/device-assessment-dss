import Link from "next/link";
import { Smartphone, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { SessionUser } from "@/lib/session";

interface NavbarProps {
  user: SessionUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 transition-all duration-300 backdrop-blur-md bg-black/20 border-b border-white/5 supports-[backdrop-filter]:bg-black/20">
      <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter text-white group cursor-pointer">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-md group-hover:bg-cyan-500/40 transition-all duration-500" />
          <Smartphone className="relative h-8 w-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">SmartDSS</span>
      </Link>
      <nav className="flex gap-4">
        {user ? (
          user.role === "admin" ? (
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-white/10 gap-2 rounded-full px-6"
              >
                <LayoutDashboard className="w-4 h-4" /> แดชบอร์ด
              </Button>
            </Link>
          ) : (
            <UserDropdown user={user} />
          )
        ) : (
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-zinc-300 hover:text-white hover:bg-white/10 gap-2 rounded-full px-6"
            >
              <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
}
