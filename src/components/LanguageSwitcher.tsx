"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/config";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");
    const newPath = `/${newLocale}${pathnameWithoutLocale || "/"}`;
    router.push(newPath);
  };

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <motion.button
          key={loc}
          whileHover={{ scale: locale === loc ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => switchLocale(loc)}
          disabled={locale === loc}
          className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-black transition-colors ${
            locale === loc
              ? "bg-black text-[#FDCB6E] cursor-default"
              : "bg-white text-black hover:bg-[#FDCB6E] cursor-pointer"
          }`}
        >
          {loc}
        </motion.button>
      ))}
    </div>
  );
}
