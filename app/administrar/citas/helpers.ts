import { Cita } from "../../utils/localDB";

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

// ✅ Convierte "03:30 PM" a 24h numérico para ordenar
function parseHora(hora: string): number {
  const match = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, h, m, ampm] = match;
  let hour = parseInt(h);
  const minutes = parseInt(m);
  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  return hour * 60 + minutes;
}
