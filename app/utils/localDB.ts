// ============================================================
// localDB.ts — Base de datos simulada con persistencia local
// ============================================================
import QRCode from "qrcode";

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
      usuariosRegistrados = JSON.parse(stored) as User[];
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
    localStorage.setItem(
      "usuariosRegistrados",
      JSON.stringify(usuariosRegistrados)
    );
  }
}

// ============================================================
// REGISTRO / LOGIN / ACTUALIZACIÓN
// ============================================================

export function registerUser(
  userData: Omit<User, "id" | "rol" | "creadoEn" | "citasAgendadas">
): User {
  const rol: "user" | "admin" = correosAdmin.includes(userData.email)
    ? "admin"
    : "user";

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
  const user = usuariosRegistrados.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}

export function createUser(
  nuevoUsuario: Omit<User, "id" | "rol" | "creadoEn" | "citasAgendadas">
): User {
  const existe = usuariosRegistrados.find(
    (u) => u.email === nuevoUsuario.email
  );
  if (existe)
    throw new Error("Ya existe un usuario con este correo electrónico.");

  const rol: "user" | "admin" = correosAdmin.includes(nuevoUsuario.email)
    ? "admin"
    : "user";

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

export function updateUserData(newData: Partial<User>, email: string): void {
  if (typeof window === "undefined") return;
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx !== -1) users[idx] = { ...users[idx], ...newData };
  localStorage.setItem("usuariosRegistrados", JSON.stringify(users));
}

// ==========================
// MODELO CITA
// ==========================
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
  estado: "pendiente" | "confirmada" | "atendida" | "cancelada";
  monto?: number;
  montoPagado?: number;
  montoRestante?: number;
  qrCita?: string;
  motivoCancelacion?: string;
}

export let citasAgendadas: Cita[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("citasAgendadas");
  if (stored) {
    try {
      citasAgendadas = JSON.parse(stored) as Cita[];
    } catch {
      citasAgendadas = [];
      localStorage.removeItem("citasAgendadas");
    }
  }
}

let nextCitaId =
  citasAgendadas.length > 0
    ? Math.max(...citasAgendadas.map((c) => c.id)) + 1
    : 1;

function saveCitas() {
  localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
  // 🔁 Sincroniza automáticamente con el resto del sistema
  window.dispatchEvent(
    new CustomEvent("citasActualizadas", { detail: citasAgendadas })
  );
}

// ============================================================
// FUNCIONES DE HORARIO (deben existir en el mismo archivo o importarse)
// ============================================================

export interface HoraDisponible {
  hora: string; // ej: "08:30 AM"
  disponible: boolean;
  bloqueadoPor?: string | null;
  idCita?: number | null;
}

export interface HorarioPorFecha {
  fecha: string; // formato YYYY-MM-DD
  horas: HoraDisponible[];
}

export interface HorarioGlobal {
  dia: number; // 0=domingo ... 6=sábado
  horas: string[];
}

export function estaDisponible(fechaISO: string, hora: string): boolean {
  const horarioDia = getHorarioPorFecha(fechaISO);
  const bloqueada = horarioDia.find(
    (h: HoraDisponible) => h.hora === hora && !h.disponible
  );
  const cita = getCitasByDay(fechaISO).find((c) => c.hora === hora);
  return !bloqueada && !cita;
}

export function liberarHorario(fechaISO: string, hora: string): void {
  const horarioDia = getHorarioPorFecha(fechaISO);
  const actualizado = horarioDia.map((h: HoraDisponible) =>
    h.hora === hora ? { ...h, disponible: true } : h
  );
  setHorarioPorFecha(fechaISO, actualizado);

  window.dispatchEvent(
    new CustomEvent("horarioCambiado", {
      detail: { tipo: "liberacion", fechaISO, hora },
    })
  );
}

// ============================================================
// CRUD DE CITAS CONECTADO A HORARIO + QR + PAGOS + ESTADOS
// ============================================================

export async function crearCita(
  citaData: Omit<
    Cita,
    "id" | "pagado" | "fechaCreacion" | "tipoCita" | "creadaPor" | "estado" | "qrCita"
  >
): Promise<Cita> {
  const cita: Cita = {
    id: nextCitaId++,
    ...citaData,
    tipoCita: citaData.procedimiento.toLowerCase().includes("valoración")
      ? "valoracion"
      : "implementacion",
    pagado: false,
    creadaPor: "usuario",
    fechaCreacion: new Date().toISOString(),
    estado: "pendiente",
  };

  // Generar QR con enlace único
  const url = `${window.location.origin}/cita?id=${cita.id}`;
  cita.qrCita = await QRCode.toDataURL(url);

  citasAgendadas.push(cita);
  saveCitas();

  // Bloquear hora seleccionada
  const horarioDia = getHorarioPorFecha(cita.fecha);
  const actualizado = horarioDia.map((h: HoraDisponible) =>
    h.hora === cita.hora ? { ...h, disponible: false } : h
  );
  setHorarioPorFecha(cita.fecha, actualizado);

  window.dispatchEvent(
    new CustomEvent("horarioCambiado", {
      detail: { tipo: "nuevaCita", cita },
    })
  );

  return cita;
}

export function cancelarCita(id: number): void {
  const cita = citasAgendadas.find((c) => c.id === id);
  if (!cita) return;
  liberarHorario(cita.fecha, cita.hora);
  cita.estado = "cancelada";
  saveCitas();
  window.dispatchEvent(
    new CustomEvent("horarioCambiado", {
      detail: { tipo: "cancelacion", id, cita },
    })
  );
}

export function confirmarCita(id: number): void {
  updateCita(id, { estado: "confirmada" });
  window.dispatchEvent(
    new CustomEvent("horarioCambiado", { detail: { tipo: "confirmacion", id } })
  );
}

export function marcarCitaAtendida(id: number): void {
  updateCita(id, { estado: "atendida" });
  window.dispatchEvent(
    new CustomEvent("horarioCambiado", { detail: { tipo: "atendida", id } })
  );
}

export function marcarPagoCita(
  id: number,
  metodoPago: "Consultorio" | "Online",
  tipoPagoConsultorio: "Efectivo" | "Tarjeta" | null,
  monto: number,
  montoPagado: number
): void {
  const restante = Math.max(monto - montoPagado, 0);
  const pagado = restante === 0;

  updateCita(id, {
    metodoPago,
    tipoPagoConsultorio,
    monto,
    montoPagado,
    montoRestante: restante,
    pagado,
  });

  window.dispatchEvent(
    new CustomEvent("horarioCambiado", {
      detail: { tipo: "pago", id, restante },
    })
  );
}

export function getCitas(): Cita[] {
  return [...citasAgendadas];
}

export function getCitaById(id: number): Cita | undefined {
  return citasAgendadas.find((c) => c.id === id);
}

export function updateCita(id: number, data: Partial<Cita>): void {
  const index = citasAgendadas.findIndex((c) => c.id === id);
  if (index !== -1) {
    citasAgendadas[index] = { ...citasAgendadas[index], ...data };
    saveCitas();
    window.dispatchEvent(
      new CustomEvent("horarioCambiado", {
        detail: { tipo: "update", id, data },
      })
    );
  }
}

export function getCitasByUser(userId: number): Cita[] {
  return citasAgendadas.filter((c) => c.userId === userId);
}

export function getCitasByDay(fecha: string): Cita[] {
  const fechaBase = new Date(fecha).toISOString().slice(0, 10);
  return citasAgendadas
    .filter(
      (c) => new Date(c.fecha).toISOString().slice(0, 10) === fechaBase
    )
    .sort((a, b) => a.hora.localeCompare(b.hora)); // ✅ ordenadas por hora
}

export function getCitasByMonth(year: number, monthIdx: number): Cita[] {
  return citasAgendadas.filter((c) => {
    const d = new Date(c.fecha);
    return d.getFullYear() === year && d.getMonth() === monthIdx;
  });
}

export function marcarCitaPagada(id: number): void {
  const cita = citasAgendadas.find((c) => c.id === id);
  if (cita) {
    cita.pagado = true;
    saveCitas();
    window.dispatchEvent(
      new CustomEvent("horarioCambiado", { detail: { tipo: "pago", id } })
    );
  }
}

export function deleteCita(id: number): void {
  const cita = citasAgendadas.find((c) => c.id === id);
  if (cita) liberarHorario(cita.fecha, cita.hora);
  citasAgendadas = citasAgendadas.filter((c) => c.id !== id);
  saveCitas();
  window.dispatchEvent(
    new CustomEvent("horarioCambiado", { detail: { tipo: "delete", id } })
  );
}

// ============================================================
// EXTENSIONES ADICIONALES PARA PANEL ADMINISTRATIVO
// ============================================================

// =====================
// INGRESOS Y PAGOS — ACTUALIZADO
// =====================

export function getCitasPagadasMes(
  year: number,
  monthIdx: number
): Cita[] {
  return getCitasByMonth(year, monthIdx).filter((c) => c.pagado);
}

export function getPagosOnline(): Cita[] {
  return citasAgendadas.filter(
    (c) => c.metodoPago === "Online" && c.pagado
  );
}

export interface IngresoRegistrado {
  citaId: number;
  paciente: string;
  procedimiento: string;
  monto: number;
  metodoPago: "Consultorio" | "Online";
  fecha: string;
}

/**
 * 🧾 Registra un ingreso único en localStorage cuando se paga una cita.
 * Evita duplicados y mantiene la estructura mensual.
 */
export function registrarIngreso(cita: Cita): void {
  if (typeof window === "undefined") return;
  if (!cita.pagado || !cita.monto) return;

  const stored = localStorage.getItem("ingresosRegistrados");
  const ingresos: IngresoRegistrado[] = stored
    ? (JSON.parse(stored) as IngresoRegistrado[])
    : [];

  const existe = ingresos.some((i) => i.citaId === cita.id);
  if (existe) return;

  ingresos.push({
    citaId: cita.id,
    paciente: `${cita.nombres} ${cita.apellidos}`,
    procedimiento: cita.procedimiento,
    monto: cita.montoPagado || cita.monto || 0,
    metodoPago: cita.metodoPago || "Consultorio",
    fecha: cita.fecha,
  });

  localStorage.setItem("ingresosRegistrados", JSON.stringify(ingresos));
}

/**
 * Calcula los totales reales del mes (Online, Consultorio, y Esperado)
 */
export function getTotalesMes(year: number, monthIdx: number) {
  const citas = getCitasByMonth(year, monthIdx);

  const totalOnline = citas
    .filter((c) => c.pagado && c.metodoPago === "Online")
    .reduce(
      (acc, c) => acc + (c.montoPagado || c.monto || 0),
      0
    );

  const totalConsultorio = citas
    .filter((c) => c.pagado && c.metodoPago === "Consultorio")
    .reduce(
      (acc, c) => acc + (c.montoPagado || c.monto || 0),
      0
    );

  const totalEsperado = citas.reduce(
    (acc, c) => acc + (c.monto || 0),
    0
  );

  return { totalOnline, totalConsultorio, totalEsperado };
}

/**
 * Marca una cita como pagada y registra el ingreso.
 */
export function updateCitaPago(id: number, pagado: boolean): void {
  const stored = localStorage.getItem("citasAgendadas");
  const citas: Cita[] = stored ? (JSON.parse(stored) as Cita[]) : [];
  const index = citas.findIndex((c) => c.id === id);
  if (index !== -1) {
    citas[index].pagado = pagado;
    localStorage.setItem("citasAgendadas", JSON.stringify(citas));
    if (pagado) registrarIngreso(citas[index]);
  }
}

export function getAllCitas(): Cita[] {
  const stored = localStorage.getItem("citasAgendadas");
  return stored ? (JSON.parse(stored) as Cita[]) : [];
}

// =====================
// CONFIGURACIÓN DE VALOR CONSULTA GENERAL
// =====================
export function setValorConsultaGeneral(valor: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("valorConsultaGeneral", valor.toString());
  }
}

export function getValorConsultaGeneral(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("valorConsultaGeneral");
  return stored ? parseInt(stored, 10) || 0 : 0;
}

// =====================
// FORMATO DE MONEDA
// =====================
export function formatCurrency(valor: number): string {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
}

// ============================================================
// BLOQUEOS DE HORAS — Sistema persistente
// ============================================================

export interface BloqueoHora {
  fechaISO: string;
  hora: string;
  motivo: string;
}

export let bloqueos: BloqueoHora[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("bloqueos");
  if (stored) {
    try {
      bloqueos = JSON.parse(stored) as BloqueoHora[];
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

export function addBloqueo(b: BloqueoHora): void {
  bloqueos.push(b);
  saveBloqueos();
}

export function removeBloqueo(fechaISO: string, hora: string): void {
  bloqueos = bloqueos.filter(
    (b) => !(b.fechaISO === fechaISO && b.hora === hora)
  );
  saveBloqueos();
}

export function getBloqueosPorFecha(fechaISO: string): BloqueoHora[] {
  return bloqueos.filter((b) => b.fechaISO === fechaISO);
}

export function isHoraBloqueada(fechaISO: string, hora: string): boolean {
  return bloqueos.some((b) => b.fechaISO === fechaISO && b.hora === hora);
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
    procedimientos = JSON.parse(stored) as Procedimiento[];
  } else {
    localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
    localStorage.setItem(
      "procedimientos_version",
      String(DB_VERSION)
    );
  }
}

let nextProcId =
  procedimientos.length > 0
    ? Math.max(...procedimientos.map((p) => p.id)) + 1
    : 1;

function saveProcedimientos() {
  localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
  localStorage.setItem(
    "procedimientos_version",
    String(DB_VERSION)
  );
}

export function getProcedimientos(): Procedimiento[] {
  return JSON.parse(JSON.stringify(procedimientos)) as Procedimiento[];
}

export function getProcedimientoById(
  id: number
): Procedimiento | undefined {
  return procedimientos.find((p) => p.id === id);
}

export function addProcedimiento(
  data: Omit<Procedimiento, "id">
): Procedimiento {
  const nuevo: Procedimiento = { id: nextProcId++, ...data };
  procedimientos.push(nuevo);
  saveProcedimientos();
  return nuevo;
}

export function updateProcedimiento(
  id: number,
  data: Partial<Procedimiento>
): Procedimiento | null {
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

export function addMediaToProcedimiento(
  procId: number,
  media: MediaItem
): Procedimiento | null {
  const proc = procedimientos.find((p) => p.id === procId);
  if (!proc) return null;
  proc.galeria = proc.galeria ? [...proc.galeria, media] : [media];
  saveProcedimientos();
  return proc;
}

export function removeMediaFromProcedimiento(
  procId: number,
  mediaId: string
): Procedimiento | null {
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
  if (stored) testimonios = JSON.parse(stored) as Testimonio[];
  else localStorage.setItem("testimonios", JSON.stringify(testimonios));
}

let nextTestimonioId =
  testimonios.length > 0
    ? Math.max(...testimonios.map((t) => t.id)) + 1
    : 1;

function saveTestimonios() {
  localStorage.setItem("testimonios", JSON.stringify(testimonios));
}

export function getTestimonios(): Testimonio[] {
  return JSON.parse(JSON.stringify(testimonios)) as Testimonio[];
}

export function addTestimonio(
  data: Omit<Testimonio, "id" | "creadoEn">
): Testimonio {
  const nuevo: Testimonio = {
    id: nextTestimonioId++,
    ...data,
    creadoEn: new Date().toISOString(),
  };
  testimonios.push(nuevo);
  saveTestimonios();
  return nuevo;
}

export function updateTestimonio(
  id: number,
  data: Partial<Testimonio>
): Testimonio | null {
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
// CHARLAS / FORMACIÓN CONTINUA
// ============================================================
export interface Charla {
  id: number;
  titulo: string;
  descripcion: string;
  detalle: string;
  imagen: string;
  galeria: string[]; // puede incluir URLs base64 o enlaces YouTube
  fecha?: string;
}

export let charlas: Charla[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("charlas");
  if (stored) {
    charlas = JSON.parse(stored) as Charla[];
  } else {
    charlas = [
      {
        id: 1,
        titulo: "Simposio Internacional de Medicina Estética 2024",
        descripcion:
          "Exploré innovaciones en rejuvenecimiento facial no invasivo y la importancia del equilibrio entre salud, técnica y naturalidad.",
        imagen: "/imagenes/charla1.jpg",
        galeria: [
          "/imagenes/charla1_1.jpg",
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // ejemplo
        ],
        detalle:
          "Durante este simposio profundicé en técnicas avanzadas de bioestimulación con péptidos y hilos tensores.",
        fecha: "2024-03-12",
      },
    ];
    localStorage.setItem("charlas", JSON.stringify(charlas));
  }
}

let nextCharlaId =
  charlas.length > 0 ? Math.max(...charlas.map((c) => c.id)) + 1 : 1;

function saveCharlas() {
  try {
    // Filtramos blobs muy grandes (base64) que saturen el localStorage
    const filtradas: Charla[] = charlas.map((c: Charla) => ({
      ...c,
      imagen:
        c.imagen?.startsWith("data:") && c.imagen.length > 1000
          ? "blob://temporal-imagen"
          : c.imagen,
      galeria:
        c.galeria?.map((g: string) =>
          g.startsWith("data:") && g.length > 1000 ? "blob://temporal" : g
        ) ?? [],
    }));
    localStorage.setItem("charlas", JSON.stringify(filtradas));
  } catch (err) {
    console.warn("⚠️ No se pudieron guardar las charlas:", err);
  }
}

export function getCharlas(): Charla[] {
  return JSON.parse(JSON.stringify(charlas)) as Charla[];
}

export function addCharla(data: Omit<Charla, "id">): Charla {
  const nueva: Charla = { id: nextCharlaId++, ...data };
  charlas.push(nueva);
  saveCharlas();
  return nueva;
}

export function updateCharla(
  id: number,
  data: Partial<Charla>
): Charla | null {
  const idx = charlas.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  charlas[idx] = { ...charlas[idx], ...data };
  saveCharlas();
  return charlas[idx];
}

export function deleteCharla(id: number): boolean {
  const before = charlas.length;
  charlas = charlas.filter((c) => c.id !== id);
  saveCharlas();
  return charlas.length < before;
}

// ============================================================
// HORARIOS Y DISPONIBILIDAD — SISTEMA DE CITAS
// ============================================================

export const HORAS_BASE: string[] = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

// ============================================================
// ALMACENAMIENTO LOCAL
// ============================================================

let horarios: {
  fecha: string;
  hora: string;
  disponible: boolean;
  bloqueadoPor?: string;
  idCita?: number | null;
}[] = [];

let horariosGlobales: HorarioGlobal[] = [];
let horariosPorFecha: HorarioPorFecha[] = [];

if (typeof window !== "undefined") {
  horarios = JSON.parse(localStorage.getItem("horarios") || "[]") as {
    fecha: string;
    hora: string;
    disponible: boolean;
    bloqueadoPor?: string;
    idCita?: number | null;
  }[];
  horariosGlobales = JSON.parse(
    localStorage.getItem("horarios_globales") || "[]"
  ) as HorarioGlobal[];
  horariosPorFecha = JSON.parse(
    localStorage.getItem("horarios_por_fecha") || "[]"
  ) as HorarioPorFecha[];
}

// ============================================================
// FUNCIONES BASE DE DISPONIBILIDAD
// ============================================================

export function setHorarioDisponible(
  fecha: string,
  hora: string,
  disponible: boolean,
  bloqueadoPor?: string
): void {
  const idx = horarios.findIndex((h) => h.fecha === fecha && h.hora === hora);
  if (idx !== -1) {
    horarios[idx].disponible = disponible;
    horarios[idx].bloqueadoPor = bloqueadoPor;
  } else {
    horarios.push({ fecha, hora, disponible, bloqueadoPor });
  }
  localStorage.setItem("horarios", JSON.stringify(horarios));
}

export function ocuparHorario(
  fecha: string,
  hora: string,
  idCita: number
): void {
  const idx = horarios.findIndex((h) => h.fecha === fecha && h.hora === hora);
  if (idx !== -1) {
    horarios[idx].disponible = false;
    horarios[idx].idCita = idCita;
  } else {
    horarios.push({ fecha, hora, disponible: false, idCita });
  }
  localStorage.setItem("horarios", JSON.stringify(horarios));
}

export function getHorariosDisponibles(fecha: string): HoraDisponible[] {
  const delDia = horarios.filter((h) => h.fecha === fecha);
  if (delDia.length > 0)
    return delDia.map((h) => ({ hora: h.hora, disponible: h.disponible }));
  const global = getHorarioGlobal();
  return global;
}

export function bloquearHorarioManual(
  fecha: string,
  hora: string,
  motivo = "doctora"
): void {
  setHorarioDisponible(fecha, hora, false, motivo);
}

// ============================================================
// HORARIOS GLOBALES — CONFIGURADOS POR LA DOCTORA
// ============================================================

export function getHorarioGlobal(): HoraDisponible[] {
  const stored = localStorage.getItem("horario_global");
  if (stored) return JSON.parse(stored) as HoraDisponible[];
  return HORAS_BASE.map((h) => ({ hora: h, disponible: true }));
}

export function setHorarioGlobal(horas: HoraDisponible[]): void {
  localStorage.setItem("horario_global", JSON.stringify(horas));
}

export function getHorariosDelDia(dia: number): string[] {
  const data = horariosGlobales.find((h) => h.dia === dia);
  return data ? data.horas : [];
}

export function setHorariosDelDia(dia: number, horas: string[]): void {
  const existing = horariosGlobales.find((h) => h.dia === dia);
  if (existing) existing.horas = horas;
  else horariosGlobales.push({ dia, horas });
  localStorage.setItem(
    "horarios_globales",
    JSON.stringify(horariosGlobales)
  );
}

// ============================================================
// HORARIOS POR FECHA ESPECÍFICA (SOBRESCRIBEN EL GLOBAL)
// ============================================================

export function getHorarioPorFecha(fecha: string): HoraDisponible[] {
  const found = horariosPorFecha.find((d) => d.fecha === fecha);
  if (found) return found.horas;
  const global = getHorarioGlobal();
  return global.map((h) => ({ ...h }));
}

export function setHorarioPorFecha(
  fecha: string,
  horas: HoraDisponible[]
): void {
  const idx = horariosPorFecha.findIndex((d) => d.fecha === fecha);
  if (idx !== -1) horariosPorFecha[idx].horas = horas;
  else horariosPorFecha.push({ fecha, horas });
  localStorage.setItem(
    "horarios_por_fecha",
    JSON.stringify(horariosPorFecha)
  );
}

// ============================================================
// SINCRONIZACIÓN ENTRE HORARIO GLOBAL Y DÍAS ESPECÍFICOS
// ============================================================

export function aplicarHorarioGlobalATodosLosDias(): void {
  const global = getHorarioGlobal();
  const hoy = new Date();
  const nuevos: HorarioPorFecha[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    const fechaISO = d.toISOString().slice(0, 10);
    nuevos.push({
      fecha: fechaISO,
      horas: global.map((h) => ({ ...h })),
    });
  }

  horariosPorFecha = nuevos;
  localStorage.setItem(
    "horarios_por_fecha",
    JSON.stringify(horariosPorFecha)
  );
}

// ============================================================
// LIMPIEZA GENERAL
// ============================================================
export function deleteUser(id: number): void {
  usuariosRegistrados = usuariosRegistrados.filter((u) => u.id !== id);
  saveUsuarios();
}

export function clearLocalDB(): void {
  usuariosRegistrados = [];
  citasAgendadas = [];
  procedimientos = [];
  testimonios = [];
  localStorage.clear();
}
