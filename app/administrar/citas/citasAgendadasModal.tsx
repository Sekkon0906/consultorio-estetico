"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cita, updateCitaAPI, formatCurrency } from "./helpers"; // 🔹 ahora todo desde helpers
import { generarFacturaPDF } from "../ingresos/facturaPDF";
import {
  ArrowLeft,
  Calculator,
  FileDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
  const [monto, setMonto] = useState<number>(cita.monto ?? 0);
  const previoPagado = cita.montoPagado ?? 0;
  const [pagoAhora, setPagoAhora] = useState<number>(0);
  const [modoPago, setModoPago] = useState<ModoPago | null>(
    (cita.tipoPagoConsultorio as ModoPago | null) ?? null
  );

  // Cálculos dinámicos
  const pagadoAcumulado = Math.max(previoPagado + pagoAhora, 0);
  const restante = Math.max(monto - pagadoAcumulado, 0);
  const totalDevolver = pagadoAcumulado > monto ? pagadoAcumulado - monto : 0;
  const porcentajePago =
    monto > 0 ? Math.min((pagadoAcumulado / monto) * 100, 100) : 0;

  // Estados de control
  const [concluida, setConcluida] = useState<boolean>(
    cita.estado === "atendida"
  );
  const [esCancelada] = useState<boolean>(cita.estado === "cancelada");
  const [motivoCancelacion] = useState<string>(cita.motivoCancelacion ?? "");
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [autoCierre, setAutoCierre] = useState<boolean>(false);

  // === Acciones ===
  const handleConcluir = async (): Promise<void> => {
    if (cita.estado !== "confirmada") {
      window.alert("Solo puedes concluir citas que ya estén confirmadas.");
      return;
    }

    if (!modoPago) {
      window.alert("Selecciona un método de pago antes de concluir la cita.");
      return;
    }

    const payload: Partial<Cita> = {
      estado: "atendida",
      metodoPago: "Consultorio",
      tipoPagoConsultorio: modoPago,
      monto,
      montoPagado: pagadoAcumulado,
      pagado: pagadoAcumulado >= monto ? 1 : 0,
    };

    try {
      await updateCitaAPI(cita.id, payload);
      setConcluida(true);
      setAutoCierre(true);

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error al concluir cita:", error);
    }
  };

  const getColorBarra = (): string => {
    if (porcentajePago < 50) return "#E57373";
    if (porcentajePago < 100) return "#E6C676";
    return "#78B66D";
  };

  const handleDescargarFactura = (): void => {
    try {
      generarFacturaPDF({
        ...cita,
        monto,
        montoPagado: pagadoAcumulado,
        montoRestante: restante,
      });
    } catch (error) {
      console.error("Error generando factura PDF:", error);
    }
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
            type="button"
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

        <AnimatePresence mode="wait">
          {modoEdicion ? (
            <CitasAgendadasEditor
              key="editor"
              cita={cita}
              onClose={() => {
                setModoEdicion(false);
                onUpdated();
              }}
            />
          ) : (
            <motion.div
              key="detalle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* DATOS PRINCIPALES */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5D8C8] mb-4">
                <p className="text-sm text-[#4E3B2B] mb-1">
                  <strong>Paciente:</strong> {cita.nombres} {cita.apellidos}
                </p>
                <p className="text-sm text-[#4E3B2B] mb-1">
                  <strong>Fecha:</strong> {cita.fecha}
                </p>
                <p className="text-sm text-[#4E3B2B] mb-1">
                  <strong>Hora:</strong> {cita.hora}
                </p>
                <p className="text-sm text-[#4E3B2B] mb-1">
                  <strong>Procedimiento:</strong> {cita.procedimiento}
                </p>
                <p className="text-sm text-[#4E3B2B] mb-1">
                  <strong>Estado actual:</strong>{" "}
                  <span className="capitalize">{cita.estado}</span>
                </p>
                {cita.nota && (
                  <p className="text-sm text-[#4E3B2B] mt-2">
                    <strong>Nota:</strong> {cita.nota}
                  </p>
                )}
                {esCancelada && motivoCancelacion && (
                  <p className="text-sm text-red-700 mt-2">
                    <strong>Motivo cancelación:</strong> {motivoCancelacion}
                  </p>
                )}
              </div>

              {/* PAGOS */}
              {!esCancelada && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5D8C8] mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-[#6E5A49] flex items-center gap-2">
                      <Calculator size={16} /> Detalle de pago
                    </h4>
                    <span className="text-xs text-[#8B6A4B]">
                      {porcentajePago.toFixed(0)}% pagado
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-3 rounded-full bg-[#F1E6DA] overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${porcentajePago}%`,
                        backgroundColor: getColorBarra(),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-[#4E3B2B] mb-4">
                    <div>
                      <p className="font-semibold">Valor total</p>
                      <p>{formatCurrency(monto)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Pagado (acumulado)</p>
                      <p>{formatCurrency(pagadoAcumulado)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Restante</p>
                      <p>{formatCurrency(restante)}</p>
                    </div>
                  </div>

                  {!concluida && (
                    <div className="mt-4 space-y-4">
                      {/* Monto total */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#4E3B2B]">
                            Monto total del procedimiento
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={monto}
                            onChange={(e) =>
                              setMonto(Number(e.target.value) || 0)
                            }
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5D8C8] bg-[#FFFDF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-[#4E3B2B]">
                            Pago en esta visita
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={pagoAhora}
                            onChange={(e) =>
                              setPagoAhora(Number(e.target.value) || 0)
                            }
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5D8C8] bg-[#FFFDF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                          />
                        </div>
                      </div>

                      {/* Modo de pago */}
                      <div>
                        <label className="text-sm font-medium text-[#4E3B2B]">
                          Método de pago:
                        </label>
                        <div className="flex gap-3 mt-2">
                          {(["Efectivo", "Tarjeta"] as ModoPago[]).map((m) => (
                            <motion.button
                              key={m}
                              type="button"
                              whileTap={{ scale: 0.95 }}
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

                      {/* Si hay devolución */}
                      {totalDevolver > 0 && (
                        <p className="text-xs text-[#7E1F1F] mt-1">
                          Debes devolver al paciente:{" "}
                          <strong>{formatCurrency(totalDevolver)}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* BOTONES PRINCIPALES */}
              <div className="flex flex-wrap justify-between gap-3 mt-4">
                <div className="flex gap-3">
                  {!esCancelada && (
                    <button
                      type="button"
                      onClick={() => setModoEdicion(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5D8C8] text-sm text-[#4E3B2B] bg-white hover:bg-[#F1E6DA] transition"
                    >
                      <Calculator size={16} />
                      Editar / Reagendar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDescargarFactura}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#B08968] text-sm text-[#B08968] bg-white hover:bg-[#F6EBE0] transition"
                  >
                    <FileDown size={16} />
                    Descargar factura
                  </button>
                </div>

                {!esCancelada && !concluida && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleConcluir}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#78B66D] to-[#4E8C4A] text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                  >
                    <CheckCircle2 size={18} />
                    Concluir cita
                  </motion.button>
                )}

                {concluida && (
                  <div className="flex items-center gap-2 text-sm text-[#2E7D32]">
                    <CheckCircle2 size={18} />
                    Cita marcada como atendida
                    {autoCierre && (
                      <span className="text-xs text-[#6E5A49] ml-1">
                        (cerrando...)
                      </span>
                    )}
                  </div>
                )}

                {esCancelada && (
                  <div className="flex items-center gap-2 text-sm text-[#C2185B]">
                    <XCircle size={18} />
                    Esta cita está cancelada
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
