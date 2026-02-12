import React from "react";
import { AssessmentProvider } from "@/context/AssessmentContext";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssessmentProvider>
      <main className="flex-1 w-full pt-16 relative">{children}</main>
    </AssessmentProvider>
  );
}
