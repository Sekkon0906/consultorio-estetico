"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Evita errores de SSR importando Framer Motion dinámicamente
const MotionDiv = dynamic(
  async () => (await import("framer-motion")).motion.div,
  { ssr: false }
);

export default function NavbarClient() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Dra. Vanessa Medina", href: "/doctora" },
    { label: "Instalaciones", href: "/consultorio" },
    { label: "Procedimientos", href: "/procedimientos" },
    { label: "Testimonios", href: "/testimonios" },
    { label: "Agendar cita", href: "/agendar" },
    { label: "Administrar", href: "/admin" },
  ];

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm py-3"
      style={{
        backgroundColor: "#FAF9F7",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="container-fluid d-flex justify-content-between align-items-center"
        style={{
          whiteSpace: "nowrap",
          padding: "0 70px",
        }}
      >
        {/* IZQUIERDA: Logo */}
        <div
          className="d-flex align-items-center"
          style={{
            flex: "1",
            justifyContent: "flex-start",
            marginRight: "40px",
          }}
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

        {/* CENTRO: Menú interactivo */}
        <div
          className="d-flex justify-content-center align-items-center position-relative"
          style={{ flex: "1.5" }}
        >
          <ul
            className="navbar-nav flex-row justify-content-center align-items-center mb-0"
            style={{
              gap: "1.4rem",
              fontSize: "1rem",
              position: "relative",
            }}
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <li key={index} className="nav-item" style={{ listStyle: "none" }}>
                  <Link
                    href={item.href}
                    className="nav-link fw-semibold position-relative"
                    style={{
                      color: isActive ? "#B08968" : "#2B2B2B",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      padding: "8px 14px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* SUBRAYADO ACTIVO */}
                    {isActive && (
                      <MotionDiv
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                          width: "100%",
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "3px",
                          borderRadius: "2px",
                          background:
                            "linear-gradient(90deg, #b08968, #ffe4c0, #b08968)",
                          overflow: "hidden",
                        }}
                      >
                        {/* EFECTO DE DESTELLO VIAJERO */}
                        <MotionDiv
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{
                            width: "60%",
                            height: "100%",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                            filter: "blur(3px)",
                          }}
                        />
                      </MotionDiv>
                    )}

                    {item.label}

                    {/* EFECTO DE AURA SUAVE */}
                    {isActive && (
                      <MotionDiv
                        initial={{ opacity: 0.2 }}
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scale: [1, 1.04, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          inset: "-5px",
                          borderRadius: "12px",
                          zIndex: -1,
                          background:
                            "radial-gradient(circle, rgba(176,137,104,0.15) 0%, rgba(176,137,104,0) 70%)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* DERECHA: Botón */}
        <div
          className="d-flex justify-content-end align-items-center"
          style={{
            flex: "1",
            justifyContent: "flex-end",
          }}
        >
          <Link
            href="/login"
            className="fw-semibold"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.4rem",
              borderRadius: "30px",
              border: "2px solid #4E3B2B",
              color: "#4E3B2B",
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#B08968";
              e.currentTarget.style.color = "#FFF";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4E3B2B";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
