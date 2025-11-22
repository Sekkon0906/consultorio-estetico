// app/login/GoogleHandler.ts
"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { signInWithGooglePopup } from "../utils/firebaseClient";
import { setCurrentUser, type SessionUser } from "../utils/auth";

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
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error(
        "Falta NEXT_PUBLIC_API_BASE_URL en variables de entorno."
      );
    }

    const resp = await fetch(`${baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    // Manejo de respuestas no-2xx
    if (!resp.ok) {
      const errJson = await safeJson(resp);
      console.error("Respuesta /auth/google (HTTP error):", errJson || resp.statusText);
      setErr((errJson as any)?.error || "No se pudo iniciar sesión con Google.");
      return;
    }

    const data = (await resp.json()) as { ok: boolean; user?: ApiUser; error?: string };

    if (!data.ok || !data.user) {
      console.error("Respuesta /auth/google:", data);
      setErr(data.error || "No se pudo iniciar sesión con Google.");
      return;
    }

    const apiUser = data.user;

    // 4) Mapear ApiUser -> SessionUser y asegurar foto
    const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${apiUser.nombres} ${apiUser.apellidos}`
    )}&background=E6CCB2&color=7F5539`;

    const sessionUser: SessionUser = {
      id: apiUser.id,
      nombres: apiUser.nombres,
      apellidos: apiUser.apellidos,
      email: apiUser.email,
      telefono: apiUser.telefono,
      rol: apiUser.rol,
      photo: apiUser.photo ?? fallbackPhoto,
    };

    // Guardar usuario en tu sistema local (session flexible)
    setCurrentUser(sessionUser);

    // Opcional: recordar usuario 30 días
    const session = {
      ...sessionUser,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("rememberUser", JSON.stringify(session));
    }

    // 5) Redirigir a inicio
    router.push("/");
  } catch (err: unknown) {
    console.error("Error en handleGoogleLogin:", err);
    setErr(
      err instanceof Error
        ? err.message
        : "Error al autenticar con Google. Intenta nuevamente."
    );
  }
}

/** Intenta parsear JSON sin lanzar excepción si falla. */
async function safeJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}
