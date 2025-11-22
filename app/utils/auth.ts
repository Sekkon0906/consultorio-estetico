// utils/auth.ts
"use client";

import {
  usuariosRegistrados,
  registerUser as addUserToDB,
  findUserByEmail,
  validateUser,
  updateUserData,
  getUsers,
  User,
} from "./localDB";

/* ============================================================
   TIPOS
   ============================================================ */

export type UserData = {
  nombres: string;
  apellidos: string;
  email: string;
  photo?: string;
};

/** Datos relevantes que vienen del token de Google */
export interface GoogleDecodedUser {
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

/** Tipo ligero para la sesión en el cliente (来自 API/Google o DB) */
export type SessionUser = {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol?: "user" | "admin" | "medico" | "paciente" | "recepcionista";
  photo?: string | null;
};

/* ============================================================
   EVENTOS GLOBALES Y TOASTS
   ============================================================ */

/** Emite un evento global para actualizar Navbar u otros componentes */
export function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChange"));
  }
}

/** Mensaje animado de bienvenida */
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

  // Permite que vuelva a mostrarse en una nueva sesión de pestaña
  setTimeout(() => {
    sessionStorage.removeItem("toastShown");
  }, 1500);
}

/* ============================================================
   LOGIN MANUAL
   ============================================================ */

export function loginUser(
  email: string,
  password: string,
  remember = false
): { ok: boolean; error?: string; user?: User } {
  const user = validateUser(email, password);
  if (!user) return { ok: false, error: "Credenciales incorrectas." };

  if (!user.photo) {
    user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user.nombres} ${user.apellidos}`
    )}&background=E6CCB2&color=7F5539`;
  }

  setCurrentUser(user);

  if (remember) {
    localStorage.setItem("rememberUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("rememberUser");
  }

  showWelcomeToast(user.nombres);
  return { ok: true, user };
}

/* ============================================================
   LOGIN CON GOOGLE (desde token decodificado en el cliente)
   ============================================================ */

export function loginWithGoogle(
  decodedUser: GoogleDecodedUser,
  remember = false
): SessionUser | User | null {
  const email = decodedUser.email?.toLowerCase();
  if (!email) return null;

  let user = findUserByEmail(email);

  if (!user) {
    // ✅ Usamos el tipo de entrada que espera addUserToDB para evitar exigir id/rol
    type RegisterInput = Parameters<typeof addUserToDB>[0];

    const nuevo: RegisterInput = {
      nombres: decodedUser.given_name || decodedUser.name || "Usuario Google",
      apellidos: decodedUser.family_name || "",
      email,
      password: "",
      edad: 0,
      genero: "Otro",
      telefono: "",
      antecedentes: "",
      antecedentesDescripcion: "",
      alergias: "",
      alergiasDescripcion: "",
      medicamentos: "",
      medicamentosDescripcion: "",
      photo: decodedUser.picture || null,
      rol: "user", // ✅ asignamos un rol por defecto
    };

    // addUserToDB ya devuelve un User con id y rol
    user = addUserToDB(nuevo);
  } else if (!user.photo) {
    user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user.nombres} ${user.apellidos}`
    )}&background=E6CCB2&color=7F5539`;
    updateUserData({ photo: user.photo }, user.email);
  }

  setCurrentUser(user);

  if (remember) {
    localStorage.setItem("rememberUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("rememberUser");
  }

  showWelcomeToast(user.nombres);
  return user;
}

/* ============================================================
   REGISTRO DE NUEVO USUARIO
   ============================================================ */

export function registerUser(
  nombres: string,
  apellidos: string,
  email: string,
  password: string,
  telefono: string,
  edad: number,
  genero: "Masculino" | "Femenino" | "Otro",
  antecedentes: string,
  antecedentesDescripcion: string,
  alergias: string,
  alergiasDescripcion: string,
  medicamentos: string,
  medicamentosDescripcion: string,
  photo?: string
): { ok: boolean; error?: string } {
  const exists = getUsers().some((u) => u.email === email);
  if (exists) return { ok: false, error: "El correo ya está registrado." };

  const nuevo: User = {
    nombres,
    apellidos,
    email,
    password,
    edad,
    genero,
    telefono,
    antecedentes,
    antecedentesDescripcion,
    alergias,
    alergiasDescripcion,
    medicamentos,
    medicamentosDescripcion,
    photo,
  };

  addUserToDB(nuevo);
  return { ok: true };
}

/* ============================================================
   SESIÓN ACTUAL Y RECORDADA (flexible para SessionUser | User)
   ============================================================ */

/** Guarda el usuario actual en localStorage (SessionUser o User) */
export function setCurrentUser(user: SessionUser | User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("currentUser", JSON.stringify(user));
  emitAuthChange();
}

/** Devuelve el usuario actual desde localStorage */
export function getCurrentUser(): (SessionUser | User) | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("currentUser");
  return data ? (JSON.parse(data) as SessionUser | User) : null;
}

/** Restaura una sesión recordada (si la usas para "recuérdame") */
export function restoreRememberedSession(): (SessionUser | User) | null {
  if (typeof window === "undefined") return null;
  const remembered = localStorage.getItem("rememberUser");
  return remembered ? (JSON.parse(remembered) as SessionUser | User) : null;
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("currentUser");
  localStorage.removeItem("rememberUser");
  emitAuthChange();
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser");
    emitAuthChange();
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("currentUser");
}

/**
 * Actualiza el usuario actual:
 * - Si es un User completo (tiene `password`), también lo persiste en tu DB local con `updateUserData`.
 * - Si es un SessionUser (ligero, p.ej. traído desde tu API/Google), solo actualiza el localStorage.
 */
export function updateCurrentUser(data: Partial<User>) {
  if (typeof window === "undefined") return;
  const current = getCurrentUser();
  if (!current) return;

  // Usuario ligero (no tiene 'password'): solo actualiza la sesión en localStorage.
  if (!("password" in current)) {
    const updated = { ...current, ...data } as SessionUser;
    localStorage.setItem("currentUser", JSON.stringify(updated));
    emitAuthChange();
    return;
  }

  // Usuario completo (flujo localDB)
  const updated: User = { ...current, ...(data as Partial<User>) } as User;
  updateUserData(updated, current.email);
  localStorage.setItem("currentUser", JSON.stringify(updated));
  emitAuthChange();
}
