"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Asegúrate de importar useRouter
import { motion } from "framer-motion";
import { PALETTE } from "./page";
import { Procedimiento } from "../utils/localDB";

export default function AgendarForm({
  usuario,
  esPrimeraCita,
  procedimientos = [],
  formData,
  setFormData,
  handleConfirmar,
  goBack,
}: {
  usuario: any | null;
  esPrimeraCita: boolean;
  procedimientos?: Procedimiento[];
  formData: any;
  setFormData: (v: any) => void;
  handleConfirmar: () => void;
  goBack: () => void;
}) {
  const router = useRouter(); // Instanciamos el router
  const listaProcedimientos = Array.isArray(procedimientos) ? procedimientos : [];

  // Filtrar procedimientos por categoría
  const procedimientosFaciales = listaProcedimientos.filter(
    (p) => p.categoria === "Facial"
  );
  const procedimientosCorporales = listaProcedimientos.filter(
    (p) => p.categoria === "Corporal"
  );
  const procedimientosCapilares = listaProcedimientos.filter(
    (p) => p.categoria === "Capilar"
  );

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    // Llamamos a la función handleConfirmar (si tiene lógica adicional)
    handleConfirmar();
  };

  return (
    <motion.div
      key="panel-form"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="rounded-3xl shadow-2xl"
      style={{
        background: PALETTE.surface,
        border: `1px solid ${PALETTE.border}`,
      }}
    >
      {/* ===== Encabezado ===== */}
      <div
        className="p-6 border-b flex flex-col gap-2 text-center"
        style={{ borderColor: PALETTE.border }}
      >
        <h2 className="text-3xl font-serif" style={{ color: PALETTE.main }}>
          Completa tus datos
        </h2>
        {usuario && esPrimeraCita && (
          <div
            className="text-sm rounded-lg p-3 mx-auto max-w-lg"
            style={{
              background: "#E8E1D4",
              border: `1px solid ${PALETTE.border}`,
              color: PALETTE.textSoft,
            }}
          >
            La <b>primera cita</b> es una <b>consulta de valoración</b>, y
            <b> dependiendo del diagnóstico</b>, se podría <b>realizar el
            procedimiento</b> indicado en la <b>misma cita</b>.
          </div>
        )}
      </div>

      {/* ===== Formulario ===== */}
      <form
        className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue(); // Llamamos a la función que maneja la redirección
        }}
      >
        {/* Nombre */}
        <div className="md:col-span-2">
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Nombre completo *
          </label>
          <input
            value={formData.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Ej: Laura Gómez"
            required
            className="w-full p-3 rounded-lg shadow-sm focus:outline-none transition-all"
            style={{
              border: `1px solid ${PALETTE.border}`,
              background: "white",
              color: PALETTE.text,
            }}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Teléfono *
          </label>
          <input
            value={formData.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            type="tel"
            placeholder="Solo números"
            required
            pattern="[0-9]{7,}"
            className="w-full p-3 rounded-lg shadow-sm focus:outline-none transition-all"
            style={{
              border: `1px solid ${PALETTE.border}`,
              background: "white",
              color: PALETTE.text,
            }}
          />
        </div>

        {/* Correo */}
        <div>
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Correo electrónico *
          </label>
          <input
            value={formData.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
            type="email"
            placeholder="ejemplo@correo.com"
            required
            className="w-full p-3 rounded-lg shadow-sm focus:outline-none transition-all"
            style={{
              border: `1px solid ${PALETTE.border}`,
              background: "white",
              color: PALETTE.text,
            }}
          />
        </div>

        {/* Tipo de cita */}
        <div className="md:col-span-2">
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Tipo de cita
          </label>
          <input
            value={
              esPrimeraCita
                ? "Consulta de valoración (primera cita)"
                : "Procedimiento / Implementación"
            }
            readOnly
            className="w-full p-3 rounded-lg shadow-sm bg-[#FDFBF9] cursor-not-allowed"
            style={{
              border: `1px solid ${PALETTE.border}`,
              color: PALETTE.textSoft,
            }}
          />
        </div>

        {/* Procedimiento */}
        <div className="md:col-span-2">
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Procedimiento *
          </label>
          <select
            value={formData.procedimiento}
            onChange={(e) => handleChange("procedimiento", e.target.value)}
            required
            className="w-full p-3 rounded-lg shadow-sm focus:outline-none"
            style={{
              border: `1px solid ${PALETTE.border}`,
              background: "white",
              color: PALETTE.text,
            }}
          >
            <option value="">Selecciona un procedimiento</option>

            {/* Procedimientos Faciales */}
            <optgroup label="Faciales">
              {procedimientosFaciales.map((p) => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </optgroup>

            {/* Procedimientos Corporales */}
            <optgroup label="Corporales">
              {procedimientosCorporales.map((p) => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </optgroup>

            {/* Procedimientos Capilares */}
            <optgroup label="Capilares">
              {procedimientosCapilares.map((p) => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Nota */}
        <div className="md:col-span-2">
          <label
            className="block mb-1 text-sm font-semibold"
            style={{ color: PALETTE.textSoft }}
          >
            Nota (opcional)
          </label>
          <textarea
            value={formData.nota}
            onChange={(e) => handleChange("nota", e.target.value)}
            rows={3}
            className="w-full p-3 rounded-lg shadow-sm focus:outline-none transition-all"
            style={{
              border: `1px solid ${PALETTE.border}`,
              background: "white",
              color: PALETTE.text,
            }}
          />
        </div>

        {/* Botones */}
        <div className="md:col-span-2 mt-8 flex justify-center gap-4">
          <motion.button
            type="button"
            onClick={goBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg text-[#4E3B2B] border border-[#E9DED2] hover:bg-[#F5EFE7] transition"
          >
            ← Volver
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg font-semibold shadow-md transition"
            style={{
              background: PALETTE.main,
              color: "white",
              opacity:
                !formData.nombre ||
                !formData.telefono ||
                !formData.correo ||
                !formData.procedimiento
                  ? 0.6
                  : 1,
              cursor:
                !formData.nombre ||
                !formData.telefono ||
                !formData.correo ||
                !formData.procedimiento
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={
              !formData.nombre ||
              !formData.telefono ||
              !formData.correo ||
              !formData.procedimiento
            }
          >
            Continuar
          </motion.button>
        </div>

        {/* Recordatorio */}
        {!usuario && (
          <div
            className="md:col-span-2 mt-4 p-3 rounded-lg text-sm text-center"
            style={{
              background: "#FFF7E6",
              border: `1px solid ${PALETTE.border}`,
              color: PALETTE.textSoft,
            }}
          >
            <b>Recuerda:</b> debes tener una cuenta para que tus datos se
            guarden y puedas consultar o cancelar tus citas futuras desde tu
            perfil.
          </div>
        )}
      </form>
    </motion.div>
  );
}
