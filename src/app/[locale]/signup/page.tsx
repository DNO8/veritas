"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useNotification } from "@/components/NotificationToast";
import dynamic from "next/dynamic";

const GoogleAuthButton = dynamic(
  () => import("@/components/auth/GoogleAuthButton"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-12 bg-gray-100 border-3 border-black animate-pulse" />
    ),
  },
);

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("auth");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"person" | "startup" | "project" | "pyme">(
    "person",
  );
  const [loading, setLoading] = useState(false);
  const { showNotification, NotificationContainer } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        showNotification(`Error: ${authError.message}`, "error");
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: email,
          name: name,
          role: role,
        } as any);

        if (userError) {
          showNotification(
            `${t("errorCreatingProfile")}: ${userError.message}`,
            "error",
          );
        } else {
          showNotification(t("accountCreated"), "success");
          router.push(`/${locale}/login`);
        }
      }

      setLoading(false);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Error al registrarse",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "person",
      label: `👤 ${tProfile("person")}`,
      desc: tProfile("personDesc"),
    },
    {
      value: "startup",
      label: `🚀 ${tProfile("startup")}`,
      desc: tProfile("startupDesc"),
    },
    {
      value: "project",
      label: `📋 ${tProfile("project")}`,
      desc: tProfile("projectDesc"),
    },
    {
      value: "pyme",
      label: `🏢 ${tProfile("pyme")}`,
      desc: tProfile("pymeDesc"),
    },
  ];

  return (
    <>
      {NotificationContainer}
      <div className="min-h-screen hex-pattern flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🍯
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">{t("joinTheHive")}</h1>
            <p className="text-gray-600">{t("createAccountSubtitle")}</p>
          </div>

          {/* Card */}
          <div className="card-brutal p-8 bg-white">
            {/* Google Button */}
            <div className="mb-6">
              <GoogleAuthButton
                locale={locale}
                onError={(msg) => showNotification(msg, "error")}
                text={t("continueWithGoogle")}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 font-mono text-sm text-gray-500">
                  {tCommon("or")}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-bold mb-2">
                  {t("name")} *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-brutal"
                  placeholder={t("namePlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-bold mb-2">
                  {t("email")} *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-brutal"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-bold mb-2">
                  {t("password")} *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-brutal"
                  placeholder={t("passwordPlaceholder")}
                />
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {t("minPasswordLength")}
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2">
                  {t("accountType")} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRole(option.value as any)}
                      className={`p-3 border-3 border-black text-left transition-colors ${
                        role === option.value
                          ? "bg-[#FDCB6E] shadow-[4px_4px_0px_#000]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span className="block font-bold text-sm">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-600">
                        {option.desc}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full btn-brutal ${loading ? "bg-gray-300 cursor-not-allowed" : "btn-brutal-primary"}`}
              >
                {loading ? t("creatingAccount") : t("createAccount")}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="font-bold text-secondary hover:underline"
              >
                {t("login")}
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href={`/${locale}`}
              className="font-mono text-sm text-gray-500 hover:text-black"
            >
              {t("backToHome")}
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
