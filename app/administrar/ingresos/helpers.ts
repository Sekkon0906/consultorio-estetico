import { getTotalesMes } from "../../utils/localDB";

/**
 * Calcula los ingresos del mes actual
 */
export function calcularIngresos() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const monthIdx = hoy.getMonth(); // 0 = enero, 11 = diciembre

  const { totalOnline, totalConsultorio, totalEsperado } = getTotalesMes(year, monthIdx);

  return { totalOnline, totalConsultorio, totalEsperado };
}
