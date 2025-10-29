export function formatPrecio(precio: number | string): string {
  if (typeof precio === "number") {
    return `$${precio.toLocaleString("es-CO")}`; // 🇨🇴 usa punto como separador de miles
  }
  // si es un rango en string (como “350000 – 450000”)
  if (typeof precio === "string" && precio.includes("–")) {
    return precio
      .split("–")
      .map(p => `$${Number(p.replace(/\D/g, "")).toLocaleString("es-CO")}`)
      .join(" – ");
  }
  return `$${precio}`; // fallback
}
