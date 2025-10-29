import {
  usuariosRegistrados,
  createUser,
  findUserByEmail,
  validateUser,
  updateUserData,
  User,
} from "./localDB";

/* ============================================================
   EVENTOS Y TOAST DE SESIÓN
   ============================================================ */

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChange"));
  }
}

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

  if (!user.photo) {
    user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.nombres || "Usuario"
    )}&background=E6CCB2&color=7F5539`;
  }

  setCurrentUser(user);
  showWelcomeToast(user.nombres);

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
    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      decodedUser.name || "Usuario Google"
    )}&background=E6CCB2&color=7F5539`;

    user = createUser({
      nombres: decodedUser.name || "Usuario Google",
      apellidos: "",
      email,
      password: "",
      telefono: "",
      edad: 0,
      genero: "Otro",
      antecedentes: "",
      antecedentesDescripcion: "",
      alergias: "",
      alergiasDescripcion: "",
      medicamentos: "",
      medicamentosDescripcion: "",
      photo: defaultPhoto,
    });
  } else {
    // Si ya existía, pero no tenía foto guardada
    if (!user.photo) {
      user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.nombres || "Usuario"
      )}&background=E6CCB2&color=7F5539`;

      // ✅ se usa correctamente el email
      updateUserData({ photo: user.photo }, user.email);
    }
  }

  if (user) {
    setCurrentUser(user);
    showWelcomeToast(user.nombres);
  }

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
  const exists = usuariosRegistrados.some((u) => u.email === email);
  if (exists) return { ok: false, error: "El correo ya está registrado." };

  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nombres || "Usuario"
  )}&background=E6CCB2&color=7F5539`;

  try {
    createUser({
      nombres,
      apellidos,
      email,
      password,
      telefono,
      edad,
      genero,
      antecedentes,
      antecedentesDescripcion,
      alergias,
      alergiasDescripcion,
      medicamentos,
      medicamentosDescripcion,
      photo: photo || defaultPhoto,
    });
  } catch (err: any) {
    return { ok: false, error: err.message || "Error creando el usuario." };
  }

  return { ok: true };
}

/* ============================================================
   SESIÓN Y UTILIDADES
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

/** ✅ versión final corregida */
export function updateCurrentUser(data: Partial<User>) {
  if (typeof window === "undefined") return;

  const current = getCurrentUser();
  if (!current) return;

  const updatedUserData = { ...current, ...data };

  // ✅ llamada correcta según localDB.ts
  updateUserData(updatedUserData, updatedUserData.email);

  localStorage.setItem("currentUser", JSON.stringify(updatedUserData));
  emitAuthChange();
}

/* ============================================================
   SESIÓN PERSISTENTE (RECORDAR 30 DÍAS)
   ============================================================ */

export function restoreRememberedSession(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const remembered = localStorage.getItem("rememberUser");
    if (!remembered) return null;

    const parsed = JSON.parse(remembered);

    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem("rememberUser");
      return null;
    }

    localStorage.setItem("currentUser", JSON.stringify(parsed));
    window.dispatchEvent(new Event("authChange"));
    return parsed;
  } catch (err) {
    console.warn("Error restaurando sesión recordada:", err);
    localStorage.removeItem("rememberUser");
    return null;
  }
}

/* ============================================================
   TIPO BASE
   ============================================================ */

export type UserData = {
  nombres: string;
  email: string;
  photo?: string;
};
