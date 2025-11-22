// app/login/GoogleHandler.ts
"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { signInWithGooglePopup } from "../utils/firebaseClient";
import { setCurrentUser, type SessionUser } from "../utils/auth";
import type { CredentialResponse } from "@react-oauth/google";

interface ApiUser {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: "user" | "admin" | "medico" | "paciente" | "recepcionista";
  photo?: string | null;
}

interface ApiResponse {
  ok: boolean;
  user?: ApiUser;
  error?: string;
}

export interface GoogleHandlerOptions {
  router: AppRouterInstance;
  setErr: (msg: string | null) => void;
}

/* ============================
   Util compartida
   ============================ */

function toSessionUser(apiUser: ApiUser): SessionUser {
  const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${apiUser.nombres} ${apiUser.apellidos}`
  )}&background=E6CCB2&color=7F5539`;

  return {
    id: apiUser.id,
    nombres: apiUser.nombres,
    apellidos: apiUser.apellidos,
    email: apiUser.email,
    telefono: apiUser.telefono,
    rol: apiUser.rol,
    photo: apiUser.photo ?? fallbackPhoto,
  };
}

async function postGoogleToken(idToken: string): Promise<ApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_API_BASE_URL en variables de entorno.");
  }

  const resp = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!resp.ok) {
    const errJson = await safeJson(resp);
    return {
      ok: false,
      error:
        (hasErrorField(errJson) && errJson.error) ||
        `HTTP ${resp.status} ${resp.statusText}`,
    };
  }

  return (await resp.json()) as ApiResponse;
}

function persistSession(user: SessionUser) {
  setCurrentUser(user);
  if (typeof window !== "undefined") {
    const session = {
      ...user,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
    localStorage.setItem("rememberUser", JSON.stringify(session));
  }
}

async function safeJson(resp: Response): Promise<unknown | null> {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}
function hasErrorField(value: unknown): value is { error?: string } {
  return typeof value === "object" && value !== null && "error" in value;
}

/* ============================
   1) Firebase Popup
   ============================ */
export async function handleGoogleLogin({
  router,
  setErr,
}: GoogleHandlerOptions): Promise<void> {
  try {
    setErr(null);

    const firebaseUser = await signInWithGooglePopup();
    const idToken = await firebaseUser.getIdToken();

    const data = await postGoogleToken(idToken);
    if (!data.ok || !data.user) {
      setErr(data.error || "No se pudo iniciar sesión con Google.");
      return;
    }

    const sessionUser = toSessionUser(data.user);
    persistSession(sessionUser);
    router.push("/");
  } catch (err) {
    console.error("Error en handleGoogleLogin:", err);
    setErr(
      err instanceof Error
        ? err.message
        : "Error al autenticar con Google. Intenta nuevamente."
    );
  }
}

/* ============================
   2) Google One Tap / <GoogleLogin />
   ============================ */
/**
 * Úsalo con el componente <GoogleLogin onSuccess={(cr)=>handleGoogleSuccess(cr,{router,setErr})} />
 */
export async function handleGoogleSuccess(
  credentialResponse: CredentialResponse,
  { router, setErr }: GoogleHandlerOptions
): Promise<void> {
  try {
    setErr(null);

    const idToken = credentialResponse.credential;
    if (!idToken) {
      setErr("No se recibió el token de Google.");
      return;
    }

    const data = await postGoogleToken(idToken);
    if (!data.ok || !data.user) {
      setErr(data.error || "No se pudo iniciar sesión con Google.");
      return;
    }

    const sessionUser = toSessionUser(data.user);
    persistSession(sessionUser);
    router.push("/");
  } catch (err) {
    console.error("Error en handleGoogleSuccess:", err);
    setErr(
      err instanceof Error
        ? err.message
        : "Error al autenticar con Google. Intenta nuevamente."
    );
  }
}
