import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TempCast Hub",
  description: "Sistema operacional interno do podcast TempCast — Talento Emergente em Portugal.",
  keywords: ["podcast", "TempCast", "produção", "conteúdo", "Portugal"],
  authors: [{ name: "TempCast" }],
  openGraph: {
    title: "TempCast Hub",
    description: "Sistema operacional interno do podcast TempCast.",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      suppressHydrationWarning
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
