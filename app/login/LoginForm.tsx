"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
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

    // Sesión persistente
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
    <form onSubmit={onSubmit} noValidate>
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
          }}
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
            }}
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
      <button
        type="submit"
        className="btn w-100 fw-semibold py-2 mb-3"
        style={{
          backgroundColor: PALETTE.main,
          border: "none",
          color: "white",
          borderRadius: "50px",
        }}
      >
        Entrar
      </button>

      {/* === Login con Google === */}
      <div className="mt-3 d-flex flex-column align-items-center gap-2">
        <p style={{ color: PALETTE.text, fontSize: "0.9rem" }}>O entra con:</p>
        <GoogleLogin
          onSuccess={(cred) =>
            handleGoogleSuccess(cred, router, setErr, false, () => {}, () => {})
          }
          onError={() => setErr("Error al autenticar con Google.")}
          shape="pill"
          text="signin_with"
        />
      </div>

      {/* === Enlaces de acción === */}
      <div className="mt-4 d-flex justify-content-between">
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="btn btn-link text-decoration-none fw-semibold p-0"
          style={{ color: PALETTE.main }}
        >
          Crear cuenta
        </button>

        <button
          type="button"
          onClick={() => router.push("/recuperar")}
          className="btn btn-link text-decoration-none fw-semibold p-0"
          style={{ color: PALETTE.main }}
        >
          Olvidé mi contraseña
        </button>
      </div>
    </form>
  );
}
