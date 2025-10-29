"use client";

import { motion } from "framer-motion";
import { Cita } from "../utils/localDB";
import { useMemo } from "react";
import { PALETTE } from "../agendar/page";

interface Props {
  cita: Cita;
  modo?: "confirmacion" | "lista" | "admin";
}

export default function TarjetaCita({ cita, modo = "confirmacion" }: Props) {
  // ----------- Formateadores ----------
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
    return `${date.getDate()} de ${meses[date.getMonth()]}`;
  };

  const fmtFechaCreacion = (iso: string) => {
    const d = new Date(iso);
    return `${fmtDiaHumano(d)}, ${fmtFechaHumana(d)} ${fmtHoraHumana(
      `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
    )}`;
  };

  // ----------- Datos derivados ----------
  const fechaObj = useMemo(() => new Date(cita.fecha), [cita.fecha]);
  const diaTxt = fmtDiaHumano(fechaObj);
  const fechaTxt = fmtFechaHumana(fechaObj);
  const horaTxt = fmtHoraHumana(cita.hora);
  const numeroCita = String(cita.id).padStart(5, "0");

  const tipoCitaTxt =
    cita.tipoCita === "valoracion"
      ? "Consulta de Valoración (primera cita)"
      : "Procedimiento / Implementación";

  const colorEstado = cita.pagado ? "#C5E1A5" : "#F5E1C0";
  const textoEstado = cita.pagado ? "PAGADA" : "PENDIENTE";

  // ----------- Texto de método de pago ----------
  const metodoPagoTxt =
    cita.metodoPago === "Consultorio"
      ? `Pago en consultorio (${
          cita.tipoPagoConsultorio
            ? cita.tipoPagoConsultorio
            : "sin especificar"
        })`
      : `Pago en línea (${
          cita.tipoPagoOnline ? cita.tipoPagoOnline : "sin especificar"
        })`;

  // ----------- Render ----------
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-2xl border border-[#E9DED2] bg-white shadow-md p-6 relative overflow-hidden"
    >
      {/* === Etiqueta de estado === */}
      {modo !== "confirmacion" && (
        <div
          className="absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold shadow-sm"
          style={{
            backgroundColor: colorEstado,
            color: cita.pagado ? "#2E7D32" : "#6C584C",
          }}
        >
          {textoEstado}
        </div>
      )}

      {/* === Encabezado === */}
      {modo === "confirmacion" && (
        <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.main }}>
          Detalles de tu cita
        </h3>
      )}

      {/* === Cuerpo === */}
      <div className="text-[#4E3B2B] leading-relaxed space-y-1">
        <p>
          <b>Número de Cita:</b> #{numeroCita}
        </p>
        {cita.nombres && (
          <p>
            <b>Paciente:</b> {cita.nombres} {cita.apellidos}
          </p>
        )}
        <p>
          <b>Tipo de cita:</b> {tipoCitaTxt}
        </p>
        <p>
          <b>Procedimiento:</b> {cita.procedimiento}
        </p>
        <p>
          <b>Fecha:</b> {diaTxt} {fechaTxt}
        </p>
        <p>
          <b>Hora:</b> {horaTxt}
        </p>
        {cita.telefono && (
          <p>
            <b>Teléfono:</b> {cita.telefono}
          </p>
        )}
        {cita.correo && (
          <p>
            <b>Correo:</b> {cita.correo}
          </p>
        )}
        {cita.nota && (
          <p>
            <b>Nota adicional:</b> {cita.nota}
          </p>
        )}

        <p>
          <b>Método de pago:</b> {metodoPagoTxt}
        </p>

        {modo === "confirmacion" && (
          <p className="text-sm text-[#6C584C]/80 mt-3 italic">
            Cita creada el {fmtFechaCreacion(cita.fechaCreacion)}
          </p>
        )}
      </div>

      <hr className="my-4 border-[#E9DED2]" />

      {/* === Acciones según estado === */}
      {!cita.pagado ? (
        <div className="text-center text-[#6C584C]">
          {cita.metodoPago === "Online" ? (
            <>
              <p className="mb-3 text-sm">
                Completa tu pago de valoración en línea:
              </p>
              <div className="flex gap-3 justify-center">
                <button className="bg-green-700 text-white px-5 py-2 rounded-full hover:bg-green-800 transition">
                  PayU
                </button>
                <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                  PSE
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm italic">
              El pago se realizará directamente en el consultorio.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-[#4E3B2B]">
          <p className="mb-2 font-medium">Pago confirmado ✅</p>
          <div className="mx-auto w-28 h-28 bg-[#FAF9F7] border border-[#E9DED2] flex items-center justify-center rounded-lg text-sm text-[#6C584C]">
            [QR Comprobante]
          </div>
        </div>
      )}

      {/* === Modo lista === */}
      {modo === "lista" && (
        <div className="mt-4 flex justify-between items-center text-sm text-[#6C584C]/70 italic">
          <span>
            {cita.pagado
              ? "Pago confirmado"
              : "Pendiente de pago en consultorio"}
          </span>
          <span className="text-[#B08968] font-semibold">
            {cita.creadaPor === "doctora" ? "📋 Doctora" : "👤 Usuario"}
          </span>
        </div>
      )}

      {/* === Modo administrador === */}
      {modo === "admin" && (
        <div className="mt-5 border-t border-[#E9DED2] pt-3 flex justify-between items-center text-sm text-[#4E3B2B]">
          <button className="bg-[#B08968] text-white px-4 py-2 rounded-full hover:bg-[#9A7458] transition">
            Ver factura
          </button>
          {!cita.pagado && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition">
              Marcar como pagada
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
