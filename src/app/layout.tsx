import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Answer Engine Tracker",
  description: "Track LLM responses across OpenAI and Gemini"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
