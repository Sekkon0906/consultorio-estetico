// utils/auth.ts
"use client";

import { auth } from "./firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";

// Importamos el tipo de dominio y lo re-exportamos para no romper imports antiguos
import type { SessionUser as DomainSessionUser } from "../types/domain";
export type SessionUser = DomainSessionUser;

/* ============================================================
   TIPOS AUXILIARES (por si hay componentes que los usan aún)
   ============================================================ */

export type UserData = {
  nombres: string;
  apellidos: string;
  email: string;
  photo?: string;
};

/** Datos relevantes que podrían venir de Google (legacy) */
export interface GoogleDecodedUser {
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

/* ============================================================
   CONFIG
   ============================================================ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const REMEMBER_KEY = "rememberUser";
const CURRENT_KEY = "currentUser";

/* ============================================================
   EVENTOS GLOBALES Y TOASTS
   ============================================================ */

export function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChange"));
  }
}

function showWelcomeToast(nombre?: string) {
  if (typeof window === "undefined") return;

  const alreadyShown = sessionStorage.getItem("toastShown");
  if (alreadyShown === "true") return;
  sessionStorage.setItem("toastShown", "true");

  const toast = document.createElement("div");
  toast.id = "auth-toast";
  toast.textContent = `Bienvenido${nombre ? `, ${nombre}` : ""}!`;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: "linear-gradient(90deg, #b08968, #d6ad85)",
    color: "#fff",
    padding: "14px 26px",
    borderRadius: "14px",
    fontWeight: "600",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    opacity: "0",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    zIndex: "9999",
  } as Partial<CSSStyleDeclaration>);

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 500);
  }, 3000);

  setTimeout(() => {
    sessionStorage.removeItem("toastShown");
  }, 1500);
}

/* ============================================================
   SESIÓN LOCAL (SessionUser)
   ============================================================ */

export function setCurrentUser(user: SessionUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  emitAuthChange();
}

export function getCurrentUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CURRENT_KEY);
  return data ? (JSON.parse(data) as SessionUser) : null;
}

/** Guarda el usuario recordado 30 días */
export function saveRememberedUser(user: SessionUser) {
  if (typeof window === "undefined") return;
  const session = {
    ...user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 días
  };
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(session));
}

/** Carga el usuario recordado (si no ha expirado) */
export function loadRememberedUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(REMEMBER_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SessionUser & { expiresAt?: number };
    if (data.expiresAt && data.expiresAt < Date.now()) {
      localStorage.removeItem(REMEMBER_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(REMEMBER_KEY);
    return null;
  }
}

/** Alias para compatibilidad con código viejo */
export function restoreRememberedSession(): SessionUser | null {
  return loadRememberedUser();
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  emitAuthChange();
}

export function logoutUser() {
  clearCurrentUser();
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(CURRENT_KEY);
}

export function updateCurrentUser(data: Partial<SessionUser>) {
  if (typeof window === "undefined") return;
  const current = getCurrentUser();
  if (!current) return;
  const updated: SessionUser = { ...current, ...data };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(updated));
  emitAuthChange();
}

/* ============================================================
   HELPER: sincronizar Firebase ↔ backend MySQL
   (usa /auth/google, que sirve para cualquier idToken)
   ============================================================ */

async function syncWithBackend(firebaseUser: FirebaseUser): Promise<SessionUser> {
  const idToken = await firebaseUser.getIdToken();

  const resp = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data = await resp.json();

  if (!resp.ok || !data.ok) {
    console.error("Respuesta /auth/google:", data);
    throw new Error(data.error || "No se pudo sincronizar el usuario.");
  }

  return data.user as SessionUser;
}

/* ============================================================
   LOGIN CON EMAIL Y CONTRASEÑA (Firebase + backend)
   ============================================================ */

export async function loginUser(
  email: string,
  password: string,
  remember = false
): Promise<{ ok: boolean; error?: string; user?: SessionUser }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const sessionUser = await syncWithBackend(cred.user);

    setCurrentUser(sessionUser);
    if (remember) saveRememberedUser(sessionUser);
    showWelcomeToast(sessionUser.nombres);

    return { ok: true, user: sessionUser };
  } catch (err: unknown) {
    console.error("Error loginUser:", err);

    const errorMessage =
      err instanceof Error ? err.message : "No se pudo iniciar sesión.";

    return {
      ok: false,
      error: errorMessage,
    };
  }
}

/* ============================================================
   REGISTRO CON EMAIL Y CONTRASEÑA (Firebase + backend)
   ============================================================ */

export async function registerUser(
  nombres: string,
  apellidos: string,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: SessionUser }> {
  try {
    // 1) Crear cuenta en Firebase
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2) Guardar nombre completo en Firebase (para que llegue como displayName)
    try {
      await updateProfile(cred.user, {
        displayName: `${nombres} ${apellidos}`.trim(),
      });
    } catch (e) {
      console.warn("No se pudo actualizar displayName en Firebase:", e);
    }

    // 3) Sincronizar con backend (crea fila en 'usuarios' si no existe)
    const sessionUser = await syncWithBackend(cred.user);

    // 4) Guardar en sesión local
    setCurrentUser(sessionUser);
    saveRememberedUser(sessionUser);
    showWelcomeToast(sessionUser.nombres);

    return { ok: true, user: sessionUser };
  } catch (err: unknown) {
    console.error("Error registerUser:", err);

    const errorMessage =
      err instanceof Error ? err.message : "No se pudo registrar el usuario.";

    return {
      ok: false,
      error: errorMessage,
    };
  }
}
