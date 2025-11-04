"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { confirmarCita, cancelarCita, Cita } from "../../utils/localDB";
import { PALETTE } from "../../agendar/page";

interface Props {
  cita: Cita;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CitasAgendadasModalSimple({ cita, onClose, onUpdated }: Props) {
  const [confirmPrompt, setConfirmPrompt] = useState<null | string>(null);

  // === ESTADOS DE CITA ===
  const estados = [
    { label: "Pendiente", value: "pendiente", color: "#E6C676" },
    { label: "Confirmada", value: "confirmada", color: "#6FB2E3" },
    { label: "Atendida", value: "atendida", color: "#78B66D" },
  ];

  const idxEstado = estados.findIndex((e) => e.value === cita.estado);

  // === ACCIONES ===
  const handleConfirmar = () => {
    confirmarCita(cita.id);
    onUpdated();
    onClose();
  };

  const handleCancelar = () => {
    cancelarCita(cita.id);
    onUpdated();
    onClose();
  };

  const handleReagendar = () => {
    window.location.href = `/administrar/citasAgendadasEditar?id=${cita.id}`;
  };

  // === MENSAJES ===
  const mensajes = {
    confirmar: "¿Deseas confirmar esta cita?",
    cancelar: "¿Seguro que deseas cancelarla?",
    reagendar: "¿Deseas reagendar esta cita?",
  };

  const colorAccion = {
    confirmar: "#6FB2E3",
    cancelar: "#E57373",
    reagendar: "#E5D8C8",
  }[confirmPrompt || "confirmar"];

  // === COMPONENTE ===
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#FBF7F2] p-6 rounded-2xl shadow-2xl w-[95%] max-w-md border border-[#E5D8C8]"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F1E6DA] transition"
          >
            <ArrowLeft size={20} className="text-[#6E5A49]" />
          </button>
          <h3 className="text-xl font-semibold text-[#8B6A4B] tracking-wide">
            Detalle de cita #{cita.id}
          </h3>
        </div>

        {/* === BARRA DE ESTADO === */}
        <div className="relative w-full mt-4 mb-8">
          <div className="h-[5px] bg-[#E5D8C8] rounded-full absolute top-1/2 -translate-y-1/2 left-0 w-full" />
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(idxEstado / (estados.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-[5px] bg-gradient-to-r from-[#C7A27A] to-[#B08968] rounded-full absolute top-1/2 -translate-y-1/2 left-0"
          />
 <div className="flex justify-between relative z-10 px-1">
    {estados.map((e, i) => (
      <div key={e.value} className="flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md -translate-y-3"
          style={{
            backgroundColor: i <= idxEstado ? e.color : "#D9CBB6",
          }}
                >
                  {i + 1}
                </div>
                <span className="text-xs mt-2 text-[#6E5A49] font-medium">
                  {e.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* === INFO DE CITA === */}
        <div
          className="bg-white rounded-xl shadow-md p-4 mb-6 border text-sm leading-6"
          style={{ borderColor: PALETTE.border, color: PALETTE.text }}
        >
          <p>
            <strong>Paciente:</strong> {cita.nombres} {cita.apellidos}
          </p>
          <p>
            <strong>Procedimiento:</strong> {cita.procedimiento}
          </p>
          <p>
            <strong>Fecha:</strong> {cita.fecha.slice(0, 10)} —{" "}
            <strong>Hora:</strong> {cita.hora}
          </p>
          <p>
            <strong>Estado actual:</strong>{" "}
            <span
              className="capitalize font-medium"
              style={{ color: PALETTE.main }}
            >
              {cita.estado}
            </span>
          </p>
        </div>

        {/* === ACCIONES / ESTADO FINAL === */}
        {cita.estado !== "atendida" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => setConfirmPrompt("confirmar")}
              className="px-4 py-2 bg-[#8B6A4B] text-white rounded-md hover:bg-[#A58360] transition font-medium shadow-sm"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmPrompt("reagendar")}
              className="px-4 py-2 bg-[#E9E0D1] text-[#4E3B2B] rounded-md hover:bg-[#E0D2BA] transition font-medium shadow-sm"
            >
              Reagendar
            </button>
            <button
              onClick={() => setConfirmPrompt("cancelar")}
              className="px-4 py-2 bg-[#C27C6A] text-white rounded-md hover:bg-[#B36555] transition font-medium shadow-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="text-center mt-8 space-y-4">
            <CheckCircle2 size={48} className="text-[#78B66D] mx-auto" />
            <p className="text-[#4E3B2B] font-medium">
              Cita concluida, fue correctamente registrada en ingresos.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#B08968] text-white rounded-md hover:bg-[#9C7A54] transition font-semibold shadow-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* === CONFIRMACIÓN === */}
        <AnimatePresence>
          {confirmPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex justify-center items-center bg-black/40 z-[10000]"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm w-[90%] border border-[#E5D8C8]"
              >
                <p className="text-[#4E3B2B] mb-4 font-medium">
                  {mensajes[confirmPrompt as keyof typeof mensajes]}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      if (confirmPrompt === "confirmar") handleConfirmar();
                      if (confirmPrompt === "cancelar") handleCancelar();
                      if (confirmPrompt === "reagendar") handleReagendar();
                    }}
                    className="px-4 py-2 text-white rounded-md shadow-md hover:opacity-90 transition"
                    style={{ backgroundColor: colorAccion }}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmPrompt(null)}
                    className="px-4 py-2 bg-gray-200 text-[#4E3B2B] rounded-md hover:bg-gray-300"
                  >
                    No
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
