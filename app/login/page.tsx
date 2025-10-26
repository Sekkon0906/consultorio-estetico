"use client";

import { useMemo, useState } from "react";
import { loginUser } from "../utils/auth";
import { useRouter } from "next/navigation";
import FondoAnim from "@/components/FondoAnim";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [recoverMode, setRecoverMode] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverSent, setRecoverSent] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Correo no válido";
    if (!password && !recoverMode) e.password = "Ingresa tu contraseña";
    return e;
  }, [email, password, recoverMode]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setErr(null);
    if (!isValid) return;

    if (recoverMode) {
      setRecoverSent(true);
      setTimeout(() => {
        setRecoverSent(false);
        setRecoverMode(false);
      }, 2500);
      return;
    }

    const res = loginUser(email, password);
    if (!res.ok) {
      setErr(res.error || "No se pudo iniciar sesión.");
      return;
    }
    router.push("/");
  };

  return (
    <section
      className="py-5 position-relative"
      style={{
        background: "linear-gradient(180deg, #FAF9F7 0%, #F1E9E0 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <FondoAnim />
      </div>

      {/* Contenido principal */}
      <div className="container position-relative z-10">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div
              className="card border-0 shadow-lg rounded-4 animate-fadein"
              style={{
                backgroundColor: "#FFFDF9",
                transition: "all 0.4s ease",
              }}
            >
              <div className="card-body p-4 p-md-5 text-center">
                <h1
                  className="fw-bold mb-1"
                  style={{
                    color: "#4E3B2B",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {recoverMode ? "Recuperar contraseña" : "Iniciar sesión"}
                </h1>

                <p
                  className="text-muted mb-4"
                  style={{ color: "#6C584C", fontSize: "0.95rem" }}
                >
                  {recoverMode
                    ? "Ingresa tu correo para recibir un enlace de recuperación."
                    : "Bienvenida de nuevo. Ingresa tus credenciales."}
                </p>

                {err && (
                  <div
                    className="alert alert-danger text-center animate-fadein"
                    style={{
                      backgroundColor: "#FCEAEA",
                      color: "#8C2B2B",
                      border: "1px solid #E3B4A0",
                    }}
                  >
                    {err}
                  </div>
                )}

                <form onSubmit={onSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3 text-start">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#4E3B2B" }}
                    >
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className={`form-control rounded-3 shadow-sm ${
                        touched && errors.email ? "is-invalid" : ""
                      }`}
                      value={recoverMode ? recoverEmail : email}
                      onChange={(e) =>
                        recoverMode
                          ? setRecoverEmail(e.target.value)
                          : setEmail(e.target.value)
                      }
                      placeholder="tucorreo@dominio.com"
                      style={{
                        borderColor: "#E9DED2",
                        backgroundColor: "#FFFDF9",
                        transition: "all 0.3s ease",
                      }}
                    />
                    {touched && errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  {!recoverMode && (
                    <div className="mb-4 text-start">
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "#4E3B2B" }}
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
                            borderColor: "#E9DED2",
                            backgroundColor: "#FFFDF9",
                          }}
                        />
                        <button
                          className="btn btn-light rounded-end-3 border"
                          type="button"
                          onClick={() => setShow((s) => !s)}
                          style={{
                            borderColor: "#E9DED2",
                            backgroundColor: "#F8F5F0",
                            color: "#4E3B2B",
                          }}
                        >
                          <i
                            className={`fas ${
                              show ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={recoverSent}
                    className="btn w-100 fw-semibold py-2"
                    style={{
                      backgroundColor: "#B08968",
                      border: "none",
                      color: "white",
                      borderRadius: "50px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#A1724F";
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px rgba(161, 114, 79, 0.35)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#B08968";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(176, 137, 104, 0.25)";
                    }}
                  >
                    {recoverMode
                      ? recoverSent
                        ? "Enviando enlace..."
                        : "Enviar enlace"
                      : "Entrar"}
                  </button>

                  {/* Links */}
                  <div className="text-center mt-4">
                    {!recoverMode ? (
                      <>
                        <p
                          style={{
                            color: "#B08968",
                            cursor: "pointer",
                            textDecoration: "underline",
                            transition: "color 0.3s ease",
                            marginBottom: "0.8rem",
                          }}
                          onClick={() => setRecoverMode(true)}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.color = "#A1724F")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = "#B08968")
                          }
                        >
                          ¿Olvidaste tu contraseña?
                        </p>

                        <p style={{ color: "#4E3B2B", fontSize: "0.9rem" }}>
                          ¿No tienes cuenta?{" "}
                          <span
                            onClick={() => router.push("/register")}
                            style={{
                              color: "#B08968",
                              textDecoration: "underline",
                              fontWeight: 600,
                              transition: "color 0.3s ease",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.color = "#A1724F")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.color = "#B08968")
                            }
                          >
                            Quiero registrarme
                          </span>
                        </p>
                      </>
                    ) : (
                      <p
                        onClick={() => setRecoverMode(false)}
                        style={{
                          color: "#B08968",
                          cursor: "pointer",
                          textDecoration: "underline",
                          marginTop: "1rem",
                        }}
                      >
                        Volver al inicio de sesión
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones */}
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadein {
          animation: fadein 0.6s ease forwards;
        }
      `}</style>
    </section>
  );
}
