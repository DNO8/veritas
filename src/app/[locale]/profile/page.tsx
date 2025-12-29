"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import LoadingBee from "@/components/LoadingBee";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  wallet_address: string | null;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  short_description: string;
  cover_image_url: string;
  status: string;
  current_amount: number;
  goal_amount: number;
}

interface Donation {
  id: string;
  amount: string;
  asset: string;
  created_at: string;
  project: {
    id: string;
    title: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single<UserProfile>();

        if (profile) {
          setUser(profile);
        }

        // Fetch user's projects
        const { data: userProjects } = await supabase
          .from("projects")
          .select(
            "id, title, short_description, cover_image_url, status, current_amount, goal_amount",
          )
          .eq("owner_id", authUser.id)
          .order("created_at", { ascending: false });

        if (userProjects) {
          setProjects(userProjects);
        }

        // Fetch user's donations (by wallet address if available)
        if (profile?.wallet_address) {
          const { data: userDonations } = await supabase
            .from("donations")
            .select(`
              id,
              amount,
              asset,
              created_at,
              project:projects(id, title)
            `)
            .eq("donor_wallet", profile.wallet_address)
            .order("created_at", { ascending: false })
            .limit(10);

          if (userDonations) {
            setDonations(userDonations as Donation[]);
            const total = (userDonations as Donation[]).reduce(
              (sum, d) => sum + parseFloat(d.amount),
              0,
            );
            setTotalDonated(total);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <LoadingBee text="Cargando perfil..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-[#FDCB6E] border-4 border-black flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold">
                  {user.name || user.email.split("@")[0]}
                </h1>
                <p className="text-gray-500 font-mono text-sm">{user.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/profile/settings"
                className="px-4 py-2 border-2 border-black bg-white font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                ⚙️ CONFIGURACIÓN
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-black bg-white font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FDCB6E] border-3 border-black flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{projects.length}</p>
                <p className="text-sm text-gray-500">Mis Proyectos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#FDCB6E] border-4 border-black p-6 shadow-[6px_6px_0px_#000]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border-3 border-black flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{donations.length}</p>
                <p className="text-sm text-black/70">Donaciones Realizadas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E67E22] border-3 border-black flex items-center justify-center">
                <span className="text-white text-xl">🪙</span>
              </div>
              <div>
                <p className="text-3xl font-bold">${totalDonated.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Total Aportado</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Projects Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">MIS PROYECTOS</h2>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_#000] text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 border-3 border-black flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Sin proyectos</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Necesitas ser un creador aprobado para crear proyectos
                </p>
                <Link
                  href="/projects/new"
                  className="inline-block px-4 py-2 bg-[#FDCB6E] border-2 border-black font-bold text-sm hover:shadow-[4px_4px_0px_#000] transition-shadow"
                >
                  CREAR PROYECTO
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="w-20 h-20 object-cover border-2 border-black"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {project.short_description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold border-2 border-black ${
                              project.status === "published"
                                ? "bg-green-200"
                                : "bg-gray-200"
                            }`}
                          >
                            {project.status === "published"
                              ? "PUBLICADO"
                              : "BORRADOR"}
                          </span>
                          <span className="text-sm font-mono text-[#E67E22]">
                            ${project.current_amount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {projects.length > 3 && (
                  <Link
                    href="/my-projects"
                    className="block text-center py-2 font-bold text-sm hover:underline"
                  >
                    Ver todos ({projects.length}) →
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* My Donations Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">MIS DONACIONES</h2>
              <Link
                href="/projects"
                className="px-3 py-1 border-2 border-black bg-white font-bold text-sm hover:bg-gray-100"
              >
                EXPLORAR →
              </Link>
            </div>

            {donations.length === 0 ? (
              <div className="bg-[#FDCB6E] border-4 border-black p-8 shadow-[6px_6px_0px_#000] text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white border-3 border-black flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Sin donaciones</h3>
                <p className="text-black/70 text-sm mb-4">
                  Aún no has apoyado ningún proyecto
                </p>
                <Link
                  href="/projects"
                  className="inline-block px-4 py-2 bg-black text-white border-2 border-black font-bold text-sm hover:bg-gray-800"
                >
                  EXPLORAR PROYECTOS
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#E67E22]">
                          {parseFloat(donation.amount).toFixed(2)}{" "}
                          {donation.asset}
                        </p>
                        <p className="text-sm text-gray-500">
                          {donation.project?.title || "Proyecto"}
                        </p>
                      </div>
                      <p className="text-xs font-mono text-gray-400">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size="md" showText={true} animated={false} />
              </div>
              <p className="text-gray-400 text-sm">
                Crowdfunding transparente impulsado por blockchain. Cada
                transacción es verificable, cada peso genera impacto real.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">PLATAFORMA</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/projects" className="hover:text-white">
                    Explorar Proyectos
                  </Link>
                </li>
                <li>
                  <Link href="/projects/new" className="hover:text-white">
                    Crear Proyecto
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cómo Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">LEGAL</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Términos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 Colmena. Todos los derechos reservados.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
              >
                <span>𝕏</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
              >
                <span>📱</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
              >
                <span>✉️</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
