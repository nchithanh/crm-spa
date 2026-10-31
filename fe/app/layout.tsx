import type { Metadata, Viewport } from "next";
import { VerticalGate } from "@/components/layout/vertical-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dolphin Beauty CRM",
  description: "Customer Care Automation cho Spa · Nails · Salon",
};

export const viewport: Viewport = {
  themeColor: "#5D5CC4",
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
