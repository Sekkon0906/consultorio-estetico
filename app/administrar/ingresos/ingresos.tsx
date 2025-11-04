"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { calcularIngresos } from "./helpers";
import { getCitasByMonth, Cita } from "../../utils/localDB";
import { generarReporteMensualPDF } from "./reportePDF";
import HistorialReportes from "./historialReportes";

export default function IngresosPage() {
  const fechaActual = new Date();
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  const [mes, setMes] = useState(fechaActual.getMonth());
  const [ingresos, setIngresos] = useState({
    totalOnline: 0,
    totalConsultorio: 0,
    totalEsperado: 0,
  });
  const [filtro, setFiltro] = useState<"todos" | "online" | "consultorio">("todos");
  const [dataSemanal, setDataSemanal] = useState<any[]>([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);

  // === Cargar datos iniciales ===
  useEffect(() => {
    recalcularDatos();
  }, [mes, anio, filtro]);

  const recalcularDatos = () => {
    const citasMes = getCitasByMonth(anio, mes);
    const resumen = calcularIngresos();
    setIngresos(resumen);

    const semanas = [1, 2, 3, 4];
    const datos = semanas.map((semana) => {
      const inicio = (semana - 1) * 7 + 1;
      const fin = semana * 7;
      const citasSemana = citasMes.filter((cita) => {
        const dia = new Date(cita.fecha).getDate();
        return dia >= inicio && dia <= fin;
      });

      const filtradas =
        filtro === "online"
          ? citasSemana.filter((c) => c.metodoPago === "Online")
          : filtro === "consultorio"
          ? citasSemana.filter((c) => c.metodoPago === "Consultorio")
          : citasSemana;

      const total = filtradas.reduce((acc, c) => {
        const precio = parseInt(String(c.procedimiento).replace(/\D/g, "")) || 0;
        return acc + (c.pagado ? precio : 0);
      }, 0);

      return { semana: `Semana ${semana}`, total };
    });

    setDataSemanal(datos);
  };

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    try {
      await generarReporteMensualPDF({
        mes,
        anio,
        ingresos,
        dataSemanal,
        chartId: "grafica-ingresos",
      });

      // Refresca el historial automáticamente
      setActualizarHistorial((n) => n + 1);
      if (!mostrarHistorial) setMostrarHistorial(true);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const nombresMes = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const aniosDisponibles = [2024, 2025, 2026];

  return (
    <div className="p-6 space-y-6 bg-[#FBF7F2] min-h-screen">
      <h2 className="text-2xl font-semibold text-center text-[#4E3B2B]">
        Reporte de Ingresos Mensuales
      </h2>

      {/* === FILTROS SUPERIORES === */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B] shadow-sm hover:border-[#B08968] focus:outline-none"
        >
          {nombresMes.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B] shadow-sm hover:border-[#B08968] focus:outline-none"
        >
          {aniosDisponibles.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerarPDF}
          disabled={generandoPDF}
          className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-all ${
            generandoPDF
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#B08968] hover:bg-[#9C7A54]"
          }`}
        >
          {generandoPDF ? "Generando PDF..." : "Exportar PDF"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMostrarHistorial((v) => !v)}
          className={`px-5 py-2 rounded-lg font-semibold shadow-md border transition-all ${
            mostrarHistorial
              ? "bg-[#E9DED2] text-[#4E3B2B] border-[#B08968]"
              : "bg-white text-[#4E3B2B] border-[#E5D8C8] hover:bg-[#E9DED2]"
          }`}
        >
          Historial de Reportes
        </motion.button>
      </div>

      {/* === TOTALES === */}
      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-[#F8EFE8] rounded-xl shadow">
          <h3 className="font-semibold text-[#8B6A4B]">Pagos Online</h3>
          <p className="text-xl font-bold text-[#B08968]">
            ${ingresos.totalOnline.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-xl shadow">
          <h3 className="font-semibold text-yellow-700">Pagos en Consultorio</h3>
          <p className="text-xl font-bold text-yellow-800">
            ${ingresos.totalConsultorio.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-[#E9DED2] rounded-xl shadow">
          <h3 className="font-semibold text-[#4E3B2B]">Total Esperado</h3>
          <p className="text-xl font-bold text-[#8B6A4B]">
            ${ingresos.totalEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      {/* === FILTROS DE VISTA === */}
      <div className="flex justify-center gap-3 mt-6">
        {[
          { label: "Todos", value: "todos" },
          { label: "Online", value: "online" },
          { label: "Consultorio", value: "consultorio" },
        ].map((btn) => {
          const activo = filtro === btn.value;
          return (
            <motion.button
              key={btn.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltro(btn.value as any)}
              className={`px-5 py-2 rounded-lg font-semibold transition-all shadow-sm border ${
                activo
                  ? "bg-[#B08968] text-white border-[#B08968] shadow-md"
                  : "bg-white text-[#4E3B2B] border-[#E5D8C8] hover:bg-[#E9DED2]"
              }`}
            >
              {btn.label}
            </motion.button>
          );
        })}
      </div>

      {/* === GRÁFICA === */}
      <div
        id="grafica-ingresos"
        className="bg-white p-6 rounded-xl shadow-md mt-4 border border-[#E5D8C8]"
      >
        <h3 className="text-lg font-semibold text-center mb-3 text-[#8B6A4B]">
          Ingresos semanales ({nombresMes[mes]} {anio})
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
                  ? "#C7A27A" // Dorado cálido
                  : filtro === "consultorio"
                  ? "#EAB308" // Amarillo cálido
                  : "#8B6A4B" // Marrón principal
              }
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === HISTORIAL DE REPORTES === */}
      <AnimatePresence>
        {mostrarHistorial && (
          <motion.div
            key={actualizarHistorial}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#FBF7F2] border border-[#E5D8C8] rounded-xl shadow-md mt-6 overflow-hidden"
          >
            <HistorialReportes />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
