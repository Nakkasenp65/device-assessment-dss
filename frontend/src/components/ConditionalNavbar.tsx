"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SessionUser } from "@/lib/session";

interface ConditionalNavbarProps {
  user: SessionUser | null;
}

export default function ConditionalNavbar({ user }: ConditionalNavbarProps) {
  const pathname = usePathname();

  // Hide navbar on admin routes — admin has its own sidebar
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar user={user} />;
}
