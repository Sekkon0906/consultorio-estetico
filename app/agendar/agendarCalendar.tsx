"use client";

import { useEffect, useState, useCallback } from "react";
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

interface AgendarCalendarProps {
  fecha: Date | null;
  hora: string;
  onFechaSelect: (v: Date) => void;
  onHoraSelect: (v: string) => void;
  // ❗ Si más adelante quieres usuario:
  // usuario?: Usuario;
}

export default function AgendarCalendar({
  fecha,
  hora,
  onFechaSelect,
  onHoraSelect,
}: AgendarCalendarProps) {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());

  // Si viene una fecha inicial, la usamos; si no, null
  const [selectedDate, setSelectedDate] = useState<string | null>(
    fecha ? fecha.toISOString().slice(0, 10) : null
  );
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
  const cargarHoras = useCallback(() => {
    if (!selectedDate) return;

    const fechaObj = new Date(selectedDate);
    const fechaISO = selectedDate; // ya es YYYY-MM-DD

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
    const esHoy = fechaObj.toDateString() === ahora.toDateString();

    const filtradas = libres.filter((h) => {
      if (!esHoy) return true;
      const [hh, mm] = h.replace(/[^0-9:]/g, "").split(":").map(Number);
      const fechaHora = new Date();
      fechaHora.setHours(hh, mm, 0, 0);
      return fechaHora >= ahora;
    });

    setHorasDisponibles(filtradas);
  }, [selectedDate]);

  useEffect(() => {
    cargarHoras();
  }, [cargarHoras]);

  // ======= Sincronización automática =======
  useEffect(() => {
    const handler = () => cargarHoras();
    window.addEventListener("horarioCambiado", handler);
    return () => window.removeEventListener("horarioCambiado", handler);
  }, [cargarHoras]);

  // ======= Seleccionar día =======
  const handleDateClick = (d: number | null) => {
    if (!d) return;
    const fechaNueva = new Date(anio, mes, d);
    const fechaISO = fechaNueva.toISOString().slice(0, 10);
    setSelectedDate(fechaISO);
    onFechaSelect(fechaNueva);
  };

  // ======= Render =======
  return (
    <div className="flex flex-col items-center w-full">
      {/* resto del JSX igual que lo tenías */}
    </div>
  );
}
