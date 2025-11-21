"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  getProcedimientos,
  User,
  Procedimiento,
  Cita,
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

// 👇 Datos del formulario (mismo shape que usamos en AgendarForm)
interface AgendarFormData {
  fecha?: string;
  hora?: string;
  nombre: string;
  telefono: string;
  correo: string;
  procedimiento: string;
  nota?: string;
}

// 👇 Datos de cita antes de guardar (sin id ni campos de pago/estado)
type CitaData = Omit<
  Cita,
  "id" | "metodoPago" | "tipoPagoConsultorio" | "tipoPagoOnline" | "estado"
>;

export default function AgendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const procParam = searchParams.get("proc") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);

  // ❌ antes: useState<any[]>([])
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);

  // ❌ antes: useState<any>(null)
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

  // ❌ antes: useState<any>({...})
  const [formData, setFormData] = useState<AgendarFormData>({
    nombre: "",
    telefono: "",
    correo: "",
    procedimiento: procParam || "",
    nota: "",
  });

  // === Cargar usuario ===
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
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

  // === Cargar procedimientos ===
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

  // === Paso 2 → 3 ===
  const handleConfirmarDatos = () => {
    if (!fecha) return;

    const nuevaCita: CitaData = {
      userId: usuario?.id ?? null,
      nombres: formData.nombre,
      telefono: formData.telefono,
      correo: formData.correo,
      procedimiento: formData.procedimiento,
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

  const steps = [
    { id: 1, label: "Selecciona fecha y hora" },
    { id: 2, label: "Completa tus datos" },
    { id: 3, label: "Escoger método de pago" },
    { id: 4, label: "Tarjeta de cita" },
  ];

  return (
    <main
      className="min-h-screen w-full py-10 px-4 md:px-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.bgGradFrom}, ${PALETTE.bgGradTo})`,
      }}
    >
      {/* === BARRA DE PROGRESO ANIMADA === */}
      {/* ... todo igual ... */}

      {/* === CONTENIDO SEGÚN PASO === */}
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

              {/* BOTONES FINALES */}
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
