"use client";

import { motion } from "framer-motion";
import { Cita } from "../utils/localDB";  // Importa correctamente el tipo Cita
import QRCode from "react-qr-code";  // Aquí importa el componente QRCode

interface Props {
  cita: Cita;  // Asegúrate de que 'cita' sea de tipo Cita
  modo?: "confirmacion" | "lista" | "admin";
  mostrarQR?: boolean;
}

export default function TarjetaCita({ cita, modo = "confirmacion", mostrarQR = false }: Props) {
  // Formateadores y otros métodos como antes
  const fmtHoraHumana = (hhmm: string) => {
    if (!hhmm) {
      console.error("Hora no definida o inválida:", hhmm);
      return "Hora no válida";
    }

    const [hStr, mStr] = hhmm.split(":");
    let h = Number(hStr);
    const suf = h >= 12 ? "p.m." : "a.m.";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return `${h}:${mStr} ${suf}`;
  };

  const fmtDiaHumano = (date: Date) => {
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return dias[date.getDay()];
  };

  const fmtFechaHumana = (date: Date) => {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    return `${date.getDate()} de ${meses[date.getMonth()]}`;
  };

  const fmtFechaCreacion = (iso: string) => {
    const d = new Date(iso);
    return `${fmtDiaHumano(d)}, ${fmtFechaHumana(d)} ${fmtHoraHumana(
      `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
    )}`;
  };

  const fechaObj = new Date(cita.fecha);
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

  const metodoPagoTxt =
    cita.metodoPago === "Consultorio"
      ? `Pago en consultorio (${cita.tipoPagoConsultorio || "sin especificar"})`
      : `Pago en línea (${cita.tipoPagoOnline || "sin especificar"})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-2xl border border-[#E9DED2] bg-white shadow-md p-6 relative overflow-hidden"
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: "#B08968" }}>
        {modo === "confirmacion" ? "Cita confirmada ✅" : "Detalles de la cita"}
      </h3>

      <div className="text-[#4E3B2B] leading-relaxed space-y-1">
        <p>
          <b>Número de Cita:</b> #{numeroCita}
        </p>
        <p>
          <b>Paciente:</b> {cita.nombres} {cita.apellidos}
        </p>
        <p>
          <b>Procedimiento:</b> {cita.procedimiento}
        </p>
        <p>
          <b>Fecha:</b> {diaTxt}, {fechaTxt}
        </p>
        <p>
          <b>Hora:</b> {horaTxt}
        </p>
        <p>
          <b>Teléfono:</b> {cita.telefono}
        </p>
        <p>
          <b>Correo:</b> {cita.correo}
        </p>
        <p>
          <b>Método de pago:</b> {metodoPagoTxt}
        </p>
        <p className="text-sm text-[#6C584C]/80 mt-3 italic">
          Cita creada el {fmtFechaCreacion(cita.fechaCreacion)}
        </p>
      </div>

      <hr className="my-4 border-[#E9DED2]" />

      <div className="text-center text-[#6C584C]">
        {!cita.pagado ? (
          <p className="italic text-sm">
            El pago se realizará en el consultorio o mediante el QR generado.
          </p>
        ) : (
          <p className="font-medium text-green-700">Pago confirmado ✅</p>
        )}
      </div>

      {mostrarQR && (
        <div className="mt-6 flex flex-col items-center">
          <p className="mb-2 text-sm">Comprobante de pago pendiente:</p>
          <div className="w-28 h-28 border border-[#E9DED2] bg-[#FAF9F7] flex items-center justify-center rounded-lg text-xs text-[#6C584C]">
            <QRCode
              value={`Pago de valoración de $120000 para ${cita.nombres}`}
              size={200}
            />
          </div>
          <p className="mt-3 text-sm text-[#6C584C]">
            Escanea este código para pagar la valoración
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-6">
        <img
          src="/logos/payu.jpg"
          alt="PayU"
          className="w-16 h-16 cursor-pointer"
        />
        <img
          src="/logos/pse.jpg"
          alt="PSE"
          className="w-16 h-16 cursor-pointer"
        />
      </div>
    </motion.div>
  );
}
