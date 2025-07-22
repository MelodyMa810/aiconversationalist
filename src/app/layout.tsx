import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personalized AI Conversationalist",
  description: "Chat with AI personas for different purposes. Get personalized AI assistance for learning, work, and creative projects.",
  keywords: ["AI", "chatbot", "assistant", "conversation", "AI personas"],
  authors: [{ name: "Melody Ma" }],
  openGraph: {
    title: "Personalized AI Conversationalist",
    description: "Chat with AI personas for different purposes. Get personalized AI assistance for learning, work, and creative projects.",
    url: "https://conversationalist.vercel.app",
    siteName: "AI Conversationalist",
    type: "website",
    images: [
      {
        url: "/api/og", // We can create this later
        width: 1200,
        height: 630,
        alt: "Personalized AI Conversationalist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personalized AI Conversationalist",
    description: "Chat with AI personas for different purposes. Get personalized AI assistance for learning, work, and creative projects.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
