"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, clearCurrentUser } from "../utils/auth";
import type { User } from "../utils/localDB";

interface AdminLayoutInnerProps {
  children: React.ReactNode;
}

export default function AdminLayoutInner({ children }: AdminLayoutInnerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const params = useSearchParams();
  const router = useRouter();
  const section = params.get("section") || "inicio";

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user as User);
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    router.push("/");
  };

  const links: { id: string; label: string }[] = [
    { id: "horarios", label: "Horarios" },
    { id: "citas", label: "Citas Agendadas" },
    { id: "procedimientos", label: "Procedimientos" },
    { id: "testimonios", label: "Testimonios" },
    { id: "charlas", label: "Formación" },
    { id: "ingresos", label: "Ingresos" },
  ];

  // Helper para saber si estamos en desktop sin romper SSR
  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth > 768 : false;

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] text-[#32261C]">
      {/* === SIDEBAR === */}
      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-[#E9E0D1] text-[#32261C] flex flex-col py-6 px-4 shadow-lg z-50 fixed md:static"
          >
            <h1 className="text-2xl font-bold mb-2 text-center tracking-wide text-[#8B6A4B]">
              Panel Admin
            </h1>

            {currentUser && (
              <p className="text-sm text-center mb-6 text-[#5A4230]">
                Sesión: <b>{currentUser.nombres}</b>
              </p>
            )}

            <ul className="flex flex-col space-y-3 mb-6">
              {links.map(({ id, label }) => {
                const isActive = section === id;
                return (
                  <motion.li
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/administrar?section=${id}`}
                      scroll={false}
                      className={`block text-center px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                        isActive
                          ? "bg-[#8B6A4B] text-white shadow-sm"
                          : "bg-[#FBF7F2] text-[#5A4230] hover:bg-[#DCC7AC] hover:text-[#3A2A1A]"
                      }`}
                      style={{ textDecoration: "none" }}
                    >
                      {label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            <button
              onClick={handleLogout}
              className="mt-auto px-4 py-2 rounded-lg bg-[#C87A7A] text-white font-semibold shadow hover:bg-[#B56666] transition"
            >
              Cerrar sesión
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        {/* HEADER SUPERIOR */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-[#FBF7F2] border-b border-[#E5D8C8] shadow-sm sticky top-0 z-40">
          <button
            className="md:hidden bg-[#8B6A4B] text-white p-2 rounded-lg shadow"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <Menu size={22} />
          </button>
          <h2 className="text-xl font-semibold text-[#8B6A4B]">
            Administración
          </h2>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#FBF7F2]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
