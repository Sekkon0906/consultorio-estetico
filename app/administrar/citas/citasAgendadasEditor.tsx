"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cita, updateCita } from "../../utils/localDB";
import { PALETTE } from "../../agendar/page";

interface Props {
  cita: Cita;
  onClose: () => void;
}

export default function CitasAgendadasEditor({ cita: citaInicial, onClose }: Props) {
  const [cita, setCita] = useState<Cita>({ ...citaInicial });
  const [guardado, setGuardado] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCita({ ...cita, [name]: value });
  };

  const handleSave = () => {
    updateCita(cita.id, cita);
    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      onClose();
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto border border-[#E5D8C8]"
    >
      <h2
        className="text-2xl font-semibold text-center mb-6"
        style={{ color: PALETTE.main }}
      >
        Reagendar / Editar Cita
      </h2>

      {/* === FORM === */}
      <form className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-[#6E5A49] mb-1">
            Procedimiento
          </label>
          <input
            name="procedimiento"
            value={cita.procedimiento}
            onChange={handleChange}
            className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#6E5A49] mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={cita.fecha.slice(0, 10)}
              onChange={handleChange}
              className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E5A49] mb-1">
              Hora
            </label>
            <input
              name="hora"
              value={cita.hora}
              onChange={handleChange}
              className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#6E5A49] mb-1">
            Nota o comentario (opcional)
          </label>
          <textarea
            name="nota"
            value={cita.nota || ""}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#6E5A49] mb-1">
              Método de pago
            </label>
            <select
              name="metodoPago"
              value={cita.metodoPago || ""}
              onChange={handleChange}
              className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
            >
              <option value="">Seleccionar</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E5A49] mb-1">
              Estado de la cita
            </label>
            <select
              name="estado"
              value={cita.estado}
              onChange={handleChange}
              className="w-full p-3 border border-[#E5D8C8] rounded-lg bg-[#FFFDF9] focus:ring-2 focus:ring-[#B08968]"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="atendida">Atendida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* === BOTONES === */}
        <div className="flex justify-center mt-6 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#B08968] to-[#D1A97A] text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            Guardar cambios
          </motion.button>

          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 rounded-md bg-gray-200 text-[#4E3B2B] hover:bg-gray-300 transition font-medium"
          >
            Volver
          </button>
        </div>
      </form>

      {guardado && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-green-700 font-medium"
        >
          Cita actualizada correctamente
        </motion.div>
      )}
    </motion.div>
  );
}
