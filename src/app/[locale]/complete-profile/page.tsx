"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import LoadingBee from "@/components/LoadingBee";
import Logo from "@/components/Logo";
import { useNotification } from "@/components/NotificationToast";

const ROLES = [
  { id: "person", label: "Persona", icon: "👤", description: "Individuo que quiere apoyar proyectos" },
  { id: "startup", label: "Startup", icon: "🚀", description: "Empresa emergente buscando financiamiento" },
  { id: "project", label: "Proyecto", icon: "💡", description: "Iniciativa social o creativa" },
  { id: "pyme", label: "PYME", icon: "🏢", description: "Pequeña o mediana empresa" },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { showNotification, NotificationContainer } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    role: "person" as "person" | "startup" | "project" | "pyme",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userData && (userData as any).name && (userData as any).role) {
        router.push("/forbidden");
        return;
      }

      setUser(user);

      if (user.user_metadata?.full_name) {
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata.full_name,
        }));
      }

      setChecking(false);
    };

    checkUser();

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showNotification("Usuario no encontrado", "error");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingUser) {
        const { error } = await (supabase as any)
          .from("users")
          .update({
            name: formData.name,
            role: formData.role,
          })
          .eq("id", user.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("users").insert({
          id: user.id,
          email: user.email!,
          name: formData.name,
          role: formData.role,
        });

        if (error) throw error;
      }

      showNotification("¡Perfil completado exitosamente!", "success");
      router.push("/projects");
    } catch (error) {
      
      showNotification(
        `Error: ${error instanceof Error ? error.message : "Error al actualizar perfil"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking || !user) {
    return <LoadingBee text="Verificando cuenta..." />;
  }

  return (
    <>
      {NotificationContainer}
      <div className="min-h-screen bg-[#FDCB6E] flex items-center justify-center p-4">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={true} animated={false} />
        </div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black text-white p-4 border-4 border-black mb-6"
        >
          <p className="text-sm font-bold flex items-center gap-2">
            ⚠️ PERFIL REQUERIDO: Completa tu perfil para continuar usando la plataforma.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000]"
        >
          <h1 className="text-3xl font-bold mb-2">COMPLETA TU PERFIL</h1>
          <p className="text-gray-500 mb-8">
            Cuéntanos un poco sobre ti para personalizar tu experiencia.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (readonly) */}
            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 border-4 border-black bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E]"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-bold text-sm mb-3 uppercase">
                ¿Quién eres? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id as any })}
                    className={`p-4 border-4 border-black text-left transition-all ${
                      formData.role === role.id
                        ? "bg-[#FDCB6E] shadow-[4px_4px_0px_#000]"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{role.icon}</span>
                    <span className="font-bold text-sm block">{role.label}</span>
                    <span className="text-xs text-gray-500">{role.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !formData.name}
              className="w-full py-4 bg-black text-white border-4 border-black font-bold text-lg shadow-[6px_6px_0px_#FDCB6E] hover:shadow-[8px_8px_0px_#FDCB6E] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🐝
                  </motion.span>
                  GUARDANDO...
                </span>
              ) : (
                "COMPLETAR PERFIL →"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
