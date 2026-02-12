"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModelRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assessment/condition");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
      Redirecting to assessment...
    </div>
  );
}
