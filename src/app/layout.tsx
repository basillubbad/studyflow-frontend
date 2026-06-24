import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Script from "next/script";
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
  metadataBase: new URL("https://studyflow-frontend-roan.vercel.app"),
  title: {
    template: "%s | StudyFlow",
    default: "StudyFlow | Smart Academic Platform for University Students",
  },
  description:
    "StudyFlow is a smart academic platform that helps university students manage courses, track GPA, organize tasks, and build structured self-learning plans to achieve academic excellence.",
  keywords: [
    "StudyFlow",
    "student organization",
    "academic planner",
    "GPA tracking",
    "study tools",
    "task management",
    "university courses",
    "productivity app",
    "learning plans",
    "student success"
  ],
  applicationName: "StudyFlow",
  authors: [{ name: "StudyFlow Team" }],
  creator: "StudyFlow Team",
  publisher: "StudyFlow Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "StudyFlow | Smart Academic Platform for University Students",
    description: "Organize your academic life, track GPAs, and manage tasks with StudyFlow - the ultimate productivity tool for students.",
    url: "https://studyflow-frontend-roan.vercel.app",
    siteName: "StudyFlow",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "StudyFlow - Smart Academic Platform for University Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyFlow | The Ultimate Student Organizer",
    description: "Manage courses, track GPA, and organize tasks with StudyFlow. The smart way to achieve academic excellence.",
    images: ["/logo.png"],
    creator: "@StudyFlow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StudyFlow",
  "url": "https://studyflow-frontend-roan.vercel.app",
  "logo": "https://studyflow-frontend-roan.vercel.app/logo.png",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@studyflow.app",
    "availableLanguage": "English"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ scrollBehavior: "smooth" }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster richColors position="top-right" />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
