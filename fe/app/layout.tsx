import type { Metadata, Viewport } from "next";
import { VerticalGate } from "@/components/layout/vertical-gate";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Dolphin Beauty CRM",
  description: "Customer Care Automation cho Spa · Nails · Salon",
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" }],
    shortcut: `${basePath}/favicon.ico`,
  },
};

export const viewport: Viewport = {
  themeColor: "#5D4094",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <VerticalGate>{children}</VerticalGate>
      </body>
    </html>
  );
}
