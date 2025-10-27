"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, clearCurrentUser } from "../../app/utils/auth";
import { Menu } from "lucide-react";

export default function NavbarClient() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const linkRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Cargar usuario y foto ---
  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);

    if (u && u.email) {
      const stored = localStorage.getItem(`photo_${u.email}`);
      setUserPhoto(stored || u.photo || null);
    }

    const updateUser = () => {
      const nu = getCurrentUser();
      setCurrentUser(nu);

      if (nu && nu.email) {
        const stored = localStorage.getItem(`photo_${nu.email}`);
        setUserPhoto(stored || nu.photo || null);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3500);
      } else {
        setUserPhoto(null);
      }
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("authChange", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("authChange", updateUser);
    };
  }, []);

  // --- Indicador animado ---
  useEffect(() => {
    const activeIndex = menuItems.findIndex((item) => item.href === pathname);
    if (activeIndex !== -1 && linkRefs.current[activeIndex]) {
      const el = linkRefs.current[activeIndex];
      const rect = el?.getBoundingClientRect();
      const parentRect = el?.parentElement?.getBoundingClientRect();
      if (rect && parentRect) {
        setIndicator({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
        return;
      }
    }
    setIndicator({ left: 0, width: 0 });
  }, [pathname]);

  // --- Logout ---
  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  // --- Menú principal ---
  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Dra. Vanessa Medina", href: "/doctora" },
    { label: "Consultorio", href: "/consultorio" },
    { label: "Procedimientos", href: "/procedimientos" },
    { label: "Testimonios", href: "/testimonios" },
    { label: "Agendar cita", href: "/agendar" },
  ];
  if (currentUser?.rol === "admin") {
    menuItems.push({ label: "Administrar", href: "/admin" });
  }

  // --- Cerrar menú al hacer clic fuera ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* MENSAJE DE BIENVENIDA */}
      {showWelcome && currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#B08968] text-white px-6 py-3 rounded-xl shadow-lg"
        >
          Se ha iniciado sesión correctamente, Bienvenido{" "}
          <span className="font-semibold">
            {currentUser.name?.split(" ")[0]}
          </span>
        </motion.div>
      )}

      {/* === NAVBAR === */}
      <nav
        className="navbar navbar-expand-lg shadow-sm py-3"
        style={{ backgroundColor: "#FAF9F7", position: "relative", zIndex: 10 }}
      >
        <div
          className="container-fluid d-flex justify-content-between align-items-center"
          style={{ whiteSpace: "nowrap", padding: "0 70px", position: "relative" }}
        >
          {/* === IZQUIERDA: LOGO === */}
          <div
            className="d-flex align-items-center"
            style={{ flex: "1", justifyContent: "flex-start", marginRight: "40px" }}
          >
            <Image
              src="/imagenes/logo/logoJM.jpg"
              alt="Logo Clínica Estética"
              width={80}
              height={60}
              className="me-1"
              priority
            />
            <div>
              <span
                style={{
                  color: "#2B2B2B",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  letterSpacing: "0.5px",
                }}
              >
                Dra. Juliet Medina Orjuela
              </span>
              <br />
              <small
                style={{
                  color: "#8A8B75",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                }}
              >
                Medicina estética y antienvejecimiento
              </small>
            </div>
          </div>

          {/* === CENTRO: MENÚ PRINCIPAL === */}
          <div
            className="d-flex justify-content-center align-items-center position-relative"
            style={{ flex: "1.5", position: "relative" }}
          >
            <ul
              className="navbar-nav flex-row justify-content-center align-items-center mb-0 position-relative"
              style={{ gap: "1.6rem", fontSize: "1rem", position: "relative" }}
            >
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={index}
                    ref={(el: HTMLLIElement | null) => {
                      linkRefs.current[index] = el;
                    }}
                    className="nav-item position-relative"
                    style={{ listStyle: "none" }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      className="nav-link fw-semibold position-relative group"
                      style={{
                        color: isActive ? "#B08968" : "#2B2B2B",
                        fontWeight: "600",
                        transition: "color 0.3s ease",
                        padding: "6px 8px",
                      }}
                    >
                      <motion.span
                        whileHover={{
                          textShadow: "0 0 8px rgba(176,137,104,0.8)",
                          color: "#B08968",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* === INDICADOR ANIMADO === */}
            <motion.div
              layout
              initial={{ opacity: 0, y: -8, scaleX: 0 }}
              animate={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.width ? 1 : 0.5,
                y: indicator.width ? 0 : -8,
                scaleX: indicator.width ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                position: "absolute",
                bottom: 0,
                height: "3px",
                background: "linear-gradient(90deg, #b08968, #ffe4c0, #b08968)",
                borderRadius: "3px",
                transformOrigin: "center",
              }}
            />
          </div>

          {/* === DERECHA: AVATAR === */}
          <div
            className="d-flex justify-content-end align-items-center"
            style={{ flex: "1", justifyContent: "flex-end" }}
          >
            {!currentUser ? (
              <button
                onClick={() => (window.location.href = "/login")}
                className="btn btn-outline-dark rounded-4 px-3 py-2"
                style={{
                  fontWeight: 500,
                  borderColor: "#B08968",
                  color: "#6B4E3D",
                  backgroundColor: "#fff8f3",
                }}
              >
                Iniciar sesión
              </button>
            ) : (
              <motion.div
                ref={dropdownRef}
                whileHover={{
                  boxShadow: "0 0 12px rgba(176,137,104,0.4)",
                  scale: 1.05,
                }}
                transition={{ duration: 0.3 }}
                style={{ position: "relative", borderRadius: "999px" }}
              >
                {/* === BOTÓN === */}
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center focus:outline-none navbar-profile-dropdown"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.05)",
                    background: "white",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={
                      userPhoto ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt="Perfil"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #FFDDBF",
                    }}
                  />
                  <motion.div
                    animate={{ rotate: menuOpen ? 90 : 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  >
                    <Menu size={22} color="#6B6B6B" strokeWidth={2.3} />
                  </motion.div>
                </button>

                {/* === MENÚ DESPLEGABLE === */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 6, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.8, 0.5, 1],
                      }}
                      className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl border border-gray-100 p-3 z-50"
                      style={{
                        minWidth: 260,
                        top: "100%",
                        transformOrigin: "top right",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col mb-2">
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#000",
                          }}
                        >
                          {currentUser?.name || "Usuario"}
                        </span>
                        <span style={{ fontSize: 12, color: "#6b6b6b" }}>
                          {currentUser?.email || ""}
                        </span>
                      </div>

                      <hr />

                      <div
                        onClick={() =>
                          (window.location.href = "/perfil/editar_info")
                        }
                        className="cursor-pointer text-sm text-gray-700 hover:bg-gray-100 rounded-md px-2 py-2"
                      >
                        Editar datos personales
                      </div>

                      <div
                        onClick={() =>
                          (window.location.href = "/perfil/citas_agendadas")
                        }
                        className="cursor-pointer text-sm text-gray-700 hover:bg-gray-100 rounded-md px-2 py-2"
                      >
                        Citas agendadas
                      </div>

                      <hr />

                      <div
                        onClick={handleLogout}
                        className="cursor-pointer text-sm text-red-600 hover:bg-red-50 rounded-md px-2 py-2"
                      >
                        Cerrar sesión
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
