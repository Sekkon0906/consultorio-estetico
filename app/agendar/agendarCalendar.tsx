// app/agendar/agendarCalendar.tsx  (o ruta equivalente)
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "./page";

import type {
  HoraDisponible,
  HorarioPorFecha,
  Cita,
  BloqueoHora,
  SessionUser,
} from "../types/domain";

import {
  getCitasByDayApi,
  getBloqueosPorFechaApi,
} from "../services/citasApi";

const nombresMes: string[] = [
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

interface AgendarCalendarProps {
  fecha: Date | null;
  hora: string;
  onFechaSelect: (v: Date | null) => void;
  onHoraSelect: (v: string) => void;
  usuario: SessionUser | null;
}

// =====================================================
//  Horario base en front (igual idea que en localDB)
//  - Aquí pongo un ejemplo de 8:00–12:00 y 14:00–18:00
//    Lunes a Viernes. Si en tu localDB tienes otra lógica,
//    puedes copiarla aquí respetando la firma.
// =====================================================
function buildHorarioPorFecha(fechaISO: string): HorarioPorFecha {
  const fecha = new Date(fechaISO);
  const diaSemana = fecha.getDay(); // 0=domingo, 6=sábado

  // ejemplo: Lunes–Viernes, cada 30 min de 8:00–12:00 y 14:00–18:00
  const slots: string[] = [];

  const pushRango = (inicioHora: number, finHora: number): void => {
    for (let h = inicioHora; h < finHora; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
  };

  if (diaSemana >= 1 && diaSemana <= 5) {
    pushRango(8, 12);
    pushRango(14, 18);
  } else if (diaSemana === 6) {
    // sábado 8:00–12:00
    pushRango(8, 12);
  }

  const horas: HoraDisponible[] = slots.map((h) => ({
    hora: `${h} AM`, // si quieres mostrar "08:00 AM", puedes ajustar
    disponible: true,
  }));

  return {
    fecha: fechaISO,
    horas,
  };
}

export default function AgendarCalendar({
  fecha,
  hora,
  onFechaSelect,
  onHoraSelect,
  usuario,
}: AgendarCalendarProps) {
  const hoy = new Date();
  const [anio, setAnio] = useState<number>(hoy.getFullYear());
  const [mes, setMes] = useState<number>(hoy.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);

  // ======= Generar días del mes =======
  const generarDias = (): (number | null)[] => {
    const primerDia = new Date(anio, mes, 1).getDay() || 7; // 0(domingo) -> 7
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const dias: (number | null)[] = [];

    for (let i = 1; i < primerDia; i += 1) dias.push(null);
    for (let d = 1; d <= diasEnMes; d += 1) dias.push(d);

    return dias;
  };

  // ======= Cargar horas disponibles desde BD real =======
  const cargarHoras = async (): Promise<void> => {
    if (!selectedDate) return;

    const fechaSel = new Date(selectedDate);
    const fechaISO = selectedDate; // ya viene en formato YYYY-MM-DD

    // horario base calculado en el front (igual que antes)
    const base: HorarioPorFecha = buildHorarioPorFecha(fechaISO);

    // datos reales desde backend
    let bloqueos: BloqueoHora[] = [];
    let citas: Cita[] = [];

    try {
      bloqueos = await getBloqueosPorFechaApi(fechaISO);
      citas = await getCitasByDayApi(fechaISO);
    } catch (err) {
      console.error("Error cargando horas desde API:", err);
    }

    const libres: string[] = base.horas
      .filter((hSlot: HoraDisponible) => {
        const bloqueado = bloqueos.some(
          (b) => b.hora === hSlot.hora
        );
        const ocupada = citas.some(
          (c) => c.hora === hSlot.hora && c.estado !== "cancelada"
        );
        return hSlot.disponible && !bloqueado && !ocupada;
      })
      .map((hSlot) => hSlot.hora);

    const ahora = new Date();
    const esHoy = fechaSel.toDateString() === ahora.toDateString();

    const filtradas: string[] = libres.filter((hSlot) => {
      if (!esHoy) return true;

      const soloHora: string = hSlot.replace(/[^0-9:]/g, "");
      const [hhStr, mmStr] = soloHora.split(":");
      const hh = Number(hhStr);
      const mm = Number(mmStr);

      const fechaHora = new Date();
      fechaHora.setHours(hh, mm, 0, 0);
      return fechaHora >= ahora;
    });

    setHorasDisponibles(filtradas);
  };

  // Cargar horas cuando cambia la fecha seleccionada
  useEffect(() => {
    void cargarHoras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Sincronizar cuando se emita el evento global de cambio de horario
  useEffect(() => {
    const handler = (): void => {
      void cargarHoras();
    };

    window.addEventListener("horarioCambiado", handler);
    return () => window.removeEventListener("horarioCambiado", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ======= Seleccionar día =======
  const handleDateClick = (d: number | null): void => {
    if (!d) return;
    const nuevaFecha = new Date(anio, mes, d);
    const fechaISO = nuevaFecha.toISOString().slice(0, 10);

    setSelectedDate(fechaISO);
    onFechaSelect(nuevaFecha);
  };

  // ======= Render =======
  return (
    <div className="flex flex-col items-center w-full">
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
              type="button"
              onClick={() => {
                if (mes === 0) {
                  setMes(11);
                  setAnio((a) => a - 1);
                } else {
                  setMes((m) => m - 1);
                }
              }}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ◀
            </button>

            <span className="text-[#8B6A4B] font-bold capitalize tracking-wide text-lg">
              {nombresMes[mes]} {anio}
            </span>

            <button
              type="button"
              onClick={() => {
                if (mes === 11) {
                  setMes(0);
                  setAnio((a) => a + 1);
                } else {
                  setMes((m) => m + 1);
                }
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
              const fechaISO =
                d != null
                  ? new Date(anio, mes, d).toISOString().slice(0, 10)
                  : "";
              const isSelected = selectedDate === fechaISO;

              const fechaBtn = new Date(anio, mes, d ?? 1);
              const esPasado =
                fechaBtn <
                new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <motion.button
                  key={i}
                  type="button"
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

        {/* === VIÑETA DE HORAS === */}
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
                {horasDisponibles.map((hSlot) => (
                  <motion.button
                    key={hSlot}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => onHoraSelect(hSlot)}
                    className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
                      hora === hSlot
                        ? "bg-[#8B6A4B] text-white"
                        : "bg-[#FFF7ED] hover:bg-[#E6CCB2] text-[#32261C]"
                    }`}
                    style={{
                      border: `1px solid ${PALETTE.border}`,
                      fontSize: "1rem",
                    }}
                  >
                    {hSlot}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
