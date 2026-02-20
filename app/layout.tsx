// app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InAppBrowserHandler from "@/components/layout/InAppBrowserHandler";
import { CartProvider } from "@/context/CartContext";

// ✅ 1) iOS/모바일에서 레이아웃 폭/세이프에어리어 안정화
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Hlín",
};

const hlinFont = localFont({
  src: [
    { path: "../fonts/NeueMontreal-Light.otf", weight: "300", style: "normal" },
    {
      path: "../fonts/NeueMontreal-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/NeueMontreal-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    { path: "../fonts/NeueMontreal-Bold.otf", weight: "700", style: "normal" },
    {
      path: "../fonts/NeueMontreal-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-hlin",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={hlinFont.variable}>
      <body>
        <CartProvider>
          <InAppBrowserHandler />
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
