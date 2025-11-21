"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cita,
  // getCitaById,            // ❌ ya no se usa
  formatCurrency,
  confirmarCita,
  marcarCitaAtendida,
} from "../utils/localDB";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Mail,
  User,
  Home,
  Download,
} from "lucide-react";

interface AgendarConfirmacionProps {
  cita: Cita;
  // ❗ Si algún día necesitas usuario, lo añades tipado:
  // usuario?: Usuario;
}

export default function AgendarConfirmacion({ cita }: AgendarConfirmacionProps) {
  const router = useRouter();
  const [qrURL, setQrURL] = useState<string>("");
  const [estado, setEstado] = useState<string>(cita.estado || "pendiente");

  useEffect(() => {
    // movemos generarQR dentro del efecto para evitar warning de dependencia
    const generarQR = async () => {
      const data = `Cita #${cita.id} - ${cita.nombres} ${cita.apellidos}\n${cita.procedimiento}\n${cita.fecha} ${cita.hora}`;
      const url = await QRCode.toDataURL(data);
      setQrURL(url);
    };

    generarQR();
  }, [cita]);

  // === Generar PDF con QR ===
  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("Confirmación de Cita", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Paciente: ${cita.nombres} ${cita.apellidos}`, 20, 35);
    doc.text(`Procedimiento: ${cita.procedimiento}`, 20, 45);
    doc.text(`Fecha: ${cita.fecha}`, 20, 55);
    doc.text(`Hora: ${cita.hora}`, 20, 65);
    doc.text(`Correo: ${cita.correo}`, 20, 75);
    doc.text(`Estado: ${estado}`, 20, 85);
    if (qrURL) doc.addImage(qrURL, "PNG", 140, 30, 50, 50);
    doc.save(`Cita_${cita.id}.pdf`);
  };

  // === Barra de progreso ===
  const pasos = ["pendiente", "confirmada", "atendida"];
  const indice = pasos.indexOf(estado);

  const avanzarEstado = () => {
    if (estado === "pendiente") {
      confirmarCita(cita.id);
      setEstado("confirmada");
    } else if (estado === "confirmada") {
      marcarCitaAtendida(cita.id);
      setEstado("atendida");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl shadow-2xl bg-gradient-to-b from-[#F7EFE6] to-[#E6D2B8] p-10 text-center relative border border-[#E0CDB5]"
    >
      {/* ...todo lo demás igual que lo tenías... */}
    </motion.div>
  );
}
