"use client";
import { motion } from "framer-motion";
import { PALETTE } from "./page";

export default function AgendarPago({
  metodoPago,
  setMetodoPago,
  tipoPagoConsultorio,
  setTipoPagoConsultorio,
  tipoPagoOnline,
  setTipoPagoOnline,
  onConfirmar,
}: {
  metodoPago: "Consultorio" | "Online" | null;
  setMetodoPago: (v: "Consultorio" | "Online") => void;
  tipoPagoConsultorio?: "Efectivo" | "Tarjeta";
  setTipoPagoConsultorio: (v: "Efectivo" | "Tarjeta" | undefined) => void;
  tipoPagoOnline?: "PayU" | "PSE";
  setTipoPagoOnline: (v: "PayU" | "PSE" | undefined) => void;
  onConfirmar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl shadow-lg p-8 bg-white border border-[#E9DED2]"
    >
      <h2 className="text-2xl font-serif mb-4 text-[#4E3B2B]">
        Método de pago
      </h2>
      <p className="text-[#6C584C] mb-4">
        Valor de la consulta de valoración: <b>$120.000 COP</b>
      </p>

      <div className="flex flex-col gap-3">
        <label>
          <input
            type="radio"
            name="metodoPago"
            value="Consultorio"
            checked={metodoPago === "Consultorio"}
            onChange={() => setMetodoPago("Consultorio")}
          />{" "}
          Pagar en consultorio
        </label>

        {metodoPago === "Consultorio" && (
          <div className="ml-6 flex gap-6 mt-2">
            <label>
              <input
                type="radio"
                name="tipoConsultorio"
                value="Efectivo"
                checked={tipoPagoConsultorio === "Efectivo"}
                onChange={() => setTipoPagoConsultorio("Efectivo")}
              />{" "}
              Efectivo
            </label>
            <label>
              <input
                type="radio"
                name="tipoConsultorio"
                value="Tarjeta"
                checked={tipoPagoConsultorio === "Tarjeta"}
                onChange={() => setTipoPagoConsultorio("Tarjeta")}
              />{" "}
              Tarjeta
            </label>
          </div>
        )}

        <label>
          <input
            type="radio"
            name="metodoPago"
            value="Online"
            checked={metodoPago === "Online"}
            onChange={() => setMetodoPago("Online")}
          />{" "}
          Pago en línea
        </label>

        {metodoPago === "Online" && (
          <div className="ml-6 mt-2 flex gap-6">
            <label>
              <input
                type="radio"
                name="tipoOnline"
                value="PayU"
                checked={tipoPagoOnline === "PayU"}
                onChange={() => setTipoPagoOnline("PayU")}
              />{" "}
              PayU
            </label>
            <label>
              <input
                type="radio"
                name="tipoOnline"
                value="PSE"
                checked={tipoPagoOnline === "PSE"}
                onChange={() => setTipoPagoOnline("PSE")}
              />{" "}
              PSE
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirmar}
          disabled={!metodoPago}
          className="px-8 py-3 rounded-md font-semibold text-white disabled:opacity-60"
          style={{
            background: PALETTE.main,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {metodoPago === "Consultorio"
            ? "Confirmar cita"
            : "Proceder al pago"}
        </motion.button>
      </div>
    </motion.div>
  );
}
