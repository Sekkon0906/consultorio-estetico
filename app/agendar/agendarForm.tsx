"use client";

import { motion } from "framer-motion";
import { PALETTE } from "./page";
import { Procedimiento } from "../utils/localDB";
import { ArrowLeft, CalendarDays, Clock, RotateCcw } from "lucide-react";

// Tipo de usuario (si más adelante lo necesitas para más cosas lo ampliamos)
interface Usuario {
  id: string | number;
  nombre?: string;
  [key: string]: unknown;
}

// Tipo de los datos del formulario
interface AgendarFormData {
  fecha?: string;
  hora?: string;
  nombre: string;
  telefono: string;
  correo: string;
  procedimiento: string;
  nota?: string;
}

// Props del componente
interface AgendarFormProps {
  usuario: Usuario | null;
  esPrimeraCita: boolean;
  procedimientos?: Procedimiento[];
  formData: AgendarFormData;
  setFormData: (updater: (prev: AgendarFormData) => AgendarFormData) => void;
  handleConfirmar: () => void;
  goBack: () => void;
}

export default function AgendarForm({
  usuario,
  esPrimeraCita,
  procedimientos = [],
  formData,
  setFormData,
  handleConfirmar,
  goBack,
}: AgendarFormProps) {
  const listaProcedimientos = Array.isArray(procedimientos)
    ? procedimientos
    : [];

  const DARK_PALETTE = {
    ...PALETTE,
    text: "#2A1C12",
    textSoft: "#4B3726",
  };

  const procedimientosFaciales = listaProcedimientos.filter(
    (p) => p.categoria === "Facial"
  );
  const procedimientosCorporales = listaProcedimientos.filter(
    (p) => p.categoria === "Corporal"
  );
  const procedimientosCapilares = listaProcedimientos.filter(
    (p) => p.categoria === "Capilar"
  );

  // ✅ key solo puede ser una propiedad válida de AgendarFormData
  // ✅ value siempre es string porque viene de los inputs/textarea
  const handleChange = (key: keyof AgendarFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    handleConfirmar();
  };

  // === FORMATOS DE FECHA Y HORA ===
  const fmtDiaHumano = (date: Date) => {
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    return dias[date.getDay()];
  };

  const fmtFechaHumana = (date: Date) => {
    const meses = [
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
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const fmtHoraHumana = (hhmm: string) => {
    const [hStr, mStr] = hhmm.split(":");
    let h = Number(hStr);
    const suf = h >= 12 ? "p.m." : "a.m.";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return `${h}:${mStr} ${suf}`;
  };

  const fechaObj = formData.fecha ? new Date(formData.fecha) : null;

  return (
    <motion.div
      key="panel-form"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="rounded-3xl shadow-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FBF7F2 0%, #F4EBE2 100%)",
        border: `1px solid ${DARK_PALETTE.border}`,
        color: DARK_PALETTE.text,
      }}
    >
      {/* === BOTÓN VOLVER === */}
      <div
        className="p-6 flex items-center gap-2 cursor-pointer w-fit"
        onClick={goBack}
      >
        <ArrowLeft size={20} className="text-[#5C4533]" />
        <span className="text-sm font-medium text-[#5C4533] hover:text-[#8B6A4B] transition-colors">
          Volver
        </span>
      </div>

      {/* === ENCABEZADO === */}
      <div
        className="pb-6 text-center border-b"
        style={{ borderColor: DARK_PALETTE.border }}
      >
        <h2
          className="text-3xl font-serif mb-2"
          style={{ color: DARK_PALETTE.text }}
        >
          Completa tus datos
        </h2>

        {usuario && esPrimeraCita && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm rounded-lg p-3 mx-auto max-w-lg bg-[#E8E1D4] border border-[#E0D3C0]"
            style={{ color: DARK_PALETTE.textSoft }}
          >
            La <b>primera cita</b> es una <b>consulta de valoración</b>, y{" "}
            <b>dependiendo del diagnóstico</b>, se podría{" "}
            <b>realizar el procedimiento</b> indicado en la{" "}
            <b>misma cita</b>.
          </motion.div>
        )}
      </div>

      {/* === FORMULARIO === */}
      <form
        className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        {/* ... resto del JSX igual, usando handleChange y formData como ya lo tenías ... */}
      </form>
    </motion.div>
  );
}
