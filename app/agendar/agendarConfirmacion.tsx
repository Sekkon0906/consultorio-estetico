"use client";
import { motion } from "framer-motion";
import TarjetaCita from "./tarjetaCita";
import { Cita } from "../utils/localDB";

export default function AgendarConfirmacion({
  cita,
  usuario,
}: {
  cita: Cita;
  usuario?: any; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl shadow-lg bg-white border border-[#E9DED2] p-8 text-center"
    >
      <h2 className="text-2xl font-serif text-[#4E3B2B] mb-4">
        ¡Cita agendada con éxito!
      </h2>
      <p className="text-[#6C584C] mb-6">
        Te hemos enviado la información de tu cita al correo registrado, de igualmanera tendras 
        disponible la tarjeta de cita en tu usuario en el apartado de citas agendadas. <br />
        Recuerda llegar 10 minutos antes de la hora asignada.
      </p>

      {/* Si quieres usar el usuario, puedes mostrar algo opcionalmente */}
      {usuario && (
        <p className="text-[#6C584C]/80 mb-4 italic">
          A nombre de: <b>{usuario.nombres || "Paciente"}</b>
        </p>
      )}

      <TarjetaCita cita={cita} />
    </motion.div>
  );
}
