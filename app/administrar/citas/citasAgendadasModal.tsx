"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateCita,
  marcarCitaAtendida,
  registrarIngreso,
  Cita,
} from "../../utils/localDB";
import { generarFacturaPDF } from "../ingresos/facturaPDF";
import {
  ArrowLeft,
  Calculator,
  FileDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "./helpers";
import CitasAgendadasEditor from "./citasAgendadasEditor";

// ✅ Tipo para el modo de pago (coincide con el estado)
type ModoPago = "Efectivo" | "Tarjeta";

interface Props {
  cita: Cita;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CitasAgendadasModal({
  cita,
  onClose,
  onUpdated,
}: Props) {
  // === Estado de pago ===
  const [monto, setMonto] = useState<number>(cita.monto || 0);
  const previoPagado = cita.montoPagado || 0;
  const [pagoAhora, setPagoAhora] = useState<number>(0);
  const [modoPago, setModoPago] = useState<ModoPago | null>(
    (cita.tipoPagoConsultorio as ModoPago | null) || null
  );

  // Cálculos dinámicos
  const pagadoAcumulado = Math.max(previoPagado + pagoAhora, 0);
  const restante = Math.max(monto - pagadoAcumulado, 0);
  const totalDevolver = pagadoAcumulado > monto ? pagadoAcumulado - monto : 0;
  const porcentajePago =
    monto > 0 ? Math.min((pagadoAcumulado / monto) * 100, 100) : 0;

  // Estados
  const [concluida, setConcluida] = useState(cita.estado === "atendida");
  const [esCancelada] = useState(cita.estado === "cancelada");
  const [motivoCancelacion] = useState<string>(cita.motivoCancelacion || "");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [autoCierre, setAutoCierre] = useState(false);

  // === Acciones ===
  const handleConcluir = () => {
    if (cita.estado !== "confirmada") {
      alert("Solo puedes concluir citas que ya estén confirmadas.");
      return;
    }

    const citaFinal = {
      ...cita,
      estado: "atendida" as const,
      metodoPago: "Consultorio" as const,
      tipoPagoConsultorio: modoPago,
      monto,
      montoPagado: pagadoAcumulado,
      pagado: pagadoAcumulado >= monto,
    };

    marcarCitaAtendida(cita.id);
    updateCita(cita.id, citaFinal);
    registrarIngreso(citaFinal);
    setConcluida(true);

    setAutoCierre(true);
    setTimeout(() => {
      onUpdated();
      onClose();
    }, 1500);
  };

  const getColorBarra = () => {
    if (porcentajePago < 50) return "#E57373";
    if (porcentajePago < 100) return "#E6C676";
    return "#78B66D";
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-[#FBF7F2] p-6 rounded-2xl shadow-2xl w-[95%] max-w-2xl border border-[#E5D8C8] overflow-y-auto max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() =>
              modoEdicion ? setModoEdicion(false) : onClose()
            }
            className="p-2 rounded-full hover:bg-[#F1E6DA] transition"
          >
            <ArrowLeft size={20} className="text-[#6E5A49]" />
          </button>
          <h3 className="text-xl font-semibold text-[#8B6A4B] tracking-wide">
            {modoEdicion
              ? `Reagendar cita #${cita.id}`
              : `Detalle de cita #${cita.id}`}
          </h3>
        </div>

        {modoEdicion ? (
          <CitasAgendadasEditor
            cita={cita}
            onClose={() => {
              setModoEdicion(false);
              onUpdated();
            }}
          />
        ) : (
          <>
            {/* ... todo tu código igual ... */}

            {!concluida && (
              <div className="mt-4 space-y-4">
                {/* inputs de monto, pagoAhora, etc. */}

                <label className="text-sm font-medium text-[#4E3B2B]">
                  Método de pago:
                </label>
                <div className="flex gap-3">
                  {(["Efectivo", "Tarjeta"] as ModoPago[]).map((m) => (
                    <motion.button
                      key={m}
                      whileTap={{ scale: 0.95 }}
                      // ✅ aquí quitamos el any
                      onClick={() => setModoPago(m)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        modoPago === m
                          ? "bg-[#B08968] text-white border-[#B08968]"
                          : "bg-[#FFFDF9] text-[#4B3726] border-[#E9DED2] hover:shadow-md"
                      }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* resto del componente sin cambios */}
          </>
        )}

        {/* sección de concluida, etc, igual que antes */}
      </motion.div>
    </motion.div>
  );
}
