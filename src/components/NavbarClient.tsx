"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import {
  getCurrentUser,
  restoreRememberedSession,
  clearCurrentUser,
} from "../../app/utils/auth";

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const linkRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* --- Cargar usuario actual o recordado --- */
  useEffect(() => {
    const remembered = restoreRememberedSession();
    const user = remembered || getCurrentUser();
    setCurrentUser(user);

    if (user?.email) {
      const stored = localStorage.getItem(`photo_${user.email}`);
      setUserPhoto(stored || user.photo || null);
    }

    const handleAuthChange = () => {
      const updated = getCurrentUser() || restoreRememberedSession();
      setCurrentUser(updated);
      if (updated?.email) {
        const stored = localStorage.getItem(`photo_${updated.email}`);
        setUserPhoto(stored || updated.photo || null);
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  /* --- Menú principal (MEMO para evitar renders infinitos) --- */
  const menuItems = useMemo(() => {
    const base = [
      { label: "Inicio", href: "/" },
      { label: "Dra. Vanessa Medina", href: "/doctora" },
      { label: "Consultorio", href: "/consultorio" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Testimonios", href: "/testimonios" },
      { label: "Agendar cita", href: "/agendar" },
    ];
    if (currentUser?.rol === "admin") {
      base.push({ label: "Administrar", href: "/admin" });
    }
    return base;
  }, [currentUser?.rol]);

  /* --- Indicador animado bajo enlace activo --- */
  const updateIndicatorTo = (el: HTMLLIElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement?.getBoundingClientRect();
    if (!rect || !parent) return;
    const next = { left: rect.left - parent.left, width: rect.width };
    // Evita setState si no cambió (corta la cascada de renders)
    setIndicator((prev) =>
      prev.left !== next.left || prev.width !== next.width ? next : prev
    );
  };

  // Activa indicador en ruta activa
  useEffect(() => {
    const activeIndex = menuItems.findIndex((item) => item.href === pathname);
    const activeEl = activeIndex !== -1 ? linkRefs.current[activeIndex] : null;
    updateIndicatorTo(activeEl);

    // Recalcula al redimensionar/orientación
    const onResize = () => updateIndicatorTo(activeEl);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // ⚠️ Dependemos solo de pathname y cantidad de items (no de la referencia del array)
  }, [pathname, menuItems.length]);

  /* --- Logout --- */
  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  /* --- Cerrar dropdown al hacer clic fuera --- */
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

  /* --- Handlers de hover para guiar la línea --- */
  const handleItemEnter = (index: number) => {
    const el = linkRefs.current[index];
    updateIndicatorTo(el);
  };
  const handleMenuLeave = () => {
    const activeIndex = menuItems.findIndex((item) => item.href === pathname);
    updateIndicatorTo(linkRefs.current[activeIndex] || null);
  };

  /* --- Render --- */
  return (
    <nav
      className="navbar shadow-sm py-3"
      style={{
        backgroundColor: "#FAF9F7",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="container-fluid d-flex justify-content-between align-items-center"
        style={{ padding: "0 70px" }}
      >
        {/* === LOGO === */}
        <Link href="/" className="d-flex align-items-center">
          <Image
            src="/imagenes/logo/logoJM.jpg"
            alt="Logo JM"
            width={80}
            height={60}
            className="me-2"
            priority
          />
        </Link>

        {/* === MENÚ PRINCIPAL === */}
        <div
          className="position-relative"
          style={{ flex: 1.5, position: "relative" }}
          onMouseLeave={handleMenuLeave}
        >
          <ul
            className="navbar-menu d-flex justify-content-center align-items-center gap-4 mb-0"
            style={{ fontWeight: 600, listStyle: "none" }}
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.li
                  key={index}
                  ref={(el) => {
                    linkRefs.current[index] = el;
                  }}
                  className="nav-item"
                  style={{ cursor: "pointer" }}
                  whileHover={{ scale: 1.07, filter: "brightness(1.08)" }}
                  transition={{ duration: 0.18 }}
                  onMouseEnter={() => handleItemEnter(index)}
                >
                  <Link
                    href={item.href}
                    className="text-decoration-none"
                    style={{
                      color: isActive ? "#B08968" : "#2B2B2B",
                      fontWeight: 600,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* Indicador animado */}
          <motion.div
            layout
            initial={{ opacity: 0, y: -8, scaleX: 0 }}
            animate={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.width ? 1 : 0,
              y: 0,
              scaleX: indicator.width ? 1 : 0,
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: -2,
              height: "3px",
              background: "linear-gradient(90deg, #b08968, #ffe4c0, #b08968)",
              borderRadius: "3px",
              transformOrigin: "center",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* === PERFIL === */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          {!currentUser ? (
            <button
              onClick={() => (window.location.href = "/login")}
              className="btn btn-outline-dark rounded-4 px-3 py-2"
              style={{
                borderColor: "#B08968",
                color: "#6B4E3D",
                backgroundColor: "#fff8f3",
                fontWeight: 500,
              }}
            >
              Iniciar sesión
            </button>
          ) : (
            <>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="d-flex align-items-center border-0 bg-white rounded-pill shadow-sm px-2 py-1"
              >
                <img
                  src={
                    userPhoto ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  alt="Perfil"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #FFDDBF",
                  }}
                />
                <Menu
                  size={22}
                  color="#6B6B6B"
                  strokeWidth={2.3}
                  className="ms-2"
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 6 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="position-absolute bg-white border rounded-3 shadow p-3"
                    style={{
                      top: "100%",
                      right: 0,
                      minWidth: "220px",
                      zIndex: 100,
                    }}
                  >
                    <div className="mb-2">
                      <strong style={{ fontSize: "14px" }}>
                        {currentUser?.nombres || "Usuario"}
                      </strong>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {currentUser?.email}
                      </div>
                    </div>
                    <hr />
                    <div
                      onClick={() =>
                        (window.location.href = "/perfil/editar_info")
                      }
                      className="cursor-pointer py-1 text-secondary hover-bg"
                    >
                      Editar datos personales
                    </div>
                    <div
                      onClick={() =>
                        (window.location.href = "/perfil/citas_agendadas")
                      }
                      className="cursor-pointer py-1 text-secondary hover-bg"
                    >
                      Citas agendadas
                    </div>
                    <hr />
                    <div
                      onClick={handleLogout}
                      className="cursor-pointer text-danger py-1"
                    >
                      Cerrar sesión
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
