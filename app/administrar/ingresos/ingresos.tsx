"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getTotalesMes, getCitasPagadasMes } from "../../utils/localDB";
import { generarReporteMensualPDF } from "./reportePDF";
import HistorialReportes from "./historialReportes";

type Filtro = "todos" | "online" | "consultorio";

interface PuntoSemanal {
  semana: string;
  total: number;
}

export default function IngresosPage() {
  const fechaActual = new Date();
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  const [mes, setMes] = useState(fechaActual.getMonth());
  const [ingresos, setIngresos] = useState({
    totalOnline: 0,
    totalConsultorio: 0,
    totalEsperado: 0,
  });
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [dataSemanal, setDataSemanal] = useState<PuntoSemanal[]>([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);

  const recalcularDatos = useCallback(() => {
    const resumen = getTotalesMes(anio, mes);
    setIngresos(resumen);

    const citasMes = getCitasPagadasMes(anio, mes);
    const semanas = [1, 2, 3, 4];

    const datos: PuntoSemanal[] = semanas.map((semana) => {
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

      const total = filtradas.reduce(
        (acc, c) => acc + (c.montoPagado || c.monto || 0),
        0
      );

      return { semana: `Semana ${semana}`, total };
    });

    setDataSemanal(datos);
  }, [anio, mes, filtro]);

  useEffect(() => {
    recalcularDatos();
  }, [recalcularDatos]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ingresosRegistrados" || e.key === "citasAgendadas") {
        recalcularDatos();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [recalcularDatos]);

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

      setActualizarHistorial((n) => n + 1);
      if (!mostrarHistorial) setMostrarHistorial(true);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const nombresMes = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const aniosDisponibles = [2024, 2025, 2026];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FBF7F2] min-h-screen">
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-[#4E3B2B]">
        Reporte de Ingresos Mensuales
      </h2>

      {/* === FILTROS SUPERIORES === */}
      <div className="flex flex-col md:flex-row flex-wrap md:items-center justify-center gap-3 md:gap-4 mb-4">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="w-full md:w-auto border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B] shadow-sm hover:border-[#B08968] focus:outline-none"
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
          className="w-full md:w-auto border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B] shadow-sm hover:border-[#B08968] focus:outline-none"
        >
          {aniosDisponibles.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleGenerarPDF}
          disabled={generandoPDF}
          className={`w-full md:w-auto px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-all ${
            generandoPDF
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#B08968] hover:bg-[#9C7A54]"
          }`}
        >
          {generandoPDF ? "Generando PDF..." : "Exportar PDF"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setMostrarHistorial((v) => !v)}
          className={`w-full md:w-auto px-5 py-2 rounded-lg font-semibold shadow-md border transition-all ${
            mostrarHistorial
              ? "bg-[#E9DED2] text-[#4E3B2B] border-[#B08968]"
              : "bg-white text-[#4E3B2B] border-[#E5D8C8] hover:bg-[#E9DED2]"
          }`}
        >
          Historial de Reportes
        </motion.button>
      </div>

      {/* === TOTALES === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-[#F8EFE8] rounded-xl shadow">
          <h3 className="font-semibold text-[#8B6A4B] text-sm sm:text-base">
            Pagos Online
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-[#B08968] mt-1">
            ${ingresos.totalOnline.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-xl shadow">
          <h3 className="font-semibold text-yellow-700 text-sm sm:text-base">
            Pagos en Consultorio
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-yellow-800 mt-1">
            ${ingresos.totalConsultorio.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-[#E9DED2] rounded-xl shadow">
          <h3 className="font-semibold text-[#4E3B2B] text-sm sm:text-base">
            Total Esperado
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-[#8B6A4B] mt-1">
            ${ingresos.totalEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      {/* === FILTROS DE VISTA === */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
        {(
          [
            { label: "Todos", value: "todos" },
            { label: "Online", value: "online" },
            { label: "Consultorio", value: "consultorio" },
          ] as { label: string; value: Filtro }[]
        ).map((btn) => {
          const activo = filtro === btn.value;
          return (
            <motion.button
              key={btn.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFiltro(btn.value)}
              className={`min-w-[120px] px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all shadow-sm border ${
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
        className="bg-white p-4 sm:p-6 rounded-xl shadow-md mt-4 border border-[#E5D8C8]"
      >
        <h3 className="text-base sm:text-lg font-semibold text-center mb-3 text-[#8B6A4B]">
          Ingresos semanales ({nombresMes[mes]} {anio})
        </h3>

        <div className="w-full h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
                    ? "#C7A27A"
                    : filtro === "consultorio"
                    ? "#EAB308"
                    : "#8B6A4B"
                }
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === HISTORIAL === */}
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
