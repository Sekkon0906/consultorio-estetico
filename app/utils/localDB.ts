// ============================================================
// localDB.ts — Base de datos simulada con persistencia local
// ============================================================

// ==========================
// MODELO USUARIO
// ==========================
export interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  edad: number;
  genero: "Masculino" | "Femenino" | "Otro";
  telefono?: string;
  rol: "user" | "admin";
  antecedentes: string;
  antecedentesDescripcion: string;
  alergias: string;
  alergiasDescripcion: string;
  medicamentos: string;
  medicamentosDescripcion: string;
  photo?: string | null;
  creadoEn?: string;
  citasAgendadas?: Cita[];
}

// ==========================
// INICIALIZACIÓN USUARIOS
// ==========================
export let usuariosRegistrados: User[] = [];

const correosAdmin = [
  "medinapipe123@gmail.com",
  "admin@clinicavm.com",
  "soporte@clinicavm.com",
];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("usuariosRegistrados");
  if (stored) {
    try {
      usuariosRegistrados = JSON.parse(stored);
    } catch {
      usuariosRegistrados = [];
      localStorage.removeItem("usuariosRegistrados");
    }
  }
}

let nextUserId =
  usuariosRegistrados.length > 0
    ? Math.max(...usuariosRegistrados.map((u) => u.id)) + 1
    : 1;

function saveUsuarios() {
  if (typeof window !== "undefined") {
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
  }
}

// ============================================================
// REGISTRO / LOGIN / ACTUALIZACIÓN
// ============================================================

export function registerUser(
  userData: Omit<User, "id" | "rol" | "creadoEn" | "citasAgendadas">
): User {
  const rol: "user" | "admin" = correosAdmin.includes(userData.email) ? "admin" : "user";

  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    (userData.nombres + " " + userData.apellidos).trim() || "Usuario"
  )}&background=E6CCB2&color=7F5539`;

  const user: User = {
    id: nextUserId++,
    ...userData,
    rol,
    photo: userData.photo || defaultPhoto,
    creadoEn: new Date().toISOString(),
    citasAgendadas: [],
  };

  usuariosRegistrados.push(user);
  saveUsuarios();
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return usuariosRegistrados.find((u) => u.email === email);
}

export function validateUser(email: string, password: string): User | null {
  const user = usuariosRegistrados.find((u) => u.email === email && u.password === password);
  return user || null;
}

export function createUser(
  nuevoUsuario: Omit<User, "id" | "rol" | "creadoEn" | "citasAgendadas">
) {
  const existe = usuariosRegistrados.find((u) => u.email === nuevoUsuario.email);
  if (existe) throw new Error("Ya existe un usuario con este correo electrónico.");

  const rol: "user" | "admin" = correosAdmin.includes(nuevoUsuario.email) ? "admin" : "user";

  const user: User = {
    id: nextUserId++,
    ...nuevoUsuario,
    rol,
    creadoEn: new Date().toISOString(),
    citasAgendadas: [],
  };

  usuariosRegistrados.push(user);
  saveUsuarios();
  return user;
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("usuariosRegistrados");
  return stored ? (JSON.parse(stored) as User[]) : [];
}

export function updateUserData(newData: Partial<User>, email: string) {
  if (typeof window === "undefined") return;
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx !== -1) users[idx] = { ...users[idx], ...newData };
  localStorage.setItem("usuariosRegistrados", JSON.stringify(users));
}

// ============================================================
// MODELO CITAS 
// ============================================================
export interface Cita {
  id: number;
  userId: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  procedimiento: string;
  tipoCita: "valoracion" | "implementacion";
  nota?: string;
  fecha: string;
  hora: string;
  metodoPago?: "Consultorio" | "Online" | null;
  tipoPagoConsultorio?: "Efectivo" | "Tarjeta" | null;
  tipoPagoOnline?: "PayU" | "PSE" | null;
  pagado: boolean;
  creadaPor: "usuario" | "doctora";
  fechaCreacion: string;
  estado?: "programada" | "cancelada" | "atendida";
}

export let citasAgendadas: Cita[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("citasAgendadas");
  if (stored) {
    try {
      citasAgendadas = JSON.parse(stored);
    } catch {
      citasAgendadas = [];
      localStorage.removeItem("citasAgendadas");
    }
  }
}

let nextCitaId =
  citasAgendadas.length > 0 ? Math.max(...citasAgendadas.map((c) => c.id)) + 1 : 1;

function saveCitas() {
  localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
}

export function crearCita(
  citaData: Omit<Cita, "id" | "pagado" | "fechaCreacion" | "tipoCita" | "creadaPor">
): Cita {
  const cita: Cita = {
    id: nextCitaId++,
    ...citaData,
    tipoCita: citaData.procedimiento.includes("valoración")
      ? "valoracion"
      : "implementacion",
    pagado: false,
    creadaPor: "usuario",
    fechaCreacion: new Date().toISOString(),
    estado: "programada",
  };
  citasAgendadas.push(cita);
  saveCitas();
  return cita;
}

export function getCitas(): Cita[] {
  return [...citasAgendadas];
}

export function getCitaById(id: number): Cita | undefined {
  return citasAgendadas.find((c) => c.id === id);
}

export function updateCita(id: number, data: Partial<Cita>) {
  const index = citasAgendadas.findIndex((c) => c.id === id);
  if (index !== -1) {
    citasAgendadas[index] = { ...citasAgendadas[index], ...data };
    localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
  }
}

export function getCitasByUser(userId: number): Cita[] {
  return citasAgendadas.filter((c) => c.userId === userId);
}

export function getCitasByDay(fechaISO: string): Cita[] {
  return citasAgendadas.filter((c) => c.fecha.slice(0, 10) === fechaISO);
}

export function getCitasByMonth(year: number, monthIdx: number): Cita[] {
  return citasAgendadas.filter((c) => {
    const d = new Date(c.fecha);
    return d.getFullYear() === year && d.getMonth() === monthIdx;
  });
}

export function marcarCitaPagada(id: number) {
  const cita = citasAgendadas.find((c) => c.id === id);
  if (cita) {
    cita.pagado = true;
    saveCitas();
  }
}

export function deleteCita(id: number) {
  citasAgendadas = citasAgendadas.filter((c) => c.id !== id);
  saveCitas();
}

// ============================================================
// 🔧 EXTENSIONES ADICIONALES PARA PANEL ADMINISTRATIVO
// ============================================================

// =====================
// 🔹 BLOQUEO DE HORAS
// =====================
// ============================================================
// BLOQUEOS DE HORAS — Sistema persistente
// ============================================================

export interface BloqueoHora {
  fechaISO: string; // formato YYYY-MM-DD
  hora: string; // Ejemplo: "10:00 AM"
  motivo: string;
}

export let bloqueos: BloqueoHora[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("bloqueos");
  if (stored) {
    try {
      bloqueos = JSON.parse(stored);
    } catch {
      bloqueos = [];
      localStorage.removeItem("bloqueos");
    }
  }
}

function saveBloqueos() {
  if (typeof window !== "undefined") {
    localStorage.setItem("bloqueos", JSON.stringify(bloqueos));
  }
}

/** Agregar bloqueo */
export function addBloqueo(b: BloqueoHora) {
  bloqueos.push(b);
  saveBloqueos();
}

/** Eliminar bloqueo */
export function removeBloqueo(fechaISO: string, hora: string) {
  bloqueos = bloqueos.filter((b) => !(b.fechaISO === fechaISO && b.hora === hora));
  saveBloqueos();
}

/** Obtener bloqueos por fecha */
export function getBloqueosPorFecha(fechaISO: string): BloqueoHora[] {
  return bloqueos.filter((b) => b.fechaISO === fechaISO);
}

/** Verificar si una hora está bloqueada */
export function isHoraBloqueada(fechaISO: string, hora: string): boolean {
  return bloqueos.some((b) => b.fechaISO === fechaISO && b.hora === hora);
}


// =====================
// 💰 INGRESOS Y PAGOS
// =====================

/**
 * Retorna todas las citas pagadas del mes seleccionado.
 */
export function getCitasPagadasMes(year: number, monthIdx: number): Cita[] {
  return getCitasByMonth(year, monthIdx).filter((c) => c.pagado);
}

/**
 * Retorna todas las citas pagadas online.
 */
export function getPagosOnline(): Cita[] {
  return citasAgendadas.filter((c) => c.metodoPago === "Online" && c.pagado);
}

/**
 * Calcula totales mensuales:
 * - totalOnline
 * - totalConsultorio
 * - totalEsperado
 */
export function getTotalesMes(year: number, monthIdx: number) {
  const citas = getCitasByMonth(year, monthIdx);
  const parsePrecio = (valor: string) => {
    const num = parseInt(valor.replace(/[^\d]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const totalOnline = citas
    .filter((c) => c.pagado && c.metodoPago === "Online")
    .reduce((acc, c) => acc + parsePrecio(String(c.procedimiento)), 0);

  const totalConsultorio = citas
    .filter((c) => c.pagado && c.metodoPago === "Consultorio")
    .reduce((acc, c) => acc + parsePrecio(String(c.procedimiento)), 0);

  const totalEsperado = citas.reduce(
    (acc, c) => acc + parsePrecio(String(c.procedimiento)),
    0
  );

  return { totalOnline, totalConsultorio, totalEsperado };
}

// =====================
// 💵 CONFIGURACIÓN DE VALOR CONSULTA GENERAL
// =====================

/**
 * Permite almacenar un valor base editable para la "consulta general".
 * Se guarda en localStorage como "valorConsultaGeneral".
 */
export function setValorConsultaGeneral(valor: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem("valorConsultaGeneral", valor.toString());
  }
}

export function getValorConsultaGeneral(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("valorConsultaGeneral");
  return stored ? parseInt(stored) || 0 : 0;
}

// =====================
// 💵 FORMATO DE MONEDA
// =====================
export function formatCurrency(valor: number): string {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
}


// ============================================================
// CRUD DE PROCEDIMIENTOS + GALERÍA
// ============================================================
export type CategoriaProcedimiento = "Facial" | "Corporal" | "Capilar";
export type MediaType = "imagen" | "video";

export interface MediaItem {
  id: string;
  tipo: MediaType;
  url: string;
  titulo?: string;
  descripcion?: string;
}

export interface Procedimiento {
  id: number;
  nombre: string;
  desc: string;
  precio: number | string;
  imagen: string;
  categoria: CategoriaProcedimiento;
  duracionMin?: number;
  destacado?: boolean;
  galeria?: MediaItem[];
}

export let procedimientos: Procedimiento[] = [];
const DB_VERSION = 3;

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("procedimientos");
  const version = localStorage.getItem("procedimientos_version");
  if (stored && version === String(DB_VERSION)) {
    procedimientos = JSON.parse(stored);
  } else {
    localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
    localStorage.setItem("procedimientos_version", String(DB_VERSION));
  }
}

let nextProcId =
  procedimientos.length > 0 ? Math.max(...procedimientos.map((p) => p.id)) + 1 : 1;

function saveProcedimientos() {
  localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
  localStorage.setItem("procedimientos_version", String(DB_VERSION));
}

export function getProcedimientos(): Procedimiento[] {
  return JSON.parse(JSON.stringify(procedimientos));
}

export function getProcedimientoById(id: number): Procedimiento | undefined {
  return procedimientos.find((p) => p.id === id);
}

export function addProcedimiento(data: Omit<Procedimiento, "id">): Procedimiento {
  const nuevo: Procedimiento = { id: nextProcId++, ...data };
  procedimientos.push(nuevo);
  saveProcedimientos();
  return nuevo;
}

export function updateProcedimiento(id: number, data: Partial<Procedimiento>): Procedimiento | null {
  const idx = procedimientos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  procedimientos[idx] = { ...procedimientos[idx], ...data };
  saveProcedimientos();
  return procedimientos[idx];
}

export function deleteProcedimiento(id: number): boolean {
  const before = procedimientos.length;
  procedimientos = procedimientos.filter((p) => p.id !== id);
  const after = procedimientos.length;
  if (before !== after) saveProcedimientos();
  return before !== after;
}

export function addMediaToProcedimiento(procId: number, media: MediaItem): Procedimiento | null {
  const proc = procedimientos.find((p) => p.id === procId);
  if (!proc) return null;
  proc.galeria = proc.galeria ? [...proc.galeria, media] : [media];
  saveProcedimientos();
  return proc;
}

export function removeMediaFromProcedimiento(procId: number, mediaId: string): Procedimiento | null {
  const proc = procedimientos.find((p) => p.id === procId);
  if (!proc || !proc.galeria) return null;
  proc.galeria = proc.galeria.filter((m) => m.id !== mediaId);
  saveProcedimientos();
  return proc;
}

// ============================================================
// TESTIMONIOS
// ============================================================
export interface Testimonio {
  id: number;
  nombre: string;
  texto: string;
  video: string;
  thumb: string;
  activo: boolean;
  destacado?: boolean;
  creadoEn: string;
}

export let testimonios: Testimonio[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("testimonios");
  if (stored) testimonios = JSON.parse(stored);
  else localStorage.setItem("testimonios", JSON.stringify(testimonios));
}

let nextTestimonioId =
  testimonios.length > 0 ? Math.max(...testimonios.map((t) => t.id)) + 1 : 1;

function saveTestimonios() {
  localStorage.setItem("testimonios", JSON.stringify(testimonios));
}

export function getTestimonios(): Testimonio[] {
  return JSON.parse(JSON.stringify(testimonios));
}

export function addTestimonio(data: Omit<Testimonio, "id" | "creadoEn">): Testimonio {
  const nuevo: Testimonio = { id: nextTestimonioId++, ...data, creadoEn: new Date().toISOString() };
  testimonios.push(nuevo);
  saveTestimonios();
  return nuevo;
}

export function updateTestimonio(id: number, data: Partial<Testimonio>): Testimonio | null {
  const idx = testimonios.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  testimonios[idx] = { ...testimonios[idx], ...data };
  saveTestimonios();
  return testimonios[idx];
}

export function deleteTestimonio(id: number): boolean {
  const before = testimonios.length;
  testimonios = testimonios.filter((t) => t.id !== id);
  const after = testimonios.length;
  if (before !== after) saveTestimonios();
  return before !== after;
}

// ============================================================
// LIMPIEZA GENERAL
// ============================================================
export function deleteUser(id: number) {
  usuariosRegistrados = usuariosRegistrados.filter((u) => u.id !== id);
  saveUsuarios();
}

export function clearLocalDB() {
  usuariosRegistrados = [];
  citasAgendadas = [];
  procedimientos = [];
  testimonios = [];
  localStorage.clear();
}
