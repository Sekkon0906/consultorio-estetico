// app/utils/apiCharlas.ts
import axios from "axios";

// === Tipo Charla (debe coincidir con tu backend) ===
export interface Charla {
  id: number;
  titulo: string;
  descripcion: string;
  detalle: string;
  imagen: string;
  fecha: string | null; // puede venir null
}

// 🌎 URL base del servidor Express
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// === GET: Obtener todas las charlas ===
export async function getCharlasAPI(): Promise<Charla[]> {
  const res = await axios.get<{ ok: boolean; charlas: Charla[] }>(
    `${API_URL}/charlas`
  );
  return res.data.charlas;
}

// === POST: Crear charla ===
export async function addCharlaAPI(
  data: Omit<Charla, "id">
): Promise<Charla> {
  const res = await axios.post<{ ok: boolean; charla: Charla }>(
    `${API_URL}/charlas`,
    data
  );
  return res.data.charla;
}

// === PUT: Editar charla ===
export async function updateCharlaAPI(
  id: number,
  data: Partial<Omit<Charla, "id">>
): Promise<Charla> {
  const res = await axios.put<{ ok: boolean; charla: Charla }>(
    `${API_URL}/charlas/${id}`,
    data
  );
  return res.data.charla;
}

// === DELETE: Eliminar charla ===
export async function deleteCharlaAPI(id: number): Promise<boolean> {
  const res = await axios.delete<{ ok: boolean }>(`${API_URL}/charlas/${id}`);
  return res.data.ok;
}
