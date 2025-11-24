// app/services/testimoniosApi.ts
import type { Testimonio } from "../types/domain";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

/**
 * Obtiene todos los testimonios desde el backend
 */
export async function getTestimoniosApi(): Promise<Testimonio[]> {
  const res = await fetch(`${API_BASE}/testimonios`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener testimonios");
  }

  const data = await res.json();
  // El backend puede responder { testimonios: [...] } o directamente [...]
  return (data.testimonios ?? data) as Testimonio[];
}

/**
 * Crea un nuevo testimonio en la BD
 */
export async function createTestimonioApi(
  payload: Omit<Testimonio, "id" | "creadoEn">
): Promise<Testimonio> {
  const res = await fetch(`${API_BASE}/testimonios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al crear testimonio");
  }

  const data = await res.json();
  return data.testimonio as Testimonio;
}

/**
 * Actualiza un testimonio existente
 */
export async function updateTestimonioApi(
  id: number,
  payload: Partial<Omit<Testimonio, "id" | "creadoEn">>
): Promise<Testimonio> {
  const res = await fetch(`${API_BASE}/testimonios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar testimonio");
  }

  const data = await res.json();
  return data.testimonio as Testimonio;
}

/**
 * Elimina un testimonio por id
 */
export async function deleteTestimonioApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/testimonios/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar testimonio");
  }
}

/**
 * Activa un testimonio (activo = true)
 * Reusa el endpoint PUT /testimonios/:id
 */
export async function activarTestimonioApi(id: number): Promise<Testimonio> {
  return updateTestimonioApi(id, { activo: true });
}

/**
 * Desactiva un testimonio (activo = false)
 * Reusa el endpoint PUT /testimonios/:id
 */
export async function desactivarTestimonioApi(id: number): Promise<Testimonio> {
  return updateTestimonioApi(id, { activo: false });
}
