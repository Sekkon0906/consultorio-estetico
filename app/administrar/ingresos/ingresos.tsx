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
import { generarReporteMensualPDF } from "./reportePDF";
import HistorialReportes from "./historialReportes";

// === API BASE DEL BACKEND ===
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// === Tipos del backend ===
type Filtro = "todos" | "online" | "consultorio";

interface ResumenMes {
  totalOnline: number;
  totalConsultorio: number;
  totalEsperado: number;
}

interface PuntoSemanal {
  semana: string;
  total: number;
}

export default function IngresosPage() {
  const fechaActual = new Date();
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  const [mes, setMes] = useState(fechaActual.getMonth());
  const [ingresos, setIngresos] = useState<ResumenMes>({
    totalOnline: 0,
    totalConsultorio: 0,
    totalEsperado: 0,
  });
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [dataSemanal, setDataSemanal] = useState<PuntoSemanal[]>([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);

  // === CONSULTAR TOTALES DEL MES ===
  const fetchTotalesMes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ingresos?mes=${mes}&anio=${anio}`);
      if (!res.ok) throw new Error("Error consultando ingresos");
      const data = await res.json();
      if (data.ok) setIngresos(data.totales);
    } catch (err) {
      console.error(err);
    }
  }, [anio, mes]);

  // === CONSULTAR INGRESOS SEMANALES ===
  const fetchIngresoSemanal = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/ingresos/semanal?mes=${mes}&anio=${anio}&filtro=${filtro}`
      );
      if (!res.ok) throw new Error("Error consultando ingresos semanales");
      const data = await res.json();
      if (data.ok) setDataSemanal(data.semanal);
    } catch (err) {
      console.error(err);
    }
  }, [anio, mes, filtro]);

  // === EFECTOS ===
  useEffect(() => {
    fetchTotalesMes();
    fetchIngresoSemanal();
  }, [fetchTotalesMes, fetchIngresoSemanal]);

  // === PDF ===
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

  // === UI ===
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
          className="w-full md:w-auto border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B]"
        >
          {nombresMes.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="w-full md:w-auto border border-[#E5D8C8] rounded-lg px-3 py-2 bg-white text-[#4E3B2B]"
        >
          {aniosDisponibles.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleGenerarPDF}
          disabled={generandoPDF}
          className={`w-full md:w-auto px-5 py-2 rounded-lg text-white font-semibold shadow-md ${
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
          className={`w-full md:w-auto px-5 py-2 rounded-lg font-semibold shadow-md border ${
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
          <h3 className="font-semibold text-[#8B6A4B]">Pagos Online</h3>
          <p className="text-xl sm:text-2xl font-bold text-[#B08968] mt-1">
            ${ingresos.totalOnline.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-xl shadow">
          <h3 className="font-semibold text-yellow-700">Pagos en Consultorio</h3>
          <p className="text-xl sm:text-2xl font-bold text-yellow-800 mt-1">
            ${ingresos.totalConsultorio.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-[#E9DED2] rounded-xl shadow">
          <h3 className="font-semibold text-[#4E3B2B]">Total Esperado</h3>
          <p className="text-xl sm:text-2xl font-bold text-[#8B6A4B] mt-1">
            ${ingresos.totalEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      {/* === FILTRO GRÁFICO === */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
        {(["todos", "online", "consultorio"] as Filtro[]).map((btn) => (
          <motion.button
            key={btn}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFiltro(btn)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm border ${
              filtro === btn
                ? "bg-[#B08968] text-white border-[#B08968]"
                : "bg-white text-[#4E3B2B] border-[#E5D8C8] hover:bg-[#E9DED2]"
            }`}
          >
            {btn.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* === GRÁFICA === */}
      <div id="grafica-ingresos" className="bg-white p-6 rounded-xl shadow-md mt-4 border border-[#E5D8C8]">
        <h3 className="text-lg font-semibold text-center mb-3 text-[#8B6A4B]">
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
            className="bg-[#FBF7F2] border border-[#E5D8C8] rounded-xl mt-6 overflow-hidden"
          >
            <HistorialReportes />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
