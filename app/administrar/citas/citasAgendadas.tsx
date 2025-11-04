"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "../../agendar/page";
import { getCitasByDay, Cita } from "../../utils/localDB";
import CitasAgendadasCard from "./citasAgendadasCard";
import CitasAgendadasModal from "./citasAgendadasModal";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function CitasAgendadas() {
  const [isClient, setIsClient] = useState(false);
  const [mes, setMes] = useState(0);
  const [anio, setAnio] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Cita | null>(null);
  const [ascendente, setAscendente] = useState(true);

  // Montaje del cliente
  useEffect(() => {
    const hoy = new Date();
    setMes(hoy.getMonth());
    setAnio(hoy.getFullYear());
    setIsClient(true);
  }, []);

  // Citas del día — usamos useMemo sin condicionales
  const citas = useMemo(() => {
    if (!selectedDate) return [];
    const citasDia = getCitasByDay(selectedDate);
    return citasDia.sort((a, b) =>
      ascendente ? a.hora.localeCompare(b.hora) : b.hora.localeCompare(a.hora)
    );
  }, [selectedDate, ascendente]);

  // Generar calendario
  const diasEnMes = useMemo(() => new Date(anio, mes + 1, 0).getDate(), [anio, mes]);
  const primerDiaSemana = useMemo(() => new Date(anio, mes, 1).getDay(), [anio, mes]);
  const nombresMes = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const generarDias = useMemo(() => {
    const dias: (number | null)[] = [];
    const offset = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    for (let i = 0; i < offset; i++) dias.push(null);
    for (let i = 1; i <= diasEnMes; i++) dias.push(i);
    return dias;
  }, [diasEnMes, primerDiaSemana]);

  const handleDateClick = (dia: number | null) => {
    if (!dia) return;
    const fecha = new Date(anio, mes, dia).toISOString().slice(0, 10);
    setSelectedDate(fecha);
  };

  if (!isClient)
    return <div className="text-center py-20 text-[#6E5A49]">Cargando citas...</div>;

  return (
    <div className="p-6 space-y-6 relative">
      <h2 className="text-2xl font-semibold text-center" style={{ color: PALETTE.main }}>
        Citas Agendadas
      </h2>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
        {/* === CALENDARIO === */}
        <div
          className="bg-[#FBF7F2] p-6 rounded-xl shadow-md w-full md:w-[45%] flex flex-col items-center"
          style={{ border: `1px solid ${PALETTE.border}` }}
        >
          <div className="flex justify-between items-center mb-4 w-full">
            <button
              onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ◀
            </button>
            <span className="text-[#8B6A4B] font-bold capitalize tracking-wide text-lg">
              {nombresMes[mes]} {anio}
            </span>
            <button
              onClick={() => setMes((m) => (m === 11 ? 0 : m + 1))}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ▶
            </button>
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 w-full mb-2">
            {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
              <div key={d} className="text-center font-semibold text-[#6E5A49] text-sm border-b border-[#E5D8C8] pb-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 w-full mb-4">
            {generarDias.map((d, i) => {
              const fechaISO = d ? new Date(anio, mes, d).toISOString().slice(0, 10) : "";
              const isSelected = selectedDate === fechaISO;
              const tieneCitas = d && getCitasByDay(fechaISO).length > 0;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDateClick(d)}
                  disabled={!d}
                  className={`h-10 w-full rounded-md text-sm font-medium transition-all relative ${
                    !d
                      ? "bg-transparent cursor-default"
                      : isSelected
                      ? "bg-[#B08968] text-white shadow-inner"
                      : "bg-white hover:bg-[#F1E6DA] text-[#32261C]"
                  }`}
                >
                  {d ?? ""}
                  {tieneCitas && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#B08968] rounded-full"></span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* === LISTA DE CITAS === */}
        <div className="flex-1 bg-[#FBF7F2] p-6 rounded-xl shadow-md border border-[#E5D8C8] min-h-[400px]">
          {!selectedDate ? (
            <p className="text-[#6E5A49] text-center mt-16 italic">
              Selecciona un día para ver las citas agendadas.
            </p>
          ) : citas.length === 0 ? (
            <p className="text-[#6E5A49] text-center mt-16 italic">
              No hay citas registradas para el {selectedDate}.
            </p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#8B6A4B]">
                  Citas del {selectedDate}
                </h3>
                <button
                  onClick={() => setAscendente(!ascendente)}
                  className="flex items-center gap-1 text-sm text-[#6E5A49] hover:text-[#8B6A4B]"
                >
                  {ascendente ? (
                    <>
                      <ChevronUp size={16} /> Ascendente
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Descendente
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                {citas.map((cita) => (
                  <CitasAgendadasCard
                    key={cita.id}
                    cita={cita}
                    onVerDetalles={setDetalle}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* === MODAL DETALLE === */}
      <AnimatePresence>
        {detalle && (
          <CitasAgendadasModal
            cita={detalle}
            onClose={() => setDetalle(null)}
            onUpdated={() =>
              selectedDate && setDetalle(null)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
