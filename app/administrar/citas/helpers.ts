// app/administrar/citas/helpers.ts

// 🔹 Tipos que corresponden a la tabla `citas`
export type EstadoCita = "pendiente" | "confirmada" | "atendida" | "cancelada";

export interface Cita {
  id: number;
  userId: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  procedimiento: string;
  tipoCita: "valoracion" | "implementacion";
  nota: string | null;
  fecha: string; // "YYYY-MM-DD"
  hora: string;  // "HH:mm" o "hh:mm AM/PM"
  metodoPago: "Consultorio" | "Online" | null;
  tipoPagoConsultorio: "Efectivo" | "Tarjeta" | null;
  tipoPagoOnline: "PayU" | "PSE" | null;
  pagado: 0 | 1;
  monto: number | null;
  montoPagado: number | null;
  montoRestante: number | null;
  creadaPor: "usuario" | "doctora";
  fechaCreacion: string;
  estado: EstadoCita;
  qrCita: string | null;
  motivoCancelacion: string | null;
}

// 🔹 Base URL del backend (Render)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_BASE_URL no está definido. Las llamadas a la API de citas fallarán."
  );
}

/* ============================================================================
 *  API: funciones para trabajar con citas reales (MySQL)
 * ==========================================================================*/

// Obtener citas por día. El filtro por estado se aplica en el front.
export async function getCitasByDayAPI(
  fecha: string,
  estado?: string
): Promise<Cita[]> {
  if (!API_BASE) return [];

  const params = new URLSearchParams({ fecha });

  const res = await fetch(`${API_BASE}/citas?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener citas");
  }

  const data = await res.json();
  let citas: Cita[] = data.citas ?? [];

  if (estado && estado !== "todos") {
    citas = citas.filter((c) => c.estado === estado);
  }

  return citas;
}

// Confirmar cita → PUT /citas/:id { estado: 'confirmada' }
export async function confirmarCitaAPI(id: number): Promise<void> {
  if (!API_BASE) return;

  const res = await fetch(`${API_BASE}/citas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ estado: "confirmada" }),
  });

  if (!res.ok) {
    throw new Error("Error al confirmar cita");
  }
}

// Cancelar cita → PUT /citas/:id { estado:'cancelada', motivoCancelacion }
export async function cancelarCitaAPI(
  id: number,
  motivo: string
): Promise<void> {
  if (!API_BASE) return;

  const res = await fetch(`${API_BASE}/citas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      estado: "cancelada",
      motivoCancelacion: motivo,
    }),
  });

  if (!res.ok) {
    throw new Error("Error al cancelar cita");
  }
}

// Update genérico (reagendar, pagos, etc.) → PUT /citas/:id
export async function updateCitaAPI(
  id: number,
  updates: Partial<Cita>
): Promise<void> {
  if (!API_BASE) return;

  const res = await fetch(`${API_BASE}/citas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar cita");
  }
}

/* ============================================================================
 *  Helpers de UI / formateo
 * ==========================================================================*/

// ✅ Formateo de moneda (peso colombiano)
export function formatCurrency(value: number): string {
  return "$ " + value.toLocaleString("es-CO");
}

// ✅ Ordena las citas por hora (ASC o DESC)
export function ordenarCitasPorHora(citas: Cita[], asc = true): Cita[] {
  return [...citas].sort((a, b) => {
    const horaA = parseHora(a.hora);
    const horaB = parseHora(b.hora);
    return asc ? horaA - horaB : horaB - horaA;
  });
}

// ✅ Convierte "03:30 PM" o "15:30" a minutos para ordenar
function parseHora(hora: string): number {
  if (!hora) return 0;

  // Formato 12h: "03:30 PM"
  const match12 = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    const [, h, m, ampm] = match12;
    let hour = parseInt(h, 10);
    const minutes = parseInt(m, 10);

    if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

    return hour * 60 + minutes;
  }

  // Formato 24h: "15:30"
  const match24 = hora.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const [, h, m] = match24;
    const hour = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    return hour * 60 + minutes;
  }

  // Si nada hace match, lo mandamos al inicio
  return 0;
}
