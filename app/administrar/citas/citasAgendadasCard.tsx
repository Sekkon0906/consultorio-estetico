"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cita } from "../../utils/localDB";
import { PALETTE } from "../../agendar/page";

interface Props {
  cita: Cita;
  onVerDetalles?: (cita: Cita) => void;
}

export default function CitasAgendadasCard({ cita, onVerDetalles }: Props) {
  const estadoColor =
    cita.estado === "pendiente"
      ? "text-yellow-700"
      : cita.estado === "confirmada"
      ? "text-blue-700"
      : cita.estado === "atendida"
      ? "text-green-700"
      : "text-gray-600";

  return (
    <motion.div
      className="rounded-xl border border-[#E5D8C8] bg-white shadow-sm p-5 flex flex-col gap-2 hover:shadow-lg transition-all duration-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3
          className="text-lg font-semibold truncate"
          style={{ color: PALETTE.main }}
        >
          {cita.nombres} {cita.apellidos}
        </h3>
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${estadoColor}`}
        >
          {cita.estado}
        </span>
      </div>

      <div className="text-sm text-[#6E5A49] space-y-1">
        <p>
          <strong>Hora:</strong> {cita.hora}
        </p>
        <p>
          <strong>Procedimiento:</strong> {cita.procedimiento}
        </p>
        <p>
          <strong>Teléfono:</strong> {cita.telefono}
        </p>
        <p>
          <strong>Correo:</strong> {cita.correo}
        </p>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={() => onVerDetalles?.(cita)}
          className="px-4 py-2 rounded-lg bg-[#B08968] text-white text-sm hover:bg-[#9C7A54] transition"
        >
          Ver más
        </button>
      </div>
    </motion.div>
  );
}
