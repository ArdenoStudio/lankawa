import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lankawa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lankawa",
  description: "Sri Lanka civic intelligence platform",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
