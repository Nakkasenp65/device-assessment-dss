import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AHP Smartphone DSS",
  description: "Decision Support System for Smartphone Condition Assessment",
};

import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";
import ConditionalNavbar from "@/components/ConditionalNavbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="en" className="dark">
      <body className={`${kanit.variable} antialiased font-sans`}>
        <Providers>
          <ConditionalNavbar user={user} />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
