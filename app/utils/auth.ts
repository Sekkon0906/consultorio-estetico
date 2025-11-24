// utils/auth.ts
"use client";

// YA NO usamos auth de Firebase para email+password.
// Todo el login/registro con correo va contra la API propia.

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
   LOGIN CON EMAIL Y CONTRASEÑA  (API propia, NO Firebase)
   ============================================================ */

export async function loginUser(
  email: string,
  password: string,
  remember = false
): Promise<{ ok: boolean; error?: string; user?: SessionUser }> {
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || "No se pudo iniciar sesión.",
      };
    }

    const sessionUser = data.user as SessionUser;

    setCurrentUser(sessionUser);
    if (remember) saveRememberedUser(sessionUser);
    showWelcomeToast(sessionUser.nombres);

    return { ok: true, user: sessionUser };
  } catch (err) {
    console.error("Error loginUser (frontend):", err);
    return {
      ok: false,
      error: "Error de conexión al iniciar sesión.",
    };
  }
}

/* ============================================================
   REGISTRO CON EMAIL Y CONTRASEÑA (API propia, NO Firebase)
   ============================================================ */

export async function registerUser(
  nombres: string,
  apellidos: string,
  email: string,
  password: string,
  extra?: {
    telefono?: string;
    edad?: number;
    genero?: string;
    antecedentes?: string;
    antecedentesDescripcion?: string;
    alergias?: string;
    alergiasDescripcion?: string;
    medicamentos?: string;
    medicamentosDescripcion?: string;
  }
): Promise<{ ok: boolean; error?: string; user?: SessionUser }> {
  try {
    const payload = {
      nombres,
      apellidos,
      email,
      password,
      telefono: extra?.telefono ?? null,
      edad: extra?.edad ?? null,
      genero: extra?.genero ?? null,
      antecedentes: extra?.antecedentes ?? null,
      antecedentesDescripcion: extra?.antecedentesDescripcion ?? null,
      alergias: extra?.alergias ?? null,
      alergiasDescripcion: extra?.alergiasDescripcion ?? null,
      medicamentos: extra?.medicamentos ?? null,
      medicamentosDescripcion: extra?.medicamentosDescripcion ?? null,
    };

    const resp = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || "No se pudo registrar el usuario.",
      };
    }

    const sessionUser = data.user as SessionUser;

    setCurrentUser(sessionUser);
    saveRememberedUser(sessionUser);
    showWelcomeToast(sessionUser.nombres);

    return { ok: true, user: sessionUser };
  } catch (err) {
    console.error("Error registerUser (frontend):", err);
    return {
      ok: false,
      error: "Error de conexión al registrar usuario.",
    };
  }
}
