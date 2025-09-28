import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "CapyUniverse - Plataforma de Ferramentas IA",
  description: "Sua plataforma completa de ferramentas de inteligência artificial",
  generator: "CapyUniverse PWA",
  manifest: "/manifest.json",
  keywords: ["IA", "Inteligência Artificial", "Ferramentas", "Gemini", "PWA"],
  authors: [{ name: "CapyUniverse" }],
  creator: "CapyUniverse",
  publisher: "CapyUniverse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.jpg",
    shortcut: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CapyUniverse",
  },
  openGraph: {
    type: "website",
    siteName: "CapyUniverse",
    title: "CapyUniverse - Plataforma de Ferramentas IA",
    description: "Sua plataforma completa de ferramentas de inteligência artificial",
  },
  twitter: {
    card: "summary",
    title: "CapyUniverse - Plataforma de Ferramentas IA",
    description: "Sua plataforma completa de ferramentas de inteligência artificial",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CapyUniverse" />
        <link rel="apple-touch-icon" href="/icon-192x192.jpg" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
