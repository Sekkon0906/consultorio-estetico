// app/services/procedimientosApi.ts
import type { Procedimiento } from "../types/domain";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  // solo para depurar en local
  console.warn("⚠ Falta NEXT_PUBLIC_API_BASE_URL en .env del front");
}

export async function getProcedimientosApi(): Promise<Procedimiento[]> {
  const res = await fetch(`${BASE_URL}/procedimientos`, {
    // importante para Next (desactiva caché dura en producción)
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudieron cargar los procedimientos");
  }
  return data.data as Procedimiento[];
}

export async function createProcedimientoApi(
  payload: Omit<Procedimiento, "id" | "galeria">
): Promise<Procedimiento> {
  const res = await fetch(`${BASE_URL}/procedimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo crear el procedimiento");
  }
  return data.data as Procedimiento;
}

export async function updateProcedimientoApi(
  id: number,
  payload: Partial<Omit<Procedimiento, "id">>
): Promise<Procedimiento> {
  const res = await fetch(`${BASE_URL}/procedimientos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo actualizar el procedimiento");
  }
  return data.data as Procedimiento;
}

export async function deleteProcedimientoApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/procedimientos/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo eliminar el procedimiento");
  }
}
