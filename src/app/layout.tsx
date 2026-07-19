import type { Metadata } from "next";

export const metadata: Metadata = {
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
