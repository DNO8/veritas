import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/lib/hooks/WalletProvider";
import { SessionManager } from "@/components/SessionManager";
import { ToastProvider } from "@/components/Toast";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Colmena - Protocolo de Transparencia Programada",
  description:
    "Crowdfunding social y creativo sobre Stellar. Donaciones transparentes, impacto verificable.",
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
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <WalletProvider>
              <SessionManager />
              <Navbar />
              {children}
            </WalletProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
