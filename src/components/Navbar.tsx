"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { LogoLink } from "./Logo";

const LanguageSwitcher = dynamic(() => import("./LanguageSwitcher"), {
  ssr: false,
  loading: () => (
    <div className="w-20 h-8 bg-[#FDCB6E]/30 border-2 border-black" />
  ),
});

export default function Navbar() {
  const t = useTranslations("navigation");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [hasCompleteProfile, setHasCompleteProfile] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", user.id)
          .single();

        const userProfile = userData as any;
        const isComplete = userProfile && userProfile.name && userProfile.role;
        setHasCompleteProfile(isComplete);

        if (!isComplete && pathname !== "/complete-profile") {
          router.push("/complete-profile");
        }
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const shouldHideNavbar = useMemo(() => {
    const hideNavbarPaths = [
      "/login",
      "/signup",
      "/complete-profile",
      "/auth/callback",
    ];
    return hideNavbarPaths.some((path) => pathname.includes(path));
  }, [pathname]);

  if (shouldHideNavbar || (user && !hasCompleteProfile)) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-[#FDCB6E] border-b-4 border-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <LogoLink size="md" showText={true} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/projects">{t("projects")}</NavLink>
            {user && (
              <>
                <NavLink href="/my-projects">{t("myProjects")}</NavLink>
                <NavLink href="/projects/new" highlight>
                  + {t("createProject")}
                </NavLink>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="font-mono text-sm bg-black text-[#FDCB6E] px-3 py-1 border-2 border-black hover:bg-[#E67E22] hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.email?.split("@")[0]}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="btn-brutal btn-brutal-dark text-sm py-2 px-4"
                >
                  {t("logout")}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-brutal btn-brutal-outline text-sm py-2 px-4">
                  {t("login")}
                </Link>
                <Link href="/signup" className="btn-brutal btn-brutal-dark text-sm py-2 px-4">
                  {t("signup")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-3 border-black bg-white"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black block"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-black block"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black block"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t-4 border-black bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <MobileNavLink href="/projects" onClick={() => setMobileMenuOpen(false)}>
                {t("projects")}
              </MobileNavLink>
              {user && (
                <>
                  <MobileNavLink href="/my-projects" onClick={() => setMobileMenuOpen(false)}>
                    {t("myProjects")}
                  </MobileNavLink>
                  <MobileNavLink href="/projects/new" onClick={() => setMobileMenuOpen(false)}>
                    + {t("createProject")}
                  </MobileNavLink>
                </>
              )}
              <div className="pt-4 border-t-2 border-black mt-4">
                <LanguageSwitcher />
                {user ? (
                  <div className="space-y-2 mt-3">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full btn-brutal btn-brutal-outline flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t("profile")}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full btn-brutal btn-brutal-dark"
                    >
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-3">
                    <Link href="/login" className="btn-brutal btn-brutal-outline text-center">
                      {t("login")}
                    </Link>
                    <Link href="/signup" className="btn-brutal btn-brutal-dark text-center">
                      {t("signup")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
  highlight = false,
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
      <Link
        href={href}
        className={`px-4 py-2 font-semibold text-sm uppercase tracking-wide border-3 border-black transition-all ${
          highlight
            ? "bg-[#E67E22] text-white shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
            : "bg-white text-black hover:bg-black hover:text-[#FDCB6E]"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block w-full px-4 py-3 font-semibold text-black uppercase tracking-wide border-3 border-black bg-[#FDCB6E] hover:bg-[#E67E22] hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
