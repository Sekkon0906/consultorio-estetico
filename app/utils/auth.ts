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
  });

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
   LOGIN MANUAL
   ============================================================ */

export function loginUser(email: string, password: string, remember = false) {
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
   LOGIN CON GOOGLE
   ============================================================ */

export function loginWithGoogle(
  decodedUser: GoogleDecodedUser,
  remember = false
) {
  const email = decodedUser.email?.toLowerCase();
  if (!email) return null;

  let user = findUserByEmail(email);

  if (!user) {
    const nuevo = {
      nombres: decodedUser.given_name || decodedUser.name || "Usuario Google",
      apellidos: decodedUser.family_name || "",
      email,
      password: "",
      edad: 0,
      genero: "Otro" as const,
      telefono: "",
      antecedentes: "",
      antecedentesDescripcion: "",
      alergias: "",
      alergiasDescripcion: "",
      medicamentos: "",
      medicamentosDescripcion: "",
      photo: decodedUser.picture || null,
    };
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

  const nuevo = {
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
   SESIÓN ACTUAL Y RECORDADA
   ============================================================ */

export function setCurrentUser(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("currentUser", JSON.stringify(user));
  emitAuthChange();
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("currentUser");
  return data ? (JSON.parse(data) as User) : null;
}

export function restoreRememberedSession(): User | null {
  if (typeof window === "undefined") return null;
  const remembered = localStorage.getItem("rememberUser");
  return remembered ? (JSON.parse(remembered) as User) : null;
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

export function updateCurrentUser(data: Partial<User>) {
  if (typeof window === "undefined") return;
  const current = getCurrentUser();
  if (!current) return;
  const updated: User = { ...current, ...data };
  updateUserData(updated, current.email);
  localStorage.setItem("currentUser", JSON.stringify(updated));
  emitAuthChange();
}
