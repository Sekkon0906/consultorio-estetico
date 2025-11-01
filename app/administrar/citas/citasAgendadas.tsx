"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCitasByDay,
  getBloqueosPorFecha,
  addBloqueo,
  removeBloqueo,
  isHoraBloqueada,
  Cita,
  BloqueoHora,
} from "../../utils/localDB";
import { PALETTE } from "../../agendar/page";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// Componente principal
export default function CitasAgendadas() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoHora[]>([]);
  const [motivo, setMotivo] = useState("");
  const [popup, setPopup] = useState<{ hora: string; modo: "bloquear" | "desbloquear" | null }>({
    hora: "",
    modo: null,
  });
  const [toast, setToast] = useState<string | null>(null);

  const fechaISO = selectedDate.toISOString().slice(0, 10);
  const horas = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  ];

  // Cargar citas y bloqueos del día
  useEffect(() => {
    setCitas(getCitasByDay(fechaISO));
    setBloqueos(getBloqueosPorFecha(fechaISO));
  }, [selectedDate]);

  // Manejar selección de fecha (corrección de tipo)
  const handleSelectDate = (value: Value, _event: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  // Al hacer clic en una hora
  const handleHoraClick = (hora: string) => {
    const bloqueada = isHoraBloqueada(fechaISO, hora);
    if (bloqueada) {
      setPopup({ hora, modo: "desbloquear" });
    } else {
      setPopup({ hora, modo: "bloquear" });
    }
  };

  // Confirmar acción (bloquear o desbloquear)
  const handleConfirm = () => {
    if (popup.modo === "bloquear") {
      if (!motivo.trim()) {
        alert("Debes escribir un motivo para el bloqueo");
        return;
      }
      addBloqueo({ fechaISO, hora: popup.hora, motivo });
      setToast(`Hora ${popup.hora} bloqueada correctamente`);
    } else if (popup.modo === "desbloquear") {
      removeBloqueo(fechaISO, popup.hora);
      setToast(`Hora ${popup.hora} desbloqueada correctamente`);
    }

    setBloqueos(getBloqueosPorFecha(fechaISO));
    setMotivo("");
    setPopup({ hora: "", modo: null });

    // Autoocultar el toast
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = () => {
    setMotivo("");
    setPopup({ hora: "", modo: null });
  };

  return (
    <div className="p-6 space-y-6 relative">
      <h2 className="text-2xl font-semibold text-center" style={{ color: PALETTE.main }}>
        Citas y Bloqueos del Día
      </h2>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
        {/* === CALENDARIO === */}
        <div className="bg-[--surface] p-4 rounded-xl shadow-md">
          <Calendar value={selectedDate} onChange={handleSelectDate} />
        </div>

        {/* === HORARIO === */}
        <div className="flex-1 bg-[--surface] p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-center mb-3">
            Horario del {fechaISO}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {horas.map((hora) => {
              const cita = citas.find((c) => c.hora === hora);
              const bloqueo = bloqueos.find((b) => b.hora === hora);
              const bloqueada = Boolean(bloqueo);

              return (
                <motion.div
                  key={hora}
                  whileHover={{ scale: 1.03 }}
                  className={`p-3 text-center rounded-lg border cursor-pointer relative transition-all ${
                    cita
                      ? "bg-[--main]/10 border-[--main] text-[--main]"
                      : bloqueada
                      ? "bg-red-100 border-red-300 text-red-800"
                      : "bg-white border-gray-200 hover:bg-[--main]/5"
                  }`}
                  onClick={() => handleHoraClick(hora)}
                >
                  <span className="block font-medium">{hora}</span>

                  {bloqueada && (
                    <span className="text-xs italic text-red-700 block">
                      {bloqueo?.motivo || "Bloqueada"}
                    </span>
                  )}
                  {cita && (
                    <span className="text-xs italic text-[--textSoft] block">
                      {cita.nombres} {cita.apellidos}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === POPUP DE BLOQUEO / DESBLOQUEO === */}
      <AnimatePresence>
        {popup.modo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[--surface] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center"
            >
              {popup.modo === "bloquear" ? (
                <>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: PALETTE.main }}
                  >
                    Bloquear hora {popup.hora}
                  </h3>

                  <textarea
                    placeholder="Motivo del bloqueo..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                  />

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-[--main] text-white rounded-lg hover:bg-[--mainHover]"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-700">
                    Desbloquear hora {popup.hora}
                  </h3>
                  <p className="text-sm text-[--textSoft] mb-4">
                    ¿Estás seguro de que quieres quitar el bloqueo para esta hora?
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Sí, desbloquear
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TOAST (Notificación) === */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 bg-[--main] text-white px-5 py-3 rounded-lg shadow-lg z-[9999]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
