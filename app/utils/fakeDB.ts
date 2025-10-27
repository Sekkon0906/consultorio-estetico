// fakeDB.ts
// Base de datos simulada con persistencia en localStorage

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  edad: number;
  genero: "Masculino" | "Femenino" | "Otro";
  telefono?: string;
  rol: "user" | "admin";

  // Información médica extendida
  antecedentes: string;
  antecedentesDescripcion: string;
  alergias: string;
  alergiasDescripcion: string;
  medicamentos: string;
  medicamentosDescripcion: string;

  // Foto de perfil (puede ser URL o base64)
  photo?: string;
}

// Base de datos local
export let fakeUsers: User[] = [];

// Correos con rol administrador
const adminEmails = [
  "medinapipe123@gmail.com",
  "admin@clinicavm.com",
  "soporte@clinicavm.com",
];

// Cargar desde localStorage
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("fakeUsers");
  if (stored) {
    try {
      fakeUsers = JSON.parse(stored);
    } catch {
      fakeUsers = [];
      localStorage.removeItem("fakeUsers");
    }
  }
}

// Autoincremento de IDs
let nextId =
  fakeUsers.length > 0 ? Math.max(...fakeUsers.map((u) => u.id)) + 1 : 1;

// Guardar cambios
function saveToLocalStorage() {
  if (typeof window !== "undefined") {
    localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
  }
}

/* ============================================================
   REGISTRO DE USUARIO
   ============================================================ */
export function registerUser(userData: Omit<User, "id" | "rol">): User {
  const rol: "user" | "admin" = adminEmails.includes(userData.email)
    ? "admin"
    : "user";

  // 🔸 Siempre asignar un avatar por defecto hasta que el usuario suba uno
  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userData.name || "Usuario"
  )}&background=E6CCB2&color=7F5539`;

  const user: User = {
    id: nextId++,
    ...userData,
    rol,
    photo: defaultPhoto,
  };

  fakeUsers.push(user);
  saveToLocalStorage();
  return user;
}

/* ============================================================
   FUNCIONES DE USUARIO
   ============================================================ */
export function findUserByEmail(email: string): User | undefined {
  return fakeUsers.find((u) => u.email === email);
}

export function validateUser(email: string, password: string): User | null {
  const user = fakeUsers.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}

/* ============================================================
   ACTUALIZAR USUARIO
   ============================================================ */
export function updateUser(id: number, newData: Partial<User>): User | null {
  const index = fakeUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const current = fakeUsers[index];

  // ⚡ Si viene una imagen base64 (subida manual), reemplazar la actual
  if (newData.photo && newData.photo.startsWith("data:image")) {
    current.photo = newData.photo;
  }

  // ⚡ Si el usuario borra la imagen, volver al avatar predeterminado
  if (newData.photo === "") {
    current.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      current.name || "Usuario"
    )}&background=E6CCB2&color=7F5539`;
  }

  fakeUsers[index] = { ...current, ...newData };
  saveToLocalStorage();
  return fakeUsers[index];
}

/* ============================================================
   ELIMINAR / LIMPIAR
   ============================================================ */
export function deleteUser(id: number) {
  fakeUsers = fakeUsers.filter((u) => u.id !== id);
  saveToLocalStorage();
}

export function clearFakeDB() {
  fakeUsers = [];
  nextId = 1;
  saveToLocalStorage();
}
