import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/lib/hooks/WalletProvider";
import { SessionManager } from "@/components/SessionManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VERITAS - Plataforma de Crowdfunding Transparente",
  description:
    "Plataforma descentralizada de donaciones construida sobre Stellar",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Unwrap params Promise
  const { locale } = await params;

  // Validar que el locale es soportado
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Cargar mensajes para el locale actual
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <WalletProvider>
            <SessionManager />
            <Navbar />
            {children}
          </WalletProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
