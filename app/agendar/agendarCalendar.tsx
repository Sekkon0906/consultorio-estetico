"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { PALETTE } from "./page";

// ✅ Import dinámico para evitar errores SSR
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

// ======= HORAS DISPONIBLES =======
const HORAS = [
  "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00",
];

// ======= FORMATEADORES =======
const fmtHoraHumana = (hhmm: string) => {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const suf = h >= 12 ? "p.m." : "a.m.";
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return `${h}:${mStr} ${suf}`;
};

const fmtDiaHumano = (date: Date) => {
  const dias = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
  ];
  return dias[date.getDay()];
};

const fmtFechaHumana = (date: Date) => {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
};

// ======= COMPONENTE PRINCIPAL =======
export default function AgendarCalendar({
  fecha,
  hora,
  onFechaSelect,
  onHoraSelect,
  usuario,
}: {
  fecha: Date | null;
  hora: string;
  onFechaSelect: (v: Date) => void;
  onHoraSelect: (v: string) => void;
  usuario: any;
}) {
  const diaTxt = fecha ? fmtDiaHumano(fecha) : "";
  const fechaTxt = fecha ? fmtFechaHumana(fecha) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex justify-center"
    >
      <motion.div
        layout
        className="rounded-[32px] shadow-2xl p-10 w-[100%] overflow-hidden relative"
        style={{
          maxWidth: "1000px",
          background: "linear-gradient(145deg, #FBF7F2, #FFFDFB)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* ======= CONTENEDOR PRINCIPAL ======= */}
        <motion.div
          key="calendar-view"
          initial={{ x: 0, opacity: 1 }}
          exit={{ x: -200, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center gap-12 w-full mt-6"
        >
          {/* ===== Calendario ===== */}
          <div className="flex justify-center items-center w-full md:w-auto">
            <div
              className="relative"
              style={{
                maxWidth: "400px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                className="calendar-scale-wrapper"
                style={{
                  transform: "scale(1.1)",
                  transformOrigin: "top center",
                }}
              >
                <div style={{ pointerEvents: "auto" }}>
                  <Calendar
                    locale="es-ES"
                    onChange={(value) => onFechaSelect(value as Date)}
                    value={fecha}
                    minDate={new Date()}
                    className="rounded-3xl border-0 shadow-md bg-white calendar-custom"
                    tileClassName={() => "text-base md:text-lg"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===== Texto y horarios ===== */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-start text-center md:text-left"
          >
            <h2
              className="text-3xl font-serif mb-3"
              style={{ color: PALETTE.main }}
            >
              Selecciona un día y hora para agendar tu cita
            </h2>
            <h3
              className="text-xl font-serif mb-3"
              style={{ color: PALETTE.text }}
            >
              Horas disponibles
            </h3>

            {!fecha ? (
              <p style={{ color: PALETTE.textSoft }}>
                Elige un día para ver los horarios disponibles.
              </p>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {HORAS.map((h) => (
                  <motion.button
                    key={`hora-${h}`}
                    onClick={() => onHoraSelect(h)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 rounded-lg font-medium shadow-md transition-all"
                    style={{
                      cursor: "pointer",
                      background: hora === h ? PALETTE.main : "#FFF7ED",
                      color: hora === h ? "white" : PALETTE.text,
                      border: `1px solid ${PALETTE.border}`,
                      fontSize: "1.05rem",
                    }}
                  >
                    {fmtHoraHumana(h)}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {fecha && hora && (
              <div className="mt-6 text-sm">
                <span style={{ color: PALETTE.textSoft }}>Seleccionado: </span>
                <b style={{ color: PALETTE.text }}>
                  {diaTxt} {fechaTxt} — {fmtHoraHumana(hora)}
                </b>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
