"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FondoAnim from "@/components/FondoAnim";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginForm from "./LoginForm";
import { PALETTE } from "./palette2";
import { setCurrentUser } from "../utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  // Recuperar sesión si se marcó "Recordarme"
  useEffect(() => {
    const saved = localStorage.getItem("rememberUser");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt > Date.now()) {
        setCurrentUser(parsed);
        router.push("/");
      } else {
        localStorage.removeItem("rememberUser");
      }
    }
  }, [router]);

  return (
    <GoogleOAuthProvider clientId="238138002993-ahevug4qtspj0jpmo7jvr6rjhm485lh0.apps.googleusercontent.com">
      <section
        className="py-5 position-relative"
        style={{
          background: "linear-gradient(180deg,#FAF9F7 0%,#F1E9E0 100%)",
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
                className={`card border-0 shadow-lg rounded-4 ${
                  err ? "shake" : ""
                }`}
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
                    Iniciar sesión
                  </h1>

                  <p
                    className="text-muted mb-4"
                    style={{ color: PALETTE.muted, fontSize: "0.95rem" }}
                  >
                    Ingresa tus credenciales para ingresar y disfrutar de todo lo
                    que ofrecemos.
                  </p>

                  {err && (
                    <div
                      className="alert alert-danger text-center"
                      style={{
                        backgroundColor: "#FCEAEA",
                        color: "#8C2B2B",
                        border: "1px solid #E3B4A0",
                      }}
                    >
                      {err}
                    </div>
                  )}

                  <LoginForm setErr={setErr} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .shake {
          animation: shake 0.45s ease;
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}
