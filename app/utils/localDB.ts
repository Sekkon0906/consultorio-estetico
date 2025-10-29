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

// === Cargar usuarios desde localStorage ===
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

/** Registro con rol automático */
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

/** Buscar usuario por correo */
export function findUserByEmail(email: string): User | undefined {
  return usuariosRegistrados.find((u) => u.email === email);
}

/** Validar credenciales de usuario */
export function validateUser(email: string, password: string): User | null {
  const user = usuariosRegistrados.find((u) => u.email === email && u.password === password);
  return user || null;
}

/** Crear usuario directo (por ejemplo desde Google) */
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

// ============================================================
// FUNCIONES DE APOYO (para login, recuperación, Google, etc.)
// ============================================================

/** Obtiene todos los usuarios desde localStorage */
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("usuariosRegistrados");
  return stored ? (JSON.parse(stored) as User[]) : [];
}

/** Actualiza o crea un usuario (según email), conservando consistencia */
export function updateUserData(newData: Partial<User>, email: string) {
  if (typeof window === "undefined") return;

  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);

  if (idx !== -1) {
    // Actualizar campos existentes
    users[idx] = { ...users[idx], ...newData };
  } else {
    // Si no existe el usuario (caso raro), crearlo mínimo con email
    const nuevo: User = {
      id: Date.now(),
      nombres: newData.nombres || "",
      apellidos: newData.apellidos || "",
      email,
      password: "",
      edad: 0,
      genero: "Otro",
      telefono: "",
      rol: "user",
      antecedentes: "",
      antecedentesDescripcion: "",
      alergias: "",
      alergiasDescripcion: "",
      medicamentos: "",
      medicamentosDescripcion: "",
      photo: newData.photo || null,
      creadoEn: new Date().toISOString(),
      citasAgendadas: [],
    };
    users.push(nuevo);
  }

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
  metodoPago?: "Consultorio" | "Online" | null;         // ✅ ahora acepta null
  tipoPagoConsultorio?: "Efectivo" | "Tarjeta" | null;  // ✅ ahora acepta null
  tipoPagoOnline?: "PayU" | "PSE" | null;               // ✅ ahora acepta null
  pagado: boolean;
  creadaPor: "usuario" | "doctora";
  fechaCreacion: string;
}


// Base local
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
  citasAgendadas.length > 0
    ? Math.max(...citasAgendadas.map((c) => c.id)) + 1
    : 1;

function saveCitas() {
  if (typeof window !== "undefined") {
    localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
  }
}

/** Crear nueva cita */
export function crearCita(
  citaData: Omit<Cita, "id" | "pagado" | "fechaCreacion">
): Cita {
  const cita: Cita = {
    id: nextCitaId++,
    ...citaData,
    pagado:
      citaData.metodoPago === "Online" ||
      citaData.tipoPagoConsultorio === "Tarjeta",
    fechaCreacion: new Date().toISOString(),
  };
  citasAgendadas.push(cita);
  saveCitas();
  return cita;
}

/** Obtener citas por usuario */
export function getCitasByUser(userId: number): Cita[] {
  return citasAgendadas.filter((c) => c.userId === userId);
}

/** Marcar cita como pagada manualmente */
export function marcarCitaPagada(id: number) {
  const cita = citasAgendadas.find((c) => c.id === id);
  if (cita) {
    cita.pagado = true;
    saveCitas();
  }
}

/** Eliminar cita */
export function deleteCita(id: number) {
  citasAgendadas = citasAgendadas.filter((c) => c.id !== id);
  saveCitas();
}

/** Obtener todas las citas */
export function getCitas(): Cita[] {
  return [...citasAgendadas];
}


// ============================================================
// MODELO PROCEDIMIENTOS con GALERÍA MULTIMEDIA
// ============================================================

export type CategoriaProcedimiento = "Facial" | "Corporal" | "Capilar";
export type MediaType = "imagen" | "video";

export interface MediaItem {
  id: string;             // ID único (puede ser uuid o timestamp)
  tipo: MediaType;        // "imagen" | "video"
  url: string;            // ruta local o enlace embed
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
  galeria?: MediaItem[];  // ✅ Nueva propiedad
}

// ============================================================
// DATOS INICIALES
// ============================================================

export let procedimientos: Procedimiento[] = [
  {
    id: 1,
    nombre: "Limpieza Facial Básica",
    desc: "Elimina impurezas superficiales y aporta frescura y vitalidad a la piel.",
    precio: "180000",
    imagen: "/imagenes/procedimientos/P_LimpiezaBasica.jpg",
    categoria: "Facial",
    duracionMin: 60,
    galeria: [
      { id: "lf1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/limpieza_1.jpg" },
      { id: "lf2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/kK3l2IV6TqM" },
    ],
  },
  {
    id: 2,
    nombre: "Hydrafacial Elite",
    desc: "Tecnología Vortex-Fusion que limpia, exfolia e hidrata profundamente.",
    precio: "350000 – 450000",
    imagen: "/imagenes/procedimientos/P_Hydrafacial.jpg",
    categoria: "Facial",
    duracionMin: 50,
    galeria: [
      { id: "hf1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/hydrafacial_1.jpg" },
      { id: "hf2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/fX9ObKmPZsY" },
    ],
  },
  {
    id: 3,
    nombre: "Peeling Químico",
    desc: "Renueva la piel, reduce manchas y mejora textura mediante exfoliación controlada.",
    precio: "450000",
    imagen: "/imagenes/procedimientos/P_PeelingQuimico.jpg",
    categoria: "Facial",
    duracionMin: 45,
    galeria: [
      { id: "pq1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/peeling_1.jpg" },
      { id: "pq2", tipo: "imagen", url: "/imagenes/procedimientos/galeria/peeling_2.jpg" },
    ],
  },
  {
    id: 4,
    nombre: "Ácido Hialurónico Facial",
    desc: "Rellenos dérmicos para perfilar el rostro y restaurar volumen.",
    precio: "1100000 – 1500000",
    imagen: "/imagenes/procedimientos/P_AcidoHialuronico.jpg",
    categoria: "Facial",
    duracionMin: 60,
    galeria: [
      { id: "ah1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/hialuronico_1.jpg" },
      { id: "ah2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/xgxBBLk8xX8" },
    ],
  },
  {
    id: 5,
    nombre: "Toxina Botulínica (Bótox)",
    desc: "Suaviza arrugas de expresión y previene nuevas líneas.",
    precio: "1100000 – 1300000",
    imagen: "/imagenes/procedimientos/P_Botox.jpg",
    categoria: "Facial",
    duracionMin: 30,
    galeria: [
      { id: "tb1", tipo: "video", url: "https://www.youtube-nocookie.com/embed/Y0BZmPcu_qM" },
      { id: "tb2", tipo: "imagen", url: "/imagenes/procedimientos/galeria/botox_1.jpg" },
    ],
  },
  {
    id: 6,
    nombre: "Plasma Rico en Plaquetas Facial",
    desc: "Regenera, hidrata y mejora la luminosidad de la piel.",
    precio: "450000 – 1100000",
    imagen: "/imagenes/procedimientos/P_PlasmaFacial.jpg",
    categoria: "Facial",
    duracionMin: 60,
    galeria: [
      { id: "pf1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/plasma_facial_1.jpg" },
      { id: "pf2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/J8VjBqVFF4c" },
    ],
  },

  // === Corporales ===
  {
    id: 7,
    nombre: "Sueroterapia",
    desc: "Vitaminas y antioxidantes intravenosos que revitalizan el organismo.",
    precio: "250000 – 800000",
    imagen: "/imagenes/procedimientos/P_Sueroterapia.jpg",
    categoria: "Corporal",
    duracionMin: 45,
    galeria: [
      { id: "st1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/suero_1.jpg" },
    ],
  },
  {
    id: 8,
    nombre: "Enzimas Lipolíticas",
    desc: "Reduce grasa localizada y flacidez sin cirugía.",
    precio: "Según valoración médica",
    imagen: "/imagenes/procedimientos/P_EnzimasLipoliticas.jpg",
    categoria: "Corporal",
    duracionMin: 40,
    galeria: [
      { id: "el1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/enzimas_1.jpg" },
      { id: "el2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/mnHzK1wHDIU" },
    ],
  },
  {
    id: 9,
    nombre: "Tratamiento de Estrías",
    desc: "Estimula colágeno y mejora textura y color en estrías.",
    precio: "400000 – 700000",
    imagen: "/imagenes/procedimientos/P_TratamientoEstrias.jpg",
    categoria: "Corporal",
    duracionMin: 50,
    galeria: [
      { id: "te1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/estrias_1.jpg" },
      { id: "te2", tipo: "imagen", url: "/imagenes/procedimientos/galeria/estrias_2.jpg" },
    ],
  },
  {
    id: 10,
    nombre: "Hiperhidrosis Axilar / Palmar",
    desc: "Reduce sudoración excesiva con aplicación de toxina botulínica.",
    precio: "1300000 por zona",
    imagen: "/imagenes/procedimientos/P_Hiperhidrosis.jpg",
    categoria: "Corporal",
    duracionMin: 30,
    galeria: [
      { id: "hip1", tipo: "video", url: "https://www.youtube-nocookie.com/embed/eygpn1W8Zyg" },
      { id: "hip2", tipo: "imagen", url: "/imagenes/procedimientos/galeria/hiperhidrosis_1.jpg" },
    ],
  },

  // === Capilares ===
  {
    id: 11,
    nombre: "Hydrafacial Capilar (Keravive)",
    desc: "Purifica y nutre el cuero cabelludo, estimulando el crecimiento.",
    precio: "700000",
    imagen: "/imagenes/procedimientos/P_HydrafacialCapilar.jpg",
    categoria: "Capilar",
    duracionMin: 50,
    galeria: [
      { id: "hc1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/hydrafacial_capilar_1.jpg" },
    ],
  },
  {
    id: 12,
    nombre: "Mesocapilar",
    desc: "Inyección de vitaminas y nutrientes para fortalecer el folículo capilar.",
    precio: "250000 – 350000",
    imagen: "/imagenes/procedimientos/P_Mesocapilar.jpg",
    categoria: "Capilar",
    duracionMin: 45,
    galeria: [
      { id: "mc1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/mesocapilar_1.jpg" },
      { id: "mc2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/3L5sVqBfbnQ" },
    ],
  },
  {
    id: 13,
    nombre: "Plasma Rico en Plaquetas Capilar",
    desc: "Bioestimulación capilar con factores de crecimiento.",
    precio: "450000 – 1100000",
    imagen: "/imagenes/procedimientos/P_PlasmaCapilar.jpg",
    categoria: "Capilar",
    duracionMin: 60,
    galeria: [
      { id: "pc1", tipo: "imagen", url: "/imagenes/procedimientos/galeria/plasma_capilar_1.jpg" },
      { id: "pc2", tipo: "video", url: "https://www.youtube-nocookie.com/embed/fxBfJbWmGEA" },
    ],
  },
];
const DB_VERSION = 3; // o el número que uses actualmente

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("procedimientos");
  const version = localStorage.getItem("procedimientos_version");

  try {
    if (stored) {
      const parsed = JSON.parse(stored) as Procedimiento[];
      if (
        !Array.isArray(parsed) ||
        parsed.length < procedimientos.length ||
        version !== String(DB_VERSION)
      ) {
        localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
        localStorage.setItem("procedimientos_version", String(DB_VERSION));
      } else {
        procedimientos = parsed;
      }
    } else {
      localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
      localStorage.setItem("procedimientos_version", String(DB_VERSION));
    }
  } catch {
    localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
    localStorage.setItem("procedimientos_version", String(DB_VERSION));
  }
}

// ============================================================
// CRUD PROCEDIMIENTOS + GALERÍA
// ============================================================

let nextProcId =
  procedimientos.length > 0
    ? Math.max(...procedimientos.map((p) => p.id)) + 1
    : 1;

function saveProcedimientos() {
  if (typeof window !== "undefined") {
    localStorage.setItem("procedimientos", JSON.stringify(procedimientos));
    localStorage.setItem("procedimientos_version", String(DB_VERSION));
  }
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
  if (before !== after) {
    saveProcedimientos();
    return true;
  }
  return false;
}

export function buscarPorCategoria(cat: CategoriaProcedimiento): Procedimiento[] {
  return procedimientos.filter((p) => p.categoria === cat);
}

// ============================================================
// 🔧 FUNCIONES PARA EDITAR LA GALERÍA
// ============================================================

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

export function updateMediaInProcedimiento(procId: number, mediaId: string, data: Partial<MediaItem>): Procedimiento | null {
  const proc = procedimientos.find((p) => p.id === procId);
  if (!proc || !proc.galeria) return null;
  proc.galeria = proc.galeria.map((m) => (m.id === mediaId ? { ...m, ...data } : m));
  saveProcedimientos();
  return proc;
}



// ============================================================
// MODELO TESTIMONIOS
// ============================================================
export interface Testimonio {
  id: number;
  nombre: string;
  texto: string;
  video: string; // enlace embed
  thumb: string; // miniatura
  activo: boolean;
  destacado?: boolean;
  creadoEn: string;
}

export let testimonios: Testimonio[] = [
  {
    id: 1,
    nombre: "Laura G.",
    texto: "Gracias a la Dra. Vanessa, mi piel volvió a verse luminosa y saludable.",
    video: "https://www.youtube-nocookie.com/embed/2sooGeas5VU",
    thumb: "/imagenes/testimonios/testimonio1.jpg",
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Camila R.",
    texto: "El tratamiento fue cómodo, seguro y con resultados increíbles.",
    video: "https://www.youtube-nocookie.com/embed/CS9WgY4eomo",
    thumb: "/imagenes/testimonios/testimonio2.jpg",
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: "Carolina P.",
    texto: "Resultados naturales, atención cálida y profesionalismo en cada detalle.",
    video: "https://www.youtube-nocookie.com/embed/wTAMYOhU5D4",
    thumb: "/imagenes/testimonios/testimonio3.jpg",
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 4,
    nombre: "Valentina S.",
    texto: "Después del tratamiento de acné, mi rostro cambió por completo.",
    video: "https://www.youtube-nocookie.com/embed/hKTEMGxCEBA",
    thumb: "/imagenes/testimonios/testimonio4.jpg",
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 5,
    nombre: "Andrés E.",
    texto: "La Dra. Vanessa combina ciencia y arte. ¡Los resultados hablan por sí solos!",
    video: "https://www.youtube-nocookie.com/embed/9kaV_avyPJo",
    thumb: "/imagenes/testimonios/testimonio5.jpg",
    activo: true,
    creadoEn: new Date().toISOString(),
  },
];

// === Persistencia local testimonios ===
if (typeof window !== "undefined") {
  const storedTestimonios = localStorage.getItem("testimonios");
  if (storedTestimonios) {
    try {
      const parsed = JSON.parse(storedTestimonios) as Testimonio[];
      if (Array.isArray(parsed) && parsed.length > 0) testimonios = parsed;
    } catch {
      localStorage.removeItem("testimonios");
    }
  } else {
    localStorage.setItem("testimonios", JSON.stringify(testimonios));
  }
}

let nextTestimonioId = testimonios.length > 0 ? Math.max(...testimonios.map((t) => t.id)) + 1 : 1;

function saveTestimonios() {
  if (typeof window !== "undefined") {
    localStorage.setItem("testimonios", JSON.stringify(testimonios));
  }
}

// === CRUD testimonios ===
export function getTestimonios(): Testimonio[] {
  return JSON.parse(JSON.stringify(testimonios));
}

export function getTestimonioById(id: number): Testimonio | undefined {
  return testimonios.find((t) => t.id === id);
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
  if (before !== after) {
    saveTestimonios();
    return true;
  }
  return false;
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
  nextUserId = 1;
  nextCitaId = 1;
  nextProcId = 1;
  nextTestimonioId = 1;
  localStorage.clear();
}
