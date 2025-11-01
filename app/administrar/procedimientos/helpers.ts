import { Procedimiento, getProcedimientos } from "../../utils/localDB";

// ============================================================
// Buscar procedimientos por categoría
// ============================================================
export function buscarPorCategoria(categoria: string): Procedimiento[] {
  const procedimientos = getProcedimientos();
  return procedimientos.filter((p: Procedimiento) => p.categoria === categoria);
}

// ============================================================
// Formatear precio con separadores
// ============================================================
export function formatearPrecio(precio: string | number): string {
  const valor = typeof precio === "string" ? parseInt(precio) : precio;
  if (isNaN(valor)) return "$0";
  return `$${valor.toLocaleString("es-CO")}`;
}
