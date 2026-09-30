import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Site-wide fallback only. Each route sets its own: the landing page speaks to a fantasy
 * manager and never calls itself a prototype, while the tool route says plainly what it is.
 */
export const metadata: Metadata = {
  title: "Who Should I Start?",
  description: "Choose how many spots you are filling and get the expert-preferred combination.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
