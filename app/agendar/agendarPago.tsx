"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Wallet, Globe, ArrowLeft, AlertTriangle } from "lucide-react";
import { PALETTE } from "./page";
import { crearCita, Cita } from "../utils/localDB";

// Tipos auxiliares
type MetodoPago = "Consultorio" | "Online" | null;
type TipoPagoConsultorio = "Efectivo" | "Tarjeta" | undefined;
type TipoPagoOnline = "PayU" | "PSE" | undefined;

// Props del componente
interface AgendarPagoProps {
  metodoPago: MetodoPago;
  setMetodoPago: (metodo: MetodoPago) => void;

  tipoPagoConsultorio: TipoPagoConsultorio;
  setTipoPagoConsultorio: (tipo: TipoPagoConsultorio) => void;

  tipoPagoOnline: TipoPagoOnline;
  setTipoPagoOnline: (tipo: TipoPagoOnline) => void;

  // datos de la cita antes de guardar (sin id y sin campos de pago)
  citaData: Omit<Cita, "id" | "metodoPago" | "tipoPagoConsultorio" | "tipoPagoOnline" | "estado">;

  // se llama cuando la cita se creó bien
  onConfirmar: (citaCreada: Cita) => void;

  goBack: () => void;
}

export default function AgendarPago({
  metodoPago,
  setMetodoPago,
  tipoPagoConsultorio,
  setTipoPagoConsultorio,
  tipoPagoOnline,
  setTipoPagoOnline,
  citaData,
  onConfirmar,
  goBack,
}: AgendarPagoProps) {
  const [brilloActivo, setBrilloActivo] = useState(false);
  const [error, setError] = useState(false);

  const opciones = [
    {
      tipo: "Consultorio" as const,
      icono: <Wallet size={26} />,
      titulo: "Pagar en consultorio",
      descripcion: "Podrás pagar tu cita en efectivo o tarjeta al asistir.",
    },
    {
      tipo: "Online" as const,
      icono: <Globe size={26} />,
      titulo: "Pago en línea",
      descripcion: "Realiza tu pago seguro vía PayU o PSE antes de asistir.",
    },
  ];

  const pagoValido =
    (metodoPago === "Consultorio" &&
      (tipoPagoConsultorio === "Efectivo" ||
        tipoPagoConsultorio === "Tarjeta")) ||
    (metodoPago === "Online" &&
      (tipoPagoOnline === "PayU" || tipoPagoOnline === "PSE"));

  // === CONFIRMAR ===
  const handleConfirmar = async () => {
    if (!pagoValido) {
      setError(true);
      setTimeout(() => setError(false), 2500);
      return;
    }

    setBrilloActivo(true);
    setTimeout(async () => {
      try {
        const nuevaCita = await crearCita({
          ...citaData,
          metodoPago: metodoPago ?? "Consultorio", // por si viniera null
          tipoPagoConsultorio,
          tipoPagoOnline,
          estado: "pendiente",
        });

        onConfirmar(nuevaCita);

        window.dispatchEvent(
          new CustomEvent("horarioCambiado", {
            detail: { tipo: "nuevaCita", cita: nuevaCita },
          })
        );
      } catch (err) {
        console.error("Error creando cita:", err);
        alert("Error al confirmar la cita. Intenta nuevamente.");
      } finally {
        setBrilloActivo(false);
      }
    }, 1000);
  };

  // ... resto del JSX igual que lo tenías ...
}
