"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "es";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification, NotificationContainer } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showNotification(`Error: ${error.message}`, "error");
    } else {
      showNotification("¡Inicio de sesión exitoso!", "success");
      router.push("/projects");
    }

    setLoading(false);
  };

  return (
    <>
      {NotificationContainer}
      <div className="min-h-screen hex-pattern flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl mb-4"
            >
              🐝
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
            <p className="text-gray-600">Inicia sesión en Colmena</p>
          </div>

          {/* Card */}
          <div className="card-brutal p-8 bg-white">
            {/* Google Button */}
            <div className="mb-6">
              <GoogleAuthButton
                locale={locale}
                onError={(msg) => showNotification(msg, "error")}
                text="Continuar con Google"
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 font-mono text-sm text-gray-500">
                  o
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-bold mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-brutal"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-bold mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-brutal"
                  placeholder="••••••••"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full btn-brutal ${loading ? "bg-gray-300 cursor-not-allowed" : "btn-brutal-primary"}`}
              >
                {loading ? "Iniciando sesión..." : "🍯 Iniciar Sesión"}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                href="/signup"
                className="font-bold text-[#E67E22] hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="font-mono text-sm text-gray-500 hover:text-black"
            >
              ← Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
