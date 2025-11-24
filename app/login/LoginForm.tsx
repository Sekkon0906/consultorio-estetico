"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser } from "../utils/auth";
import { handleGoogleLogin } from "./GoogleHandler";
import { PALETTE } from "./palette2";

interface Props {
  setErr: (msg: string | null) => void;
}

const ADMIN_EMAILS = [
  "medinapipe123@gmail.com",
  "admin@clinicavm.com",
  "soporte@clinicavm.com",
];

export default function LoginForm({ setErr }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // === Centrar la ventana emergente (por si alguna lib usa window.open) ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalOpen: typeof window.open = window.open.bind(window);

    const centeredOpen: typeof window.open = (
      url?: string | URL,
      target?: string,
      features?: string
    ) => {
      try {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const extraSpecs = `left=${left},top=${top},width=${width},height=${height}`;
        const finalFeatures = features
          ? `${features},${extraSpecs}`
          : extraSpecs;

        return originalOpen(url, target, finalFeatures);
      } catch {
        return originalOpen(url, target, features);
      }
    };

    window.open = centeredOpen;
    return () => {
      window.open = originalOpen;
    };
  }, []);
  // === Fin centrado ventana ===

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Correo no válido";
    if (!password) e.password = "Ingresa tu contraseña";
    return e;
  }, [email, password]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setErr(null);

    if (!isValid) {
      setErr("Revisa los campos marcados.");
      return;
    }

    setLoading(true);
    try {
      // loginUser ahora es ASÍNCRONO y ya habla con Firebase + backend
      const result = await loginUser(
        email.trim().toLowerCase(),
        password,
        remember
      );

      if (!result.ok || !result.user) {
        setErr(result.error || "No se pudo iniciar sesión.");
        return;
      }

      const user = result.user;

      // Lógica para panel administrador
      const isAdminEmail = ADMIN_EMAILS.includes(user.email.toLowerCase());
      const isAdminRole = user.rol === "admin";

      if (isAdminEmail || isAdminRole) {
        router.push("/administrar");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Error en onSubmit:", err);
      setErr(err?.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* === Email === */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Correo electrónico
        </label>
        <input
          type="email"
          className={`form-control rounded-3 shadow-sm ${
            touched && errors.email ? "is-invalid" : ""
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          style={{
            borderColor: PALETTE.border,
            backgroundColor: PALETTE.surface,
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = PALETTE.main)}
          onBlur={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
        />
        {touched && errors.email && (
          <div className="invalid-feedback">{errors.email}</div>
        )}
      </div>

      {/* === Contraseña === */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Contraseña
        </label>
        <div className="input-group">
          <input
            type={show ? "text" : "password"}
            className={`form-control rounded-start-3 shadow-sm ${
              touched && errors.password ? "is-invalid" : ""
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            style={{
              borderColor: PALETTE.border,
              backgroundColor: PALETTE.surface,
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = PALETTE.main)}
            onBlur={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
          />
          <button
            className="btn btn-light rounded-end-3 border"
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              borderColor: PALETTE.border,
              backgroundColor: "#F8F5F0",
              color: PALETTE.text,
            }}
          >
            <i className={`fas ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>
        {touched && errors.password && (
          <div className="invalid-feedback d-block">{errors.password}</div>
        )}
      </div>

      {/* === Recordar sesión === */}
      <div className="form-check text-start mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="rememberMe"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <label
          className="form-check-label"
          htmlFor="rememberMe"
          style={{ color: PALETTE.muted }}
        >
          Mantener sesión durante 30 días
        </label>
      </div>

      {/* === Botón de inicio === */}
      <motion.button
        type="submit"
        disabled={loading}
        className="btn w-100 fw-semibold py-2 mb-3"
        style={{
          backgroundColor: PALETTE.main,
          border: "none",
          color: "white",
          borderRadius: "50px",
        }}
        whileHover={
          !loading
            ? {
                scale: 1.03,
                y: -2,
                boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.15)",
              }
            : {}
        }
        whileTap={!loading ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
      >
        {loading ? "Iniciando sesión..." : "Entrar"}
      </motion.button>

      {/* === Login con Google (Firebase) === */}
      <div className="mt-3 d-flex flex-column align-items-center gap-2">
        <p style={{ color: PALETTE.text, fontSize: "0.9rem" }}>O entra con:</p>
        <motion.button
          type="button"
          className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${PALETTE.border}`,
            color: PALETTE.text,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleGoogleLogin({ router, setErr })}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            style={{ width: 20, height: 20 }}
          />
          <span>Iniciar sesión con Google</span>
        </motion.button>
      </div>

      {/* === Enlaces de acción === */}
      <div className="mt-4 d-flex justify-content-between">
        <motion.button
          type="button"
          onClick={() => router.push("/recuperar")}
          className="btn btn-link text-decoration-none fw-semibold p-0"
          style={{ color: PALETTE.main }}
          whileHover={{ scale: 1.08, color: PALETTE.mainHover }}
          transition={{ duration: 0.25 }}
        >
          Olvidé mi contraseña
        </motion.button>

        <motion.button
          type="button"
          onClick={() => router.push("/register")}
          className="btn btn-link text-decoration-none fw-semibold p-0"
          style={{ color: PALETTE.main }}
          whileHover={{ scale: 1.08, color: PALETTE.mainHover }}
          transition={{ duration: 0.25 }}
        >
          Crear cuenta
        </motion.button>
      </div>
    </motion.form>
  );
}
