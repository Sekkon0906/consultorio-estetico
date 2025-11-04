"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHorarioPorFecha,
  getCitasByDay,
  getBloqueosPorFecha,
} from "../utils/localDB";
import { PALETTE } from "./page";

const nombresMes = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function AgendarCalendar({
  fecha,
  hora,
  onFechaSelect,
  onHoraSelect,
  usuario,
}: {
  fecha: Date | null;
  hora: string;
  onFechaSelect: (v: Date) => void;
  onHoraSelect: (v: string) => void;
  usuario?: any;
}) {

  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);

  // ======= Generar días del mes =======
  const generarDias = () => {
    const primerDia = new Date(anio, mes, 1).getDay() || 7;
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const dias: (number | null)[] = [];
    for (let i = 1; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    return dias;
  };

  // ======= Cargar horas disponibles =======
  const cargarHoras = () => {
    if (!selectedDate) return;
    const fecha = new Date(selectedDate);
    const fechaISO = fecha.toISOString().slice(0, 10);

    const base = getHorarioPorFecha(fechaISO);
    const bloqueos = getBloqueosPorFecha(fechaISO);
    const citas = getCitasByDay(fechaISO);

    const libres = base
      .filter(
        (h) =>
          h.disponible &&
          !bloqueos.some((b) => b.hora === h.hora) &&
          !citas.some((c) => c.hora === h.hora && c.estado !== "cancelada")
      )
      .map((h) => h.hora);

    const ahora = new Date();
    const esHoy = fecha.toDateString() === ahora.toDateString();
    const filtradas = libres.filter((h) => {
      if (!esHoy) return true;
      const [hh, mm] = h.replace(/[^0-9:]/g, "").split(":").map(Number);
      const fechaHora = new Date();
      fechaHora.setHours(hh, mm, 0, 0);
      return fechaHora >= ahora;
    });

    setHorasDisponibles(filtradas);
  };

  useEffect(() => {
    cargarHoras();
  }, [selectedDate]);

  // ======= Sincronización automática =======
  useEffect(() => {
    const handler = () => cargarHoras();
    window.addEventListener("horarioCambiado", handler);
    return () => window.removeEventListener("horarioCambiado", handler);
  }, [selectedDate]);

  // ======= Seleccionar día =======
  const handleDateClick = (d: number | null) => {
    if (!d) return;
    const fecha = new Date(anio, mes, d);
    const fechaISO = fecha.toISOString().slice(0, 10);
    setSelectedDate(fechaISO);
    onFechaSelect(fecha);
  };

  // ======= Render =======
  return (
    <div className="flex flex-col items-center w-full">
      {/* === FILA PRINCIPAL === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex flex-col md:flex-row justify-center items-start gap-10"
      >
        {/* === CALENDARIO === */}
        <div
          className="bg-[#FBF7F2] p-6 rounded-xl shadow-md w-full md:w-[45%] flex flex-col items-center"
          style={{ border: `1px solid ${PALETTE.border}` }}
        >
          {/* CABECERA */}
          <div className="flex justify-between items-center mb-4 w-full">
            <button
              onClick={() => {
                if (mes === 0) {
                  setMes(11);
                  setAnio((a) => a - 1);
                } else setMes((m) => m - 1);
              }}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ◀
            </button>
            <span className="text-[#8B6A4B] font-bold capitalize tracking-wide text-lg">
              {nombresMes[mes]} {anio}
            </span>
            <button
              onClick={() => {
                if (mes === 11) {
                  setMes(0);
                  setAnio((a) => a + 1);
                } else setMes((m) => m + 1);
              }}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ▶
            </button>
          </div>

          {/* DÍAS DE SEMANA */}
          <div className="grid grid-cols-7 w-full mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="text-center font-semibold text-[#6E5A49] text-sm border-b border-[#E5D8C8] pb-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* DÍAS DEL MES */}
          <div className="grid grid-cols-7 gap-1 w-full mb-4">
            {generarDias().map((d, i) => {
              const fechaISO = d ? new Date(anio, mes, d).toISOString().slice(0, 10) : "";
              const isSelected = selectedDate === fechaISO;
              const fechaBtn = new Date(anio, mes, d ?? 1);
              const esPasado = fechaBtn < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDateClick(d)}
                  disabled={!d || esPasado}
                  className={`h-10 w-full rounded-md text-sm font-medium transition-all ${
                    !d
                      ? "bg-transparent cursor-default"
                      : esPasado
                      ? "bg-transparent text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#B08968] text-white shadow-inner"
                      : "bg-white hover:bg-[#F1E6DA] text-[#32261C]"
                  }`}
                >
                  {d ?? ""}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* === VINETA DE HORAS === */}
        <div
          className="bg-[#FBF7F2] p-8 rounded-xl shadow-md flex flex-col items-center w-full md:w-[45%]"
          style={{ border: `1px solid ${PALETTE.border}` }}
        >
          <h2
            className="text-2xl font-serif mb-2 text-center"
            style={{ color: PALETTE.main }}
          >
            Selecciona un día y hora para agendar tu cita
          </h2>
          <h3
            className="text-lg font-serif mb-4 text-center"
            style={{ color: PALETTE.text }}
          >
            Horas disponibles
          </h3>

          {!selectedDate ? (
            <p className="text-[#6E5A49] text-center">
              Elige un día para ver los horarios disponibles.
            </p>
          ) : horasDisponibles.length === 0 ? (
            <p className="text-[#6E5A49] italic text-center">
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatePresence>
                {horasDisponibles.map((h) => (
                  <motion.button
                    key={h}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => onHoraSelect(h)}
                    className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
                      hora === h
                        ? "bg-[#8B6A4B] text-white"
                        : "bg-[#FFF7ED] hover:bg-[#E6CCB2] text-[#32261C]"
                    }`}
                    style={{
                      border: `1px solid ${PALETTE.border}`,
                      fontSize: "1rem",
                    }}
                  >
                    {h}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* === BOTÓN EXTERNO ALINEADO ABAJO === */}

  
      
    </div>
  );
}
