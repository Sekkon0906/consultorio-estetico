"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// === API BASE DEL BACKEND ===
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// === Tipo de dato esperado desde la BD ===
interface Reporte {
  id: number;
  mes: string;
  anio: number;
  fechaGeneracion: string;
  totalOnline: number;
  totalConsultorio: number;
  totalEsperado: number;
  archivoURL?: string | null;
}

export default function HistorialReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);

  // === CONSULTA AL BACKEND ===
  useEffect(() => {
    async function fetchReportes() {
      try {
        const res = await fetch(`${API}/reportes`, { cache: "no-store" });
        if (!res.ok) throw new Error("Error al obtener reportes");

        const data = await res.json();

        if (data.ok && Array.isArray(data.reportes)) {
          // ordenamos por fecha de generación
          const ordenados = data.reportes.sort(
            (a: Reporte, b: Reporte) =>
              new Date(b.fechaGeneracion).getTime() -
              new Date(a.fechaGeneracion).getTime()
          );
          setReportes(ordenados);
        }
      } catch (err) {
        console.error("Error cargando reportes:", err);
      } finally {
        setCargando(false);
      }
    }

    fetchReportes();
  }, []);

  // === VISTA SIN DATOS ===
  if (cargando) {
    return (
      <div className="p-6 text-center text-[#6E5A49] italic">
        Cargando reportes...
      </div>
    );
  }

  if (!cargando && reportes.length === 0) {
    return (
      <div className="p-6 text-center text-[#6E5A49] italic">
        No hay reportes generados todavía.
      </div>
    );
  }

  // === VISTA COMPLETA ===
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold text-center text-[#8B6A4B] mb-3">
        Historial de Reportes Generados
      </h3>

      {/* ===== TABLA (DESKTOP / TABLET) ===== */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-[#E5D8C8] bg-white shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#E9DED2] text-[#4E3B2B]">
                <th className="px-4 py-2 border border-[#E5D8C8]">Mes</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Año</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Pagos Online</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Consultorio</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Total Esperado</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Generado</th>
                <th className="px-4 py-2 border border-[#E5D8C8]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white even:bg-[#FBF7F2] hover:bg-[#F3E9DD] transition"
                >
                  <td className="px-4 py-2 border border-[#E5D8C8]">{r.mes}</td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-center">{r.anio}</td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-right">
                    ${r.totalOnline.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-right">
                    ${r.totalConsultorio.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-right font-semibold">
                    ${r.totalEsperado.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-center">
                    {new Date(r.fechaGeneracion).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-2 border border-[#E5D8C8] text-center">
                    <a
                      href={r.archivoURL || "#"}
                      download
                      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white bg-[#B08968] hover:bg-[#8B6A4B] shadow-sm"
                    >
                      Descargar PDF
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CARDS (MÓVIL) ===== */}
      <div className="grid gap-4 md:hidden">
        {reportes.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-[#E5D8C8] bg-white shadow-sm p-4 flex flex-col gap-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8B6A4B]">
                  {r.mes} {r.anio}
                </p>
                <p className="text-[0.8rem] text-[#6E5A49]">
                  Generado el{" "}
                  {new Date(r.fechaGeneracion).toLocaleDateString("es-CO")}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#4E3B2B]">
                Total: ${r.totalEsperado.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="rounded-lg bg-[#F8EFE8] p-2 text-center">
                <p className="text-[0.7rem] text-[#8B6A4B] font-semibold">Online</p>
                <p className="text-sm font-bold text-[#B08968]">
                  ${r.totalOnline.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-2 text-center">
                <p className="text-[0.7rem] text-yellow-800 font-semibold">Consultorio</p>
                <p className="text-sm font-bold text-yellow-900">
                  ${r.totalConsultorio.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <a
                href={r.archivoURL || "#"}
                download
                className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold text-white bg-[#B08968] hover:bg-[#8B6A4B] shadow-sm"
              >
                Descargar PDF
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
