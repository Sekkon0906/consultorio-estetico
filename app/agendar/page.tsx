"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  getProcedimientos,
  type User,
  type Procedimiento,
  type Cita,
} from "../utils/localDB";
import AgendarCalendar from "./agendarCalendar";
import AgendarForm from "./agendarForm";
import AgendarPago from "./agendarPago";
import TarjetaCita from "./tarjetaCita";

export const PALETTE = {
  bgGradFrom: "#E9E0D1",
  bgGradTo: "#C9AD8D",
  surface: "#FBF7F2",
  border: "#E5D8C8",
  main: "#7A5534",
  mainHover: "#604028",
  accent: "#B98E63",
  text: "#2A1C12",
  textSoft: "#4B3726",
};

// ======================
// TIPOS DEL FORMULARIO
// ======================
interface AgendarFormData {
  fecha?: string;
  hora?: string;
  nombre: string;
  telefono: string;
  correo: string;
  procedimiento: string;
  nota?: string;
}

// Cita antes de ser guardada (sin campos de pago / id / estado)
type CitaData = Omit<
  Cita,
  | "id"
  | "metodoPago"
  | "tipoPagoConsultorio"
  | "tipoPagoOnline"
  | "estado"
  | "monto"
  | "montoPagado"
  | "montoRestante"
  | "qrCita"
  | "motivoCancelacion"
>;

// ======================
// CONTENIDO DE LA PÁGINA
// ======================
function AgendarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const procParam = searchParams.get("proc") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);

  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);

  // puede ser: borrador de cita (CitaData), cita guardada (Cita) o null
  const [citaConfirmada, setCitaConfirmada] = useState<CitaData | Cita | null>(
    null
  );

  const [metodoPago, setMetodoPago] = useState<"Consultorio" | "Online" | null>(
    null
  );
  const [tipoPagoConsultorio, setTipoPagoConsultorio] = useState<
    "Efectivo" | "Tarjeta" | undefined
  >(undefined);
  const [tipoPagoOnline, setTipoPagoOnline] = useState<
    "PayU" | "PSE" | undefined
  >(undefined);

  const [formData, setFormData] = useState<AgendarFormData>({
    nombre: "",
    telefono: "",
    correo: "",
    procedimiento: procParam || "",
    nota: "",
  });

  // === Cargar usuario actual desde localStorage ===
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("currentUser")
      : null;

    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUsuario(parsed);
        setFormData((d) => ({
          ...d,
          nombre: parsed.nombres || "",
          telefono: parsed.telefono || "",
          correo: parsed.email || "",
        }));
      } catch {
        console.warn("Error leyendo usuario local.");
      }
    }
  }, []);

  // === Cargar lista de procedimientos ===
  useEffect(() => {
    const list = getProcedimientos();
    setProcedimientos(list);
  }, []);

  // === Paso 1 → 2 ===
  const handleAvanzar = () => {
    if (!fecha || !hora) {
      alert("Selecciona un día y una hora antes de continuar.");
      return;
    }
    if (!usuario) {
      alert("Debes iniciar sesión para agendar una cita.");
      router.push("/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fecha: fecha.toISOString(),
      hora: hora,
    }));
    setStep(2);
  };

  // === Paso 2 → 3: armar objeto de cita sin pagos ===
  const handleConfirmarDatos = () => {
    if (!fecha || !usuario) return;

    const nuevaCita: CitaData = {
      userId: usuario.id,
      nombres: formData.nombre,
      apellidos: usuario.apellidos,
      telefono: formData.telefono,
      correo: formData.correo,
      procedimiento: formData.procedimiento,
      nota: formData.nota,
      tipoCita: "valoracion",
      fecha: fecha.toISOString(),
      hora,
      pagado: false,
      creadaPor: "usuario",
      fechaCreacion: new Date().toISOString(),
    };

    setCitaConfirmada(nuevaCita);
    setStep(3);
  };

  return (
    <main
      className="min-h-screen w-full py-10 px-4 md:px-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.bgGradFrom}, ${PALETTE.bgGradTo})`,
      }}
    >
      <div className="mx-auto w-full max-w-7xl grid gap-6 items-start">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >
              <AgendarCalendar
                fecha={fecha}
                hora={hora}
                onFechaSelect={setFecha}
                onHoraSelect={setHora}
                usuario={usuario}
              />

              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAvanzar}
                  className="px-6 py-3 rounded-full text-white font-semibold shadow-md"
                  style={{
                    background: `linear-gradient(90deg, ${PALETTE.main}, ${PALETTE.accent})`,
                  }}
                >
                  Continuar
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <AgendarForm
              formData={formData}
              setFormData={setFormData}
              procedimientos={procedimientos}
              handleConfirmar={handleConfirmarDatos}
              goBack={() => setStep(1)}
              usuario={usuario}
              esPrimeraCita={false}
            />
          )}

          {step === 3 && citaConfirmada && (
            <AgendarPago
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              tipoPagoConsultorio={tipoPagoConsultorio}
              setTipoPagoConsultorio={setTipoPagoConsultorio}
              tipoPagoOnline={tipoPagoOnline}
              setTipoPagoOnline={setTipoPagoOnline}
              citaData={citaConfirmada}
              onConfirmar={(nuevaCita: Cita) => {
                setCitaConfirmada(nuevaCita);
                setStep(4);
              }}
              goBack={() => setStep(2)}
            />
          )}

          {step === 4 && citaConfirmada && (
            <motion.div
              key="confirmacion"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="text-center flex flex-col items-center"
            >
              <TarjetaCita
                cita={citaConfirmada as Cita}
                modo="confirmacion"
                mostrarQR={true}
              />

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/")}
                  className="px-6 py-3 rounded-full font-semibold text-white shadow-md"
                  style={{
                    background: `linear-gradient(90deg, ${PALETTE.main}, ${PALETTE.accent})`,
                  }}
                >
                  Volver al inicio
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/perfil/citas_agendadas")}
                  className="px-6 py-3 rounded-full font-semibold border border-[#B08968] text-[#7A5534] bg-white hover:bg-[#F6EFE7] transition"
                >
                  Ir a mis citas agendadas
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ======================
// WRAPPER CON SUSPENSE
// ======================
export default function AgendarPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando agenda...</div>}>
      <AgendarPageContent />
    </Suspense>
  );
}
