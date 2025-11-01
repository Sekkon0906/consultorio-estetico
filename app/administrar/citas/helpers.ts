// ============================================================
// helpers.ts — Funciones de apoyo para la administración de citas
// ============================================================

import { Cita, citasAgendadas, BloqueoHora, addBloqueo, removeBloqueo } from "../../utils/localDB";

/** Obtener todas las citas de una fecha específica */
export function getCitasPorFecha(fecha: string): Cita[] {
  return citasAgendadas.filter((cita) => cita.fecha === fecha);
}

/** Bloquear una hora específica con motivo */
export function bloquearCita(fecha: string, hora: string, motivo: string): BloqueoHora {
  const bloqueo = { fechaISO: fecha, hora, motivo };
  addBloqueo(bloqueo);
  return bloqueo;
}

/** Desbloquear una hora */
export function desbloquearCita(fecha: string, hora: string): void {
  removeBloqueo(fecha, hora);
}

/** Comprobar si una hora está bloqueada */
export function isHoraBloqueada(bloqueos: BloqueoHora[], fecha: string, hora: string): boolean {
  return bloqueos.some((b) => b.fechaISO === fecha && b.hora === hora);
}
