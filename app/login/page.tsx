"use client";

import { useMemo, useState } from "react";
import { loginUser, setCurrentUser } from "../../app/utils/auth"; // <-- IMPORTAR setCurrentUser
import { useRouter } from "next/navigation";
import FondoAnim from "@/components/FondoAnim";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; 
import { fakeUsers } from "../utils/fakeDB";

/* ----------------------------- Paleta (misma que usas) ----------------------------- */
const PALETTE = {
  main: "#B08968",
  text: "#4E3B2B",
  muted: "#6C584C",
  surface: "#FFFDF9",
  border: "#E9DED2",
};

export default function LoginPage() {
  const router = useRouter();

  /* form states */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* show/hide password toggles */
  const [show, setShow] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* recover flow */
  const [recoverMode, setRecoverMode] = useState(false);
  const [recoverStep, setRecoverStep] = useState<"verify" | "reset">("verify");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverUser, setRecoverUser] = useState<any>(null);

  /* visual feedback */
  const [successMsg, setSuccessMsg] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /* validations */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email) && !recoverMode) e.email = "Correo no válido";
    if (!password && !recoverMode) e.password = "Ingresa tu contraseña";
    if (recoverMode && recoverStep === "reset") {
      if (!password) e.password = "Ingresa tu nueva contraseña";
      if (password !== confirmPass) e.confirm = "Las contraseñas no coinciden";
    }
    return e;
  }, [email, password, confirmPass, recoverMode, recoverStep]);

  const isValid = Object.keys(errors).length === 0;

const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setTouched(true);
  setErr(null);

  if (!isValid) {
    setErr("Revisa los campos marcados.");
    return;
  }

  // Modo recuperar
  if (recoverMode) {
    if (recoverStep === "verify") return; // debe pasar por Google primero

    const targetEmail =
      (recoverUser && recoverUser.email) || recoverEmail || email || null;

    if (!targetEmail) {
      setErr("No se pudo determinar el usuario a actualizar.");
      return;
    }

    const users = [...fakeUsers];
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === targetEmail!.toLowerCase()
    );
    if (idx === -1) {
      setErr("Usuario no encontrado en la base de datos.");
      return;
    }

    users[idx].password = password;
    localStorage.setItem("fakeUsers", JSON.stringify(users));

    try {
      const cur = localStorage.getItem("currentUser");
      if (cur) {
        const curU = JSON.parse(cur);
        if (curU.email && curU.email.toLowerCase() === users[idx].email.toLowerCase()) {
          setCurrentUser(users[idx]); // actualiza sesión si coincide
        }
      }
    } catch {}

    setShowToast(true);
    setSuccessMsg(true);
    setTimeout(() => {
      setShowToast(false);
      setSuccessMsg(false);
      setPassword("");
      setConfirmPass("");
      setRecoverMode(false);
      setRecoverStep("verify");
      setRecoverUser(null);
      router.push("/login");
    }, 2000);

    return;
  }

  // Modo login normal
  const res = loginUser(email, password);
  if (!res.ok) {
    setErr(res.error || "No se pudo iniciar sesión.");
    return;
  }

  // NO dispares setCurrentUser aquí — ya se hace dentro de loginUser()
  // el Navbar escuchará el evento "authChange" y mostrará el toast una sola vez.
  router.push("/");
};
/* -------------------- Google success (login o verify) -------------------- */
const handleGoogleSuccess = (credentialResponse: any) => {
  try {
    const decoded: any = jwtDecode(credentialResponse.credential!);
    const emailFromToken = (decoded.email || "").toLowerCase();
    if (!emailFromToken) {
      setErr("No se recibió correo desde Google.");
      return;
    }

    const found = fakeUsers.find(
      (u) => u.email.toLowerCase() === emailFromToken
    );

    if (recoverMode) {
      // flujo de recuperación: si existe, permitir reset
      if (found) {
        setRecoverUser(found);
        setRecoverStep("reset");
        setErr(null);
      } else {
        setErr("No encontramos una cuenta asociada a este correo.");
      }
      return;
    }

    // flujo normal: si existe, iniciar sesión y sincronizar navbar usando setCurrentUser
    if (found) {
      // Actualizamos la foto desde Google si viene en el token
      if (decoded.picture && decoded.picture.startsWith("http")) {
        found.photo = decoded.picture;
      } else if (!found.photo) {
        found.photo =
          "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg";
      }

      // Guardamos el cambio en fakeUsers y localStorage
      const idx = fakeUsers.findIndex(
        (u) => u.email.toLowerCase() === emailFromToken
      );
      if (idx !== -1) {
        fakeUsers[idx] = { ...fakeUsers[idx], photo: found.photo };
        localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
      }

      // Guardar sesión y notificar Navbar
      setCurrentUser(found);
      router.push("/");
      return;
    }

    // Si el usuario no existe, redirigir a registro con datos prellenados
    const nameParam = encodeURIComponent(decoded.name || "");
    const emailParam = encodeURIComponent(decoded.email || "");
    const photoParam = encodeURIComponent(decoded.picture || "");
    router.push(`/register?name=${nameParam}&email=${emailParam}&photo=${photoParam}`);
  } catch (error) {
    console.error("Error decoding Google token:", error);
    setErr("Error al procesar la autenticación con Google.");
  }
};



  const handleGoogleError = () => {
    setErr("Error al autenticar con Google. Intenta nuevamente.");
  };

  /* -------------------- UI -------------------- */
  return (
    <GoogleOAuthProvider clientId="238138002993-ahevug4qtspj0jpmo7jvr6rjhm485lh0.apps.googleusercontent.com">
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
        <div className="absolute inset-0 z-0">
          <FondoAnim />
        </div>

        <div className="container position-relative z-10">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div
                className={`card border-0 shadow-lg rounded-4 ${err ? "shake" : ""}`}
                style={{
                  backgroundColor: PALETTE.surface,
                  transition: "all 0.4s ease",
                }}
              >
                <div className="card-body p-4 p-md-5 text-center">
                  <h1
                    className="fw-bold mb-1"
                    style={{
                      color: PALETTE.text,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {recoverMode ? (recoverStep === "verify" ? "Verifica tu identidad" : "Restablecer contraseña") : "Iniciar sesión"}
                  </h1>

                  <p className="text-muted mb-4" style={{ color: PALETTE.muted, fontSize: "0.95rem" }}>
                    {recoverMode
                      ? recoverStep === "verify"
                        ? "Verifica tu identidad con Google antes de restablecer tu contraseña."
                        : "Ingresa tu nueva contraseña para actualizarla."
                      : "Bienvenido de nuevo. Ingresa tus credenciales."}
                  </p>

                  {err && (
                    <div className="alert alert-danger text-center" style={{ backgroundColor: "#FCEAEA", color: "#8C2B2B", border: "1px solid #E3B4A0" }}>
                      {err}
                    </div>
                  )}

                  <form onSubmit={onSubmit} noValidate>
                    {/* LOGIN NORMAL */}
                    {!recoverMode && (
                      <>
                        <div className="mb-3 text-start">
                          <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Correo electrónico</label>
                          <input
                            type="email"
                            className={`form-control rounded-3 shadow-sm ${touched && errors.email ? "is-invalid" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tucorreo@dominio.com"
                            style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                          />
                          {touched && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="mb-4 text-start">
                          <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Contraseña</label>
                          <div className="input-group">
                            <input
                              type={show ? "text" : "password"}
                              className={`form-control rounded-start-3 shadow-sm ${touched && errors.password ? "is-invalid" : ""}`}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Tu contraseña"
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                            />
                            <button className="btn btn-light rounded-end-3 border" type="button" onClick={() => setShow(s => !s)} style={{ borderColor: PALETTE.border, backgroundColor: "#F8F5F0", color: PALETTE.text }}>
                              <i className={`fas ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="btn w-100 fw-semibold py-2 mb-3" style={{ backgroundColor: PALETTE.main, border: "none", color: "white", borderRadius: "50px" }}>
                          Entrar
                        </button>

                        <div className="mt-3 d-flex flex-column align-items-center gap-2">
                          <p style={{ color: PALETTE.text, fontSize: "0.9rem" }}>O entra con:</p>
                          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} shape="pill" text="signin_with" />
                        </div>

                        <div className="mt-4 d-flex justify-content-between">
                          <button type="button" className="btn btn-link text-decoration-none" onClick={() => { setRecoverMode(true); setRecoverStep("verify"); setErr(null); }} style={{ color: PALETTE.muted, fontSize: "0.9rem" }}>
                            ¿Olvidaste tu contraseña?
                          </button>
                          <button type="button" className="btn btn-link text-decoration-none" onClick={() => router.push("/register")} style={{ color: PALETTE.muted, fontSize: "0.9rem" }}>
                            Registrarme
                          </button>
                        </div>
                      </>
                    )}

                    {/* RECUPERAR */}
                    {recoverMode && (
                      <>
                        {recoverStep === "verify" ? (
                          <div className="mt-3">
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} shape="pill" text="signin_with" />
                            <div className="mt-3 d-flex gap-2 justify-content-center">
                              <button type="button" className="btn btn-outline-secondary" onClick={() => setRecoverMode(false)} style={{ color: PALETTE.text, borderColor: PALETTE.border }}>
                                Volver al inicio
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-3 text-start">
                              <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Nueva contraseña</label>
                              <div className="input-group">
                                <input
                                  type={showNew ? "text" : "password"}
                                  className={`form-control rounded-start-3 shadow-sm ${touched && errors.password ? "is-invalid" : ""}`}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Nueva contraseña"
                                  style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                                />
                                <button type="button" className="btn btn-light rounded-end-3 border" onClick={() => setShowNew(s => !s)} style={{ borderColor: PALETTE.border, backgroundColor: "#F8F5F0", color: PALETTE.text }}>
                                  <i className={`fas ${showNew ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                              </div>
                            </div>

                            <div className="mb-4 text-start">
                              <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Confirmar contraseña</label>
                              <div className="input-group">
                                <input
                                  type={showConfirm ? "text" : "password"}
                                  className={`form-control rounded-start-3 shadow-sm ${touched && errors.confirm ? "is-invalid" : ""}`}
                                  value={confirmPass}
                                  onChange={(e) => setConfirmPass(e.target.value)}
                                  placeholder="Confirmar contraseña"
                                  style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                                />
                                <button type="button" className="btn btn-light rounded-end-3 border" onClick={() => setShowConfirm(s => !s)} style={{ borderColor: PALETTE.border, backgroundColor: "#F8F5F0", color: PALETTE.text }}>
                                  <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                              </div>
                              {touched && errors.confirm && <div className="invalid-feedback d-block">{errors.confirm}</div>}
                            </div>

                            <button type="submit" className="btn w-100 fw-semibold py-2" style={{ backgroundColor: PALETTE.main, border: "none", color: "white", borderRadius: "50px" }}>
                              Guardar nueva contraseña
                            </button>

                            {successMsg && (
                              <div className="mt-3 alert alert-success text-center" style={{ backgroundColor: "#EAF9EA", color: "#2F6E2F", border: "1px solid #BCE2B8" }}>
                                ✅ Contraseña actualizada correctamente
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOAST FLOTANTE */}
        {showToast && (
          <div className="toast-fixed">
            <div className="toast-inner">
              ✅ Contraseña actualizada correctamente
            </div>
          </div>
        )}
      </section>

      {/* -------------------- Estilos / Animaciones -------------------- */}
      <style jsx>{`
        /* small shake for errors */
        .shake { animation: shake 0.45s ease; }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }

        /* toast fixed bottom center */
        .toast-fixed {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 36px;
          z-index: 99999;
          animation: toastIn 0.35s ease;
        }
        .toast-inner {
          background: linear-gradient(90deg, ${PALETTE.main}, #a3734f);
          color: white;
          padding: 12px 22px;
          border-radius: 12px;
          box-shadow: 0 8px 26px rgba(20,10,5,0.18);
          font-weight: 600;
        }
        @keyframes toastIn {
          from { transform: translateX(-50%) translateY(8px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0) ; opacity: 1; }
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}
