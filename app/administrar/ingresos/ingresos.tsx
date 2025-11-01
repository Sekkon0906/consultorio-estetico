"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { calcularIngresos } from "./helpers";
import { getCitasByMonth, Cita } from "../../utils/localDB";

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState({
    totalOnline: 0,
    totalConsultorio: 0,
    totalEsperado: 0,
  });

  const [filtro, setFiltro] = useState<"todos" | "online" | "consultorio">("todos");
  const [dataSemanal, setDataSemanal] = useState<any[]>([]);

  // === Cargar resumen general ===
  useEffect(() => {
    setIngresos(calcularIngresos());
    generarGrafica();
  }, []);

  // === Generar los datos de la gráfica ===
  const generarGrafica = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const monthIdx = hoy.getMonth();

    const citasMes = getCitasByMonth(year, monthIdx);

    // Creamos las semanas (1 a 4)
    const semanas = [1, 2, 3, 4];
    const datos = semanas.map((semana) => {
      const inicio = (semana - 1) * 7 + 1;
      const fin = semana * 7;

      const citasSemana = citasMes.filter((cita) => {
        const dia = new Date(cita.fecha).getDate();
        return dia >= inicio && dia <= fin;
      });

      const filtrarPorPago = (citas: Cita[]) => {
        if (filtro === "online") return citas.filter((c) => c.metodoPago === "Online");
        if (filtro === "consultorio") return citas.filter((c) => c.metodoPago === "Consultorio");
        return citas;
      };

      const citasFiltradas = filtrarPorPago(citasSemana);

      const total = citasFiltradas.reduce((acc, cita) => {
        const precio = parseInt(String(cita.procedimiento).replace(/\D/g, "")) || 0;
        return acc + (cita.pagado ? precio : 0);
      }, 0);

      return {
        semana: `Semana ${semana}`,
        total,
      };
    });

    setDataSemanal(datos);
  };

  // Recalcular cuando cambie el filtro
  useEffect(() => {
    generarGrafica();
  }, [filtro]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center text-[--main]">
        Resumen de Ingresos del Mes
      </h2>

      {/* === Totales generales === */}
      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-green-50 rounded-xl shadow">
          <h3 className="font-semibold text-green-700">Pagos Online</h3>
          <p className="text-xl font-bold">${ingresos.totalOnline.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-xl shadow">
          <h3 className="font-semibold text-yellow-700">Pagos en Consultorio</h3>
          <p className="text-xl font-bold">${ingresos.totalConsultorio.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl shadow">
          <h3 className="font-semibold text-blue-700">Total Esperado</h3>
          <p className="text-xl font-bold">${ingresos.totalEsperado.toLocaleString()}</p>
        </div>
      </div>

      {/* === Filtro === */}
      <div className="flex justify-center gap-3 mt-6">
        {[
          { label: "Todos los pagos", value: "todos" },
          { label: "Pagos Online", value: "online" },
          { label: "Pagos en Consultorio", value: "consultorio" },
        ].map((btn) => (
          <motion.button
            key={btn.value}
            whileTap={{ scale: 0.9 }}
            onClick={() => setFiltro(btn.value as any)}
            className={`px-4 py-2 rounded-lg font-medium border transition-all ${
              filtro === btn.value
                ? "bg-[--main] text-white"
                : "bg-white border-[--main] text-[--main] hover:bg-[--main]/10"
            }`}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* === Gráfica semanal === */}
      <div className="bg-[--surface] p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-center mb-3 text-[--main]">
          Ingresos semanales ({filtro === "todos" ? "Todos" : filtro})
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataSemanal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke={
                filtro === "online"
                  ? "#22c55e" // verde
                  : filtro === "consultorio"
                  ? "#eab308" // amarillo
                  : "#3b82f6" // azul
              }
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
