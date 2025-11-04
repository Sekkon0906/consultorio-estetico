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
  const [modoPago, setModoPago] = useState<"Efectivo" | "Tarjeta" | null>(
    cita.tipoPagoConsultorio || null
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

    // 🔹 Cerrar automáticamente tras 1.5 segundos
    setAutoCierre(true);
    setTimeout(() => {
      onUpdated();
      onClose();
    }, 1500);
  };

  // === Colores de barra ===
  const getColorBarra = () => {
    if (porcentajePago < 50) return "#E57373";
    if (porcentajePago < 100) return "#E6C676";
    return "#78B66D";
  };

  // === RENDER ===
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
        {/* === HEADER === */}
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

        {/* === MODO EDICIÓN === */}
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
            {/* === DETALLES === */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5D8C8]">
              <p className="text-[#4E3B2B] text-sm leading-6">
                <strong>Paciente:</strong> {cita.nombres} {cita.apellidos} <br />
                <strong>Procedimiento:</strong> {cita.procedimiento} <br />
                <strong>Fecha:</strong> {cita.fecha.slice(0, 10)} —{" "}
                <strong>Hora:</strong> {cita.hora} <br />
                <strong>Estado actual:</strong>{" "}
                <span className="capitalize font-medium text-[#8B6A4B]">
                  {esCancelada ? "Cancelada" : cita.estado}
                </span>
              </p>
            </div>

            {/* === CANCELADA === */}
            {esCancelada ? (
              <div className="mt-6 bg-[#FFF4F4] border border-red-300 rounded-xl p-5 text-center">
                <XCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-[#4E3B2B] font-medium">
                  Se canceló por el siguiente motivo:
                </p>
                <p className="italic text-red-600 mt-2">
                  {motivoCancelacion || "Sin motivo especificado"}
                </p>
              </div>
            ) : (
              <>
                {/* === BARRA DE PAGO === */}
                <div className="w-full bg-[#EDE3D7] rounded-full h-3 mb-4 relative">
                  <motion.div
                    animate={{ width: `${porcentajePago}%` }}
                    className="h-3 rounded-full absolute left-0 top-0"
                    style={{ background: getColorBarra() }}
                  />
                  <div className="absolute w-full top-[-1.6rem] text-center text-sm text-[#4E3B2B] font-medium">
                    {restante > 0
                      ? `Faltan ${formatCurrency(restante)} por pagar`
                      : totalDevolver > 0
                      ? `Pago completo — Cambio ${formatCurrency(totalDevolver)}`
                      : "Pago completo ✅"}
                  </div>
                </div>

                {/* === FORMULARIO DE PAGO === */}
                {!concluida && (
                  <div className="mt-4 space-y-4">
                    <label className="text-sm font-medium text-[#4E3B2B]">
                      Total a pagar:
                    </label>
                    <input
                      type="number"
                      value={monto === 0 ? "" : monto}
                      onChange={(e) => setMonto(Number(e.target.value) || 0)}
                      className="w-full border border-[#DCCBB7] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#B08968]"
                    />

                    <label className="text-sm font-medium text-[#4E3B2B]">
                      Pago recibido ahora (abono actual):
                    </label>
                    <input
                      type="number"
                      value={pagoAhora === 0 ? "" : pagoAhora}
                      onChange={(e) => setPagoAhora(Number(e.target.value) || 0)}
                      placeholder="Ej. 100000"
                      className="w-full border border-[#DCCBB7] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#B08968]"
                    />

                    {/* === BLOQUE DE RESUMEN === */}
                    <div className="bg-[#FFFDF9] rounded-xl border border-[#E5D8C8] p-3 text-sm">
                      <p className="text-[#4E3B2B]">
                        <strong>Total del procedimiento:</strong>{" "}
                        {formatCurrency(monto)}
                      </p>
                      <p className="text-[#4E3B2B]">
                        <strong>Total abonado:</strong>{" "}
                        {formatCurrency(pagadoAcumulado)}
                      </p>
                      {totalDevolver > 0 ? (
                        <p className="text-green-700 font-semibold">
                          Total a devolver: {formatCurrency(totalDevolver)}
                        </p>
                      ) : (
                        <p className="text-[#4E3B2B]">
                          Restante por pagar:{" "}
                          <span className="font-semibold">
                            {formatCurrency(restante)}
                          </span>
                        </p>
                      )}
                    </div>

                    <label className="text-sm font-medium text-[#4E3B2B]">
                      Método de pago:
                    </label>
                    <div className="flex gap-3">
                      {["Efectivo", "Tarjeta"].map((m) => (
                        <motion.button
                          key={m}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModoPago(m as any)}
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

                {/* === BOTÓN CONCLUIR === */}
                {!concluida && (
                  <div className="text-center mt-8 flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConcluir}
                      disabled={!monto || !modoPago || cita.estado !== "confirmada"}
                      className={`w-full py-3 rounded-full text-white font-semibold shadow-md ${
                        cita.estado !== "confirmada"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#B08968] to-[#D1A97A]"
                      }`}
                    >
                      <Calculator size={18} className="inline-block mr-2" />
                      Concluir cita
                    </motion.button>

                    {cita.estado !== "confirmada" && (
                      <p className="text-xs text-red-600 text-center font-medium">
                        Solo puedes concluir citas confirmadas.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* === CONCLUIDA === */}
        <AnimatePresence>
          {concluida && (
            <motion.div
              key="concluida"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center mt-8 space-y-4"
            >
              <CheckCircle2 size={48} className="text-[#78B66D]" />
              <p className="text-[#4E3B2B] font-medium text-center">
                Cita concluida y registrada correctamente en ingresos.
              </p>
              {!autoCierre && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generarFacturaPDF(cita)}
                  className="px-6 py-3 border border-[#C7A27A] rounded-full bg-white text-[#4E3B2B] font-semibold flex items-center justify-center gap-2 hover:bg-[#F5EDE4] transition"
                >
                  <FileDown size={18} />
                  Descargar factura PDF
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
