"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProcedimientos, getCitasByUser, User } from "../utils/localDB";
import AgendarCalendar from "./agendarCalendar";
import AgendarForm from "./agendarForm";
import AgendarPago from "./agendarPago";
import TarjetaCita from "./tarjetaCita"; // Asegúrate de que la importación sea correcta

// 🎨 Paleta visual
export const PALETTE = {
  bgGradFrom: "#E9E0D1",
  bgGradTo: "#C9AD8D",
  surface: "#FBF7F2",
  border: "#E5D8C8",
  main: "#8B6A4B",
  mainHover: "#75573F",
  accent: "#C7A27A",
  text: "#32261C",
  textSoft: "#6E5A49",
};

export default function AgendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const procParam = searchParams.get("proc") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Paso inicial
  const [fecha, setFecha] = useState<Date | null>(null); 
  const [hora, setHora] = useState(""); // Hora seleccionada
  const [usuario, setUsuario] = useState<User | null>(null);
  const [procedimientos, setProcedimientos] = useState<any[]>([]); 
  const [citaConfirmada, setCitaConfirmada] = useState<any>(null); 
  const [metodoPago, setMetodoPago] = useState<"Consultorio" | "Online" | null>(null);
  const [tipoPagoConsultorio, setTipoPagoConsultorio] = useState<"Efectivo" | "Tarjeta" | undefined>(undefined);
  const [tipoPagoOnline, setTipoPagoOnline] = useState<"PayU" | "PSE" | undefined>(undefined);
  const [formData, setFormData] = useState<any>({
    nombre: "",
    telefono: "",
    correo: "",
    procedimiento: procParam || "",
    nota: "",
  });

  // Cargar usuario de localStorage
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUsuario(parsed);
        setFormData((d: any) => ({
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

  // Cargar lista de procedimientos
  useEffect(() => {
    const list = getProcedimientos();
    setProcedimientos(list);
  }, []);

  // Validar paso 1 (fecha y hora)
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
    setStep(2); // Paso 2
  };

  // Confirmar datos en paso 2 y proceder a paso 3
  const handleConfirmar = () => {
    // Crear cita confirmada
    const nuevaCita = {
      userId: usuario?.id,
      nombres: formData.nombre,
      apellidos: formData.apellidos || "",
      telefono: formData.telefono,
      correo: formData.correo,
      procedimiento: formData.procedimiento,
      tipoCita: "valoracion", // Si es la primera cita
      fecha: fecha!.toISOString(),
      hora: hora,
      metodoPago: metodoPago || "Online",
      tipoPagoConsultorio: tipoPagoConsultorio || null,
      tipoPagoOnline: tipoPagoOnline || null,
      pagado: false,
      creadaPor: "usuario",
      fechaCreacion: new Date().toISOString(),
    };

    setCitaConfirmada(nuevaCita); // Guardamos la cita confirmada
    setStep(3); // Paso 3 (pago)
  };

  const steps = [
    { id: 1, label: "Selecciona fecha y hora" },
    { id: 2, label: "Completa tus datos" },
    { id: 3, label: "Pago valoración" },
    { id: 4, label: "Confirmación" },
  ];

  return (
    <main
      className="min-h-screen w-full py-10 px-4 md:px-8"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.bgGradFrom}, ${PALETTE.bgGradTo})`,
      }}
    >
      {/* Barra de progreso */}
      <div className="max-w-3xl mx-auto mb-12 relative">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 rounded-full" style={{ background: "#E5D8C8", zIndex: 0 }} />
          <motion.div
            className="absolute top-1/2 left-0 h-[4px] -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${PALETTE.main}, ${PALETTE.accent})`,
              zIndex: 1,
            }}
            animate={{
              width: step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%",
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          {steps.map((s) => (
            <motion.div key={s.id} className="relative flex flex-col items-center z-10">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shadow-md"
                style={{
                  background: s.id <= step ? PALETTE.main : "rgba(200,190,170,0.6)",
                  border: s.id === step ? `2px solid ${PALETTE.accent}` : "2px solid transparent",
                }}
              >
                {s.id}
              </motion.div>
              <p
                className="text-sm mt-2 font-medium text-center"
                style={{ color: s.id <= step ? PALETTE.text : PALETTE.textSoft }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl grid gap-6 items-start">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="calendar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <AgendarCalendar fecha={fecha} hora={hora} onFechaSelect={setFecha} onHoraSelect={setHora} usuario={usuario} />
              <div className="text-center mt-8">
                <button onClick={handleAvanzar} className="px-6 py-3 rounded-lg text-white font-semibold shadow-md" style={{ background: PALETTE.main }}>
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <AgendarForm
              formData={formData}
              setFormData={setFormData}
              procedimientos={procedimientos}
              handleConfirmar={handleConfirmar}
              goBack={() => setStep(1)}
              usuario={usuario}
              esPrimeraCita={false} // Aquí ya se debería manejar si es primera cita o no
            />
          )}

          {step === 3 && (
            <AgendarPago
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              tipoPagoConsultorio={tipoPagoConsultorio}
              setTipoPagoConsultorio={setTipoPagoConsultorio}
              tipoPagoOnline={tipoPagoOnline}
              setTipoPagoOnline={setTipoPagoOnline}
              onConfirmar={() => setStep(4)} // Paso 4
            />
          )}

          {/* Paso 4: Confirmación de cita */}
      {step === 4 && citaConfirmada && (
        <div className="confirmation">
          <h3>Cita Confirmada</h3>
          <TarjetaCita cita={citaConfirmada} modo="confirmacion" mostrarQR={true} />
        </div>
      )}
        </AnimatePresence>
      </div>
    </main>
  );
}
