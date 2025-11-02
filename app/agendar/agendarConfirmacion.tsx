"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Cita } from "../utils/localDB";
import { CheckCircle2, CalendarCheck2, Home, Clock, CalendarDays, Mail, User } from "lucide-react";

export default function AgendarConfirmacion({
  cita,
  usuario,
}: {
  cita: Cita;
  usuario?: any;
}) {
  const router = useRouter();

  // === Método de pago real ===
  const metodoPago =
    cita.metodoPago === "Online"
      ? cita.tipoPagoOnline
        ? `Pago en línea (${cita.tipoPagoOnline})`
        : "Pago en línea"
      : cita.metodoPago === "Consultorio"
      ? cita.tipoPagoConsultorio
        ? `Pago en consultorio (${cita.tipoPagoConsultorio})`
        : "Pago en consultorio"
      : "Método no especificado";

  // === Formateadores de fecha y hora ===
  const fmtDiaHumano = (fecha: Date) =>
    fecha.toLocaleDateString("es-CO", { weekday: "long" });
  const fmtFechaHumana = (fecha: Date) =>
    fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const fecha = new Date(cita.fecha);
  const hora = cita.hora;

  // === Animación de aparición ===
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.15, duration: 0.6 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative rounded-3xl shadow-2xl bg-gradient-to-br from-[#FBF8F3] via-[#F6EBDD] to-[#E6D2B8] border border-[#E0CDB5] px-10 py-12 text-center overflow-hidden"
    >
      {/* === Fondo decorativo === */}
      <motion.div
        className="absolute inset-0 bg-[url('/confetti.svg')] bg-cover bg-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-[#D4BBA0] via-transparent to-transparent blur-3xl"
      />

      {/* === Encabezado === */}
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.2,
          }}
        >
          <CheckCircle2 size={64} className="text-[#B08968]" />
        </motion.div>

        <h2 className="text-3xl font-serif text-[#3B2615] mt-4">
          ¡Cita agendada correctamente!
        </h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-[3px] bg-gradient-to-r from-[#B08968] via-[#E0C9A6] to-[#B08968] rounded-full mt-3"
        />
      </motion.div>

      {/* === Mensaje informativo === */}
      <motion.p
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        className="text-[#5A4635] mt-6 mb-8 leading-relaxed max-w-2xl mx-auto"
      >
        Hemos enviado la información de tu cita al correo registrado. También
        podrás consultarla en tu perfil, dentro de{" "}
        <b>“Citas agendadas”</b>. Recuerda llegar{" "}
        <b>10 minutos antes</b> de la hora asignada para tu valoración o
        procedimiento.
      </motion.p>

      {/* === Bloque de resumen === */}
      <motion.div
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/60 backdrop-blur-sm border border-[#E9D9C5] rounded-2xl shadow-inner p-6 max-w-xl mx-auto text-left space-y-3"
      >
        <h3 className="text-xl font-serif text-center text-[#4E3B2B] mb-3">
          Resumen de tu cita
        </h3>
        <div className="flex items-center gap-2 text-[#4E3B2B]">
          <User size={18} className="text-[#B08968]" />
          <p>
            <b>Paciente:</b> {usuario?.nombres || cita.nombre || "No indicado"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#4E3B2B]">
          <CalendarDays size={18} className="text-[#B08968]" />
          <p>
            <b>Fecha:</b> {fmtDiaHumano(fecha)}, {fmtFechaHumana(fecha)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#4E3B2B]">
          <Clock size={18} className="text-[#B08968]" />
          <p>
            <b>Hora:</b> {hora}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#4E3B2B]">
          <Mail size={18} className="text-[#B08968]" />
          <p>
            <b>Correo:</b> {cita.correo}
          </p>
        </div>
        <p className="text-[#4E3B2B]">
          <b>Procedimiento:</b> {cita.procedimiento}
        </p>
        <p className="text-[#4E3B2B]">
          <b>Método de pago:</b> {metodoPago}
        </p>
      </motion.div>

      {/* === Nota sobre el pago === */}
      <motion.p
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
        className="text-sm italic mt-6 text-[#7D6756]"
      >
        Si tu pago está pendiente, podrás realizarlo en el consultorio o mediante
        el código QR enviado.
      </motion.p>

      {/* === Botones === */}
      <motion.div
        variants={fadeUp}
        custom={4}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-col md:flex-row items-center justify-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/perfil?tab=citas")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all"
          style={{
            background: "linear-gradient(90deg,#B08968,#D1A97A)",
          }}
        >
          <CalendarCheck2 size={18} />
          Ir a mis citas agendadas
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border transition-all"
          style={{
            color: "#4E3B2B",
            borderColor: "#E0CDB5",
            background: "#FBF7F2",
          }}
        >
          <Home size={18} />
          Volver al inicio
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
