"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cita, deleteCita } from "../../utils/localDB"; // ✅ ruta corregida
import { PALETTE } from "../../agendar/page";

interface Props {
  cita: Cita;
  onVerDetalles?: (cita: Cita) => void;
  onCancelar?: () => void; // nombre consistente
}

export default function CitasAgendadasCard({ cita, onVerDetalles, onCancelar }: Props) {
  const estadoPago = cita.pagado ? "PAGADO" : "POR PAGAR";
  const colorPago = cita.pagado ? "bg-green-200 text-green-800" : "bg-yellow-100 text-yellow-700";

  const handleCancelar = () => {
    if (confirm(`¿Seguro que deseas cancelar la cita de ${cita.nombres}?`)) {
      deleteCita(cita.id); // elimina del localStorage
      onCancelar?.(); // notifica al componente padre
    }
  };

  return (
    <motion.div
      className="rounded-xl border border-[--border] bg-[--surface] shadow-md p-4 flex flex-col gap-2 hover:shadow-lg transition-all duration-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" style={{ color: PALETTE.main }}>
          {cita.procedimiento}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${colorPago}`}
        >
          {estadoPago}
        </span>
      </div>

      <div className="text-sm text-[--textSoft]">
        <p><strong>Fecha:</strong> {cita.fecha}</p>
        <p><strong>Hora:</strong> {cita.hora}</p>
        <p><strong>Paciente:</strong> {cita.nombres} {cita.apellidos}</p>
        <p><strong>Teléfono:</strong> {cita.telefono}</p>
        <p><strong>Correo:</strong> {cita.correo}</p>
      </div>

      {/* === BOTONES === */}
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => onVerDetalles?.(cita)}
          className="px-3 py-1 rounded-lg bg-[--main] text-white text-sm hover:bg-[--mainHover] transition"
        >
          Ver Detalles
        </button>

        {!cita.pagado && (
          <button
            onClick={handleCancelar}
            className="px-3 py-1 rounded-lg bg-red-200 text-red-800 text-sm hover:bg-red-300 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </motion.div>
  );
}
