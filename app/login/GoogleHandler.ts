// app/login/GoogleHandler.ts
"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { signInWithGooglePopup, auth } from "../utils/firebaseClient";
import { setCurrentUser } from "../utils/auth";

interface ApiUser {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: "user" | "admin" | "medico" | "paciente" | "recepcionista";
  photo?: string | null;
}

interface GoogleHandlerOptions {
  router: AppRouterInstance;
  setErr: (msg: string | null) => void;
}

export async function handleGoogleLogin({
  router,
  setErr,
}: GoogleHandlerOptions): Promise<void> {
  try {
    setErr(null);

    // 1) Login en Firebase con popup
    const firebaseUser = await signInWithGooglePopup();

    // 2) Obtener ID token de Firebase
    const idToken = await firebaseUser.getIdToken();

    // 3) Enviar al backend para crear / obtener usuario en MySQL
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      }
    );

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      console.error("Respuesta /auth/google:", data);
      setErr(data.error || "No se pudo iniciar sesión con Google.");
      return;
    }

    const user: ApiUser = data.user;

    // 4) Guardar usuario en tu sistema local
    setCurrentUser(user); // tu utilidad actual

    // Opcional: recordar usuario 30 días
    const session = {
      ...user,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("rememberUser", JSON.stringify(session));
    }

    // Redirigir a inicio
    router.push("/");
  } catch (err: unknown) {
    console.error("Error en handleGoogleLogin:", err);
    setErr("Error al autenticar con Google. Intenta nuevamente.");
  }
}
