// app/services/citasApi.ts
import type { Cita, BloqueoHora } from "../types/domain";

const API_BASE: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// ============================
//  C I T A S
// ============================

export async function getCitasByDayApi(fechaISO: string): Promise<Cita[]> {
  const url = new URL(`${API_BASE}/citas`);
  url.searchParams.set("fecha", fechaISO);

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Error al obtener citas");
  }

  const data:
    | { ok?: boolean; citas?: Cita[] }
    | Cita[] = await res.json();

  return Array.isArray(data) ? data : data.citas ?? [];
}

export async function createCitaApi(
  payload: Omit<Cita, "id" | "fechaCreacion">
): Promise<Cita> {
  const res = await fetch(`${API_BASE}/citas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al crear cita");
  }

  const data: { ok?: boolean; cita?: Cita } = await res.json();
  if (!data.cita) {
    throw new Error("Respuesta inválida del servidor al crear cita");
  }

  return data.cita;
}

export async function updateCitaApi(
  id: number,
  payload: Partial<Omit<Cita, "id" | "fechaCreacion">>
): Promise<Cita> {
  const res = await fetch(`${API_BASE}/citas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar cita");
  }

  const data: { ok?: boolean; cita?: Cita } = await res.json();
  if (!data.cita) {
    throw new Error("Respuesta inválida del servidor al actualizar cita");
  }

  return data.cita;
}

export async function deleteCitaApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/citas/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar cita");
  }
}

// ============================
//  B L O Q U E O S   D E   H O R A
// ============================

export async function getBloqueosPorFechaApi(
  fechaISO: string
): Promise<BloqueoHora[]> {
  const url = new URL(`${API_BASE}/bloqueos-horas`);
  url.searchParams.set("fecha", fechaISO);

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Error al obtener bloqueos de hora");
  }

  const data:
    | { ok?: boolean; bloqueos?: BloqueoHora[] }
    | BloqueoHora[] = await res.json();

  return Array.isArray(data) ? data : data.bloqueos ?? [];
}

export async function createBloqueoHoraApi(
  payload: Omit<BloqueoHora, "id">
): Promise<BloqueoHora> {
  const res = await fetch(`${API_BASE}/bloqueos-horas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al crear bloqueo de hora");
  }

  const data: { ok?: boolean; bloqueo?: BloqueoHora } = await res.json();
  if (!data.bloqueo) {
    throw new Error("Respuesta inválida del servidor al crear bloqueo");
  }

  return data.bloqueo;
}

export async function deleteBloqueoHoraApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/bloqueos-horas/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar bloqueo de hora");
  }
}
