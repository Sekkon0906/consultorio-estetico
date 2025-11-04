"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getCurrentUser,
  clearCurrentUser,
} from "../utils/auth";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const params = useSearchParams();
  const section = params.get("section") || "inicio";

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    window.location.href = "/";
  };

  const links = [
    { id: "horarios", label: "Horarios" },
    { id: "citas", label: "Citas Agendadas" },
    { id: "procedimientos", label: "Procedimientos" },
    { id: "testimonios", label: "Testimonios" },
    { id: "charlas", label: "Formacion" },
    { id: "ingresos", label: "Ingresos" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] text-[#32261C]">
      {/* === SIDEBAR === */}
      <AnimatePresence>
        {(sidebarOpen || typeof window === "undefined" || window.innerWidth > 768) && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-[#E9E0D1] text-[#32261C] flex flex-col py-6 px-4 shadow-lg z-50 fixed md:static"
          >
            <h1 className="text-2xl font-bold mb-8 text-center tracking-wide text-[#8B6A4B]">
              Panel Admin
            </h1>

            <ul className="flex flex-col space-y-3">
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
          style={{
            textDecoration: "none",
          }}
        >
          {label}
        </Link>
      </motion.li>
    );
  })}
</ul>

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
