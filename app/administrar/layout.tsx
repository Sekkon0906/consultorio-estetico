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

// ✅ Tipo del usuario que devuelve getCurrentUser()
interface Usuario {
  id: number | string;
  nombre: string;
  rol: string;
  email?: string;
}

export default function AdminLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚫 antes: useState<any>(null)
  // ✅ ahora con tipo seguro:
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

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
      {/* resto del componente igual */}
      {children}
    </div>
  );
}
