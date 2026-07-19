import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lankawa",
  description: "Sri Lanka civic intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
