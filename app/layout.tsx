import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { LayoutClient } from "./layout.client";
import { Providers } from "./providers";
import { loadCurrentUser } from "@/actions/auth";

// The root layout reads the request's httpOnly cookies to bootstrap the user.
// It must always render per request rather than be considered for static output.
export const dynamic = "force-dynamic";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "IT Helpdesk & Asset Management",
  description:
    "Manage IT assets, track tickets, and streamline helpdesk operations",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // loadCurrentUser() runs server-side once per page load to bootstrap the Zustand auth
  // store. After this, all client components read user from useCurrentUser().
  const user = await loadCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NuqsAdapter>
            {/* Providers sets up QueryClient + hydrates Zustand auth store */}
            <Providers initialUser={user}>
              <LayoutClient user={user}>
                {children}
              </LayoutClient>
            </Providers>
          </NuqsAdapter>
          <Toaster position="top-right" theme="dark" />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
