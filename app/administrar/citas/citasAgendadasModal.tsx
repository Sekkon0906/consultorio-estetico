"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateCita,
  marcarCitaAtendida,
  confirmarCita,
  cancelarCita,
  Cita,
} from "../../utils/localDB";
import { generarFacturaPDF } from "../ingresos/facturaPDF";
import {
  ArrowLeft,
  Calculator,
  FileDown,
  CheckCircle2,
} from "lucide-react";
import { PALETTE } from "../../agendar/page";
import { formatCurrency } from "./helpers";

interface Props {
  cita: Cita;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CitasAgendadasModal({ cita, onClose, onUpdated }: Props) {
  const [modoPago, setModoPago] = useState<"Efectivo" | "Tarjeta" | null>(
    cita.tipoPagoConsultorio || null
  );
  const [monto, setMonto] = useState<number>(cita.monto || 0);
  const [entregado, setEntregado] = useState<number>(0);
  const [cambio, setCambio] = useState<number>(0);
  const [concluida, setConcluida] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState<null | string>(null);

  // === Calcular cambio ===
  const calcularCambio = (valorEntregado: number) => {
    setEntregado(valorEntregado);
    setCambio(valorEntregado - monto);
  };

  // === Acciones ===
  const handleConcluir = () => {
    marcarCitaAtendida(cita.id);
    updateCita(cita.id, {
      estado: "atendida",
      metodoPago: "Consultorio",
      tipoPagoConsultorio: modoPago,
      monto,
      montoPagado: monto,
      pagado: true,
    });
    setConcluida(true);
    onUpdated();
  };

  const handleConfirmar = () => {
    confirmarCita(cita.id);
    onUpdated();
    setConfirmPrompt(null);
  };

  const handleCancelar = () => {
    cancelarCita(cita.id);
    onUpdated();
    onClose();
    setConfirmPrompt(null);
  };

  const handleReagendar = () => {
    window.location.href = `/administrar/citasAgendadasEditar?id=${cita.id}`;
  };

  // === Configuración de estados ===
  const estados = [
    { label: "Pendiente", value: "pendiente", color: "#E6C676" },
    { label: "Confirmada", value: "confirmada", color: "#6FB2E3" },
    { label: "Atendida", value: "atendida", color: "#78B66D" },
  ];
  const idxEstado = estados.findIndex((e) => e.value === cita.estado);

  // === Progreso de pago ===
  const pagoTotal = monto || cita.monto || 0;
  const pagado = cita.montoPagado || 0;
  const porcentajePago = pagoTotal ? Math.min((pagado / pagoTotal) * 100, 100) : 0;

  // === Barra de progreso de cita ===
  const renderBarraEstado = () => (
    <div className="relative w-full mt-4 mb-8">
      <div className="absolute top-1/2 left-0 w-full h-[3px] bg-[#E5D8C8] rounded-full" />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(idxEstado / (estados.length - 1)) * 100}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-[#C7A27A] to-[#B08968] rounded-full"
      />
      <div className="flex justify-between relative z-10">
        {estados.map((e, i) => (
          <motion.div
            key={e.value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md`}
              style={{
                backgroundColor: i <= idxEstado ? e.color : "#CFC1AE",
              }}
            >
              {i + 1}
            </div>
            <span className="text-xs mt-1 capitalize text-[#6E5A49]">
              {e.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // === Barra de progreso de pago ===
  const renderBarraPago = () => (
    <div className="mt-2 mb-6">
      <p className="text-sm font-medium text-[#4E3B2B] mb-2">
        Estado del pago:
      </p>
      <div className="relative h-4 bg-[#E5D8C8] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentajePago}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`h-full rounded-full ${
            porcentajePago < 100
              ? "bg-gradient-to-r from-[#E6C676] to-[#B08968]"
              : "bg-[#78B66D]"
          }`}
        />
      </div>
      <p
        className={`text-sm mt-1 text-center font-semibold ${
          porcentajePago < 100 ? "text-[#B08968]" : "text-green-700"
        }`}
      >
        {porcentajePago < 100
          ? `Pagado ${formatCurrency(pagado)} / Falta ${formatCurrency(
              pagoTotal - pagado
            )}`
          : "Pago completado ✅"}
      </p>
    </div>
  );

  // === PROMPTS ===
  const mensajes = {
    confirmar: "¿Deseas confirmar esta cita?",
    cancelar: "¿Seguro que deseas cancelar esta cita?",
    reagendar: "¿Deseas reagendar esta cita?",
    concluir: "¿Marcar esta cita como atendida y registrar el pago?",
  };

  const colorAccion = {
    confirmar: "#6FB2E3",
    cancelar: "#E57373",
    reagendar: "#E5D8C8",
    concluir: "#78B66D",
  }[confirmPrompt || "confirmar"];

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
        className="bg-[#FBF7F2] p-6 rounded-2xl shadow-2xl w-[95%] max-w-2xl border border-[#E5D8C8] relative overflow-y-auto max-h-[90vh]"
      >
        {/* === HEADER === */}
        <div className="flex items-center gap-3 mb-3">
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

        {renderBarraEstado()}
        {renderBarraPago()}

        {/* === DETALLES DE LA CITA === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5D8C8]"
        >
          <p className="text-[#4E3B2B] text-sm leading-6">
            <strong>Paciente:</strong> {cita.nombres} {cita.apellidos} <br />
            <strong>Procedimiento:</strong> {cita.procedimiento} <br />
            <strong>Fecha:</strong> {cita.fecha.slice(0, 10)} —{" "}
            <strong>Hora:</strong> {cita.hora} <br />
            <strong>Estado actual:</strong>{" "}
            <span className="capitalize font-medium text-[#8B6A4B]">
              {cita.estado}
            </span>
          </p>
        </motion.div>

        {/* === PAGOS === */}
        <div className="mt-4 space-y-4">
          <label className="text-sm font-medium text-[#4E3B2B]">
            Monto del procedimiento:
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            placeholder="Ej. 250000"
            className="w-full border border-[#DCCBB7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B08968]"
          />

          <label className="text-sm font-medium text-[#4E3B2B]">
            Selecciona método de pago:
          </label>
          <div className="flex gap-3">
            {["Efectivo", "Tarjeta"].map((m) => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModoPago(m as any)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                  modoPago === m
                    ? "bg-[#B08968] text-white border-[#B08968]"
                    : "bg-[#FFFDF9] text-[#4B3726] border-[#E9DED2]"
                } transition-all hover:shadow-md`}
              >
                {m}
              </motion.button>
            ))}
          </div>

          {modoPago === "Efectivo" && (
            <>
              <label className="text-sm font-medium text-[#4E3B2B]">
                Dinero entregado:
              </label>
              <input
                type="number"
                value={entregado}
                onChange={(e) => calcularCambio(Number(e.target.value))}
                placeholder="Ej. 300000"
                className="w-full border border-[#DCCBB7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B08968]"
              />
              <p
                className={`text-center font-semibold ${
                  cambio < 0 ? "text-red-600" : "text-green-700"
                }`}
              >
                {cambio < 0
                  ? `Faltan ${formatCurrency(Math.abs(cambio))}`
                  : `Cambio: ${formatCurrency(cambio)}`}
              </p>
            </>
          )}
        </div>

        {/* === BOTONES === */}
        <div className="text-center mt-8 flex flex-col gap-3">
          {!concluida ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setConfirmPrompt("concluir")}
              disabled={!monto || !modoPago}
              className={`w-full py-3 rounded-full text-white font-semibold shadow-md ${
                !monto || !modoPago
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#B08968] to-[#D1A97A]"
              }`}
            >
              <Calculator size={18} className="inline-block mr-2" />
              Concluir cita
            </motion.button>
          ) : (
            <div className="flex flex-col items-center text-green-700 font-medium">
              <CheckCircle2 size={42} className="mb-2" />
              Cita concluida y pago registrado
            </div>
          )}

          {concluida && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generarFacturaPDF(cita)}
              className="w-full py-3 border border-[#C7A27A] rounded-full bg-white text-[#4E3B2B] font-semibold flex items-center justify-center gap-2 hover:bg-[#F5EDE4]"
            >
              <FileDown size={18} />
              Descargar factura PDF
            </motion.button>
          )}

          {/* === BOTONES DE ACCIÓN === */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <button
              onClick={() => setConfirmPrompt("confirmar")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmPrompt("reagendar")}
              className="px-4 py-2 bg-[#E5D8C8] text-[#4E3B2B] rounded-md hover:bg-[#DCC7AC] transition"
            >
              Reagendar
            </button>
            <button
              onClick={() => setConfirmPrompt("cancelar")}
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition"
            >
              Cancelar
            </button>
          </div>
        </div>

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
                      if (confirmPrompt === "concluir") handleConcluir();
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
