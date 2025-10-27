"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUser, clearCurrentUser } from "../utils/auth";
import { FaUserCircle } from "react-icons/fa";
import type { UserData } from "../utils/auth";

export default function AuthStatus() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());

    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // No hay sesión → botón Iniciar sesión
  if (!user) {
    return (
      <Link
        href="/login"
        className="btn btn-light fw-semibold shadow-sm"
        style={{
          color: "#B08968",
          border: "1px solid #B08968",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#B08968";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.color = "#B08968";
        }}
      >
        <i className="fas fa-sign-in-alt me-2"></i>Iniciar sesión
      </Link>
    );
  }

  // Hay sesión → icono/avatar del usuario
  return (
    <div className="d-flex align-items-center">
      {user.photo ? (
        <Image
          src={user.photo}
          alt="Foto de perfil"
          width={36}
          height={36}
          style={{
            borderRadius: "50%",
            border: "2px solid #B08968",
            objectFit: "cover",
          }}
        />
      ) : (
        <FaUserCircle size={32} color="#B08968" />
      )}
    </div>
  );
}
