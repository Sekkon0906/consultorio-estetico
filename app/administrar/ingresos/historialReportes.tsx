"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Reporte {
  id: string;
  mes: string;
  anio: number;
  fechaGeneracion: string;
  totalOnline: number;
  totalConsultorio: number;
  totalEsperado: number;
  archivoURL?: string; 
}

export default function HistorialReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("reportesMensuales");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Ordenar de más reciente a más antiguo
        const ordenados = data.sort(
          (a: Reporte, b: Reporte) =>
            new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime()
        );
        setReportes(ordenados);
      } catch {
        setReportes([]);
      }
    }
  }, []);

  if (reportes.length === 0) {
    return (
      <div className="p-6 text-center text-[#6E5A49] italic">
        No hay reportes generados todavía.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold text-center text-[#8B6A4B] mb-3">
        Historial de Reportes Generados
      </h3>

      <div className="overflow-x-auto">
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
                transition={{ delay: i * 0.05 }}
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
                  {new Date(r.fechaGeneracion).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-2 border border-[#E5D8C8] text-center">
                  <a
                    href={r.archivoURL || "#"}
                    download
                    className="text-[#B08968] hover:text-[#8B6A4B] font-medium underline"
                  >
                    Descargar
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
