"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import LoadingBee from "@/components/LoadingBee";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { useNotification } from "@/components/NotificationToast";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  wallet_address: string | null;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const { showNotification, NotificationContainer } = useNotification();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single<UserProfile>();

        if (profile) {
          setUser(profile);
          setName(profile.name || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await (supabase.from("users") as any)
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
      setUser({ ...user, name });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingBee text="Cargando configuración..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {ConfirmDialogComponent}
      {NotificationContainer}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-4"
            >
              ← VOLVER AL PERFIL
            </Link>
            <h1 className="text-3xl font-bold">CONFIGURACIÓN</h1>
            <p className="text-gray-500">Administra tu información personal</p>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] mb-6"
          >
            <h2 className="text-xl font-bold mb-6 pb-4 border-b-2 border-black">
              Información Personal
            </h2>

            {message && (
              <div
                className={`p-4 mb-6 border-2 border-black ${
                  message.type === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block font-bold text-sm mb-2">NOMBRE</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E]"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block font-bold text-sm mb-2">EMAIL</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border-4 border-black bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El email no puede ser modificado
                </p>
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block font-bold text-sm mb-2">ROL</label>
                <div className="px-4 py-3 border-4 border-black bg-gray-100">
                  <span className="px-3 py-1 bg-[#FDCB6E] border-2 border-black font-bold text-sm">
                    {user.role?.toUpperCase() || "USUARIO"}
                  </span>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  WALLET STELLAR
                </label>
                {user.wallet_address ? (
                  <div className="px-4 py-3 border-4 border-black bg-green-50">
                    <p className="font-mono text-sm break-all">
                      {user.wallet_address}
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-4 border-black bg-yellow-50">
                    <p className="text-sm text-gray-600 mb-2">
                      No tienes una wallet conectada
                    </p>
                    <p className="text-xs text-gray-500">
                      Conecta tu wallet desde la barra de navegación para
                      recibir donaciones
                    </p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-[#FDCB6E] border-4 border-black font-bold text-lg hover:shadow-[6px_6px_0px_#000] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-4 border-red-500 p-6 shadow-[6px_6px_0px_#ef4444]"
          >
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Zona de Peligro
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Estas acciones son irreversibles. Procede con precaución.
            </p>
            <button
              className="px-4 py-2 border-2 border-red-500 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
              onClick={async () => {
                const confirmed = await showConfirm(
                  "Eliminar cuenta",
                  "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
                  {
                    type: "danger",
                    confirmText: "Eliminar",
                    cancelText: "Cancelar",
                  },
                );
                if (confirmed) {
                  showNotification(
                    "Funcionalidad no implementada en el MVP",
                    "info",
                  );
                }
              }}
            >
              ELIMINAR CUENTA
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
