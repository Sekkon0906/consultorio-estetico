"use client";

import { useMemo, useState, useEffect } from "react"; // ✅ agrega useEffect aquí
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { loginUser, setCurrentUser } from "../utils/auth";
import { updateUserData } from "../utils/localDB";
import { handleGoogleSuccess } from "./GoogleHandler";
import { PALETTE } from "./palette2";

interface Props {
  setErr: (msg: string | null) => void;
}

export default function LoginForm({ setErr }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  // ✅ Este bloque centra la ventana emergente de Google
  useEffect(() => {
    const originalOpen = window.open;

    window.open = function (url, name, specs) {
      try {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const newSpecs = specs
          ? specs + `,left=${left},top=${top},width=${width},height=${height}`
          : `left=${left},top=${top},width=${width},height=${height}`;

        return originalOpen.call(window, url, name, newSpecs);
      } catch {
        return originalOpen.apply(window, arguments as any);
      }
    };

    return () => {
      window.open = originalOpen;
    };
  }, []);
  // ✅ Fin del bloque de centrado

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Correo no válido";
    if (!password) e.password = "Ingresa tu contraseña";
    return e;
  }, [email, password]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) {
      setErr("Revisa los campos marcados.");
      return;
    }

    const res = loginUser(email, password);
    if (!res.ok) {
      setErr(res.error || "No se pudo iniciar sesión.");
      return;
    }

    const user = res.user;
    if (!user) {
      setErr("Usuario no encontrado.");
      return;
    }

    if (remember) {
      const session = {
        ...user,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 días
      };
      localStorage.setItem("rememberUser", JSON.stringify(session));
    }

    updateUserData(
      {
        photo: user.photo || null,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol,
      },
      user.email
    );

    setCurrentUser(user);
    router.push("/");
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
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
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
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
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
        className="btn w-100 fw-semibold py-2 mb-3"
        style={{
          backgroundColor: PALETTE.main,
          border: "none",
          color: "white",
          borderRadius: "50px",
        }}
        whileHover={{
          scale: 1.03,
          y: -2,
          boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.15)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
      >
        Entrar
      </motion.button>

      {/* === Login con Google === */}
      <div className="mt-3 d-flex flex-column align-items-center gap-2">
        <p style={{ color: PALETTE.text, fontSize: "0.9rem" }}>O entra con:</p>
        <motion.div
          className="google-container"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={(cred) =>
                handleGoogleSuccess(cred, router, setErr, false, () => {}, () => {})
              }
              onError={() => setErr("Error al autenticar con Google.")}
              shape="pill"
              text="signin_with"
              width="250"
            />
          </div>
        </motion.div>
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
