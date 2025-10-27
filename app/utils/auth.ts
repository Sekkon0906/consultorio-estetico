import {
  fakeUsers,
  registerUser as addUserToDB,
  findUserByEmail,
  validateUser,
  updateUser,
  User,
} from "./fakeDB";

/* ============================================================
   EVENTO GLOBAL DE SESIÓN Y TOAST
   ============================================================ */

/** Emite un evento global para que Navbar y otros componentes se actualicen */
function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChange"));
  }
}

/** Muestra un mensaje animado de bienvenida (una sola vez por inicio de sesión) */
function showWelcomeToast(name?: string) {
  if (typeof window === "undefined") return;

  const lastShown = sessionStorage.getItem("toastShown");
  if (lastShown === "true") return;
  sessionStorage.setItem("toastShown", "true");

  const existing = document.getElementById("auth-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "auth-toast";

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
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    fontFamily: "'Poppins', sans-serif",
  });

  document.body.appendChild(toast);
  toast.textContent = `Bienvenido${name ? `, ${name}` : ""}!`;

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

export function loginUser(email: string, password: string) {
  const user = validateUser(email, password);
  if (!user) return { ok: false, error: "Credenciales incorrectas." };

  // ⚡ Asegurar que tenga una foto (avatar por defecto)
  if (!user.photo) {
    user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "Usuario"
    )}&background=E6CCB2&color=7F5539`;
  }

  setCurrentUser(user);
  showWelcomeToast(user.name);

  return { ok: true, user };
}

/* ============================================================
   LOGIN CON GOOGLE
   ============================================================ */

export function loginWithGoogle(decodedUser: any) {
  const email = decodedUser.email?.toLowerCase();
  if (!email) return null;

  let user = findUserByEmail(email);

  if (!user) {
    // ⚡ Crear usuario nuevo con avatar por defecto (sin foto de Google)
    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      decodedUser.name || "Usuario Google"
    )}&background=E6CCB2&color=7F5539`;

    user = {
      id: fakeUsers.length + 1,
      name: decodedUser.name || "Usuario Google",
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
      rol: "user",
      photo: defaultPhoto,
    };

    fakeUsers.push(user);
    localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
  } else {
    // ⚡ Si ya existe, forzar a tener avatar por defecto si no tiene
    if (!user.photo) {
      user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name || "Usuario"
      )}&background=E6CCB2&color=7F5539`;
      updateUser(user.id, user);
      localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
    }
  }

  setCurrentUser(user);
  showWelcomeToast(user.name);

  return user;
}

/* ============================================================
   REGISTRO DE NUEVO USUARIO
   ============================================================ */

export function registerUser(
  name: string,
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
  const exists = fakeUsers.some((u) => u.email === email);
  if (exists) return { ok: false, error: "El correo ya está registrado." };

  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Usuario"
  )}&background=E6CCB2&color=7F5539`;

  addUserToDB({
    name,
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
    photo: photo || defaultPhoto,
  });

  return { ok: true };
}

/* ============================================================
   UTILIDADES DE SESIÓN
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

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser");
    emitAuthChange();
  }
}

export function clearCurrentUser() {
  logoutUser();
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("currentUser");
}

export function updateCurrentUser(data: Partial<User>) {
  if (typeof window === "undefined") return;

  const current = getCurrentUser();
  if (!current) return;

  const updatedUser = { ...current, ...data };
  updateUser(updatedUser.id, updatedUser);

  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  emitAuthChange();
}

/* ============================================================
   Tipo base
   ============================================================ */

export type UserData = {
  name: string;
  email: string;
  photo?: string;
};
