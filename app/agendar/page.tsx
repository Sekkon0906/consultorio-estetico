"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  crearCita,
  getProcedimientos,
  getCitasByUser,
  User,
} from "../utils/localDB";

import AgendarCalendar from "./agendarCalendar";
import AgendarForm from "./agendarForm";
import AgendarConfirmacion from "./agendarConfirmacion";

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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [procedimientos, setProcedimientos] = useState<any[]>([]);
  const [citaConfirmada, setCitaConfirmada] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    nombre: "",
    telefono: "",
    correo: "",
    procedimiento: procParam || "",
    nota: "",
    metodoPago: null,
    tipoPagoConsultorio: undefined,
    tipoPagoOnline: undefined,
  });

  // ======== Obtener usuario local ========
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

  // ======== Obtener procedimientos ========
  useEffect(() => {
    const list = getProcedimientos();
    setProcedimientos(list);
  }, []);

  // ======== Determinar si es primera cita ========
  const esPrimeraCita = useMemo(() => {
    if (!usuario) return false;
    const citas = getCitasByUser(usuario.id);
    return citas.length === 0;
  }, [usuario]);

  useEffect(() => {
    if (esPrimeraCita && !procParam) {
      setFormData((f: any) => ({
        ...f,
        procedimiento: "Consulta de valoración (primera visita)",
      }));
    }
  }, [esPrimeraCita, procParam]);

  // ======== Toast de notificaciones ========
  function showToast(message: string, type: "error" | "success" = "error") {
    const existing = document.getElementById("toast-msg");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "toast-msg";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      background:
        type === "error"
          ? `linear-gradient(90deg, #B08968, #9C6644)`
          : `linear-gradient(90deg, #7D9C5A, #9CB678)`,
      color: "#fff",
      padding: "14px 28px",
      borderRadius: "12px",
      fontWeight: "600",
      boxShadow: "0 4px 25px rgba(0,0,0,0.25)",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      fontFamily: "'Poppins', sans-serif",
    });
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(-5px)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // ======== Manejadores ========
  const handleAvanzar = () => {
    if (!fecha || !hora) {
      showToast("Selecciona un día y una hora antes de continuar.");
      return;
    }
    if (!usuario) {
      showToast("Debes iniciar sesión para agendar una cita.");
      router.push("/login");
      return;
    }
    setStep(2);
  };

 const handleConfirmar = () => {
  const { nombre, telefono, correo, procedimiento } = formData;

  // ✅ Solo validamos datos del usuario y el procedimiento
  if (!nombre || !telefono || !correo || !procedimiento) {
    showToast("Completa todos los campos requeridos.");
    return;
  }

  const telRegex = /^[0-9]{7,}$/;
  if (!telRegex.test(telefono)) {
    showToast("Número de teléfono inválido.");
    return;
  }

  const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!mailRegex.test(correo)) {
    showToast("Correo electrónico inválido.");
    return;
  }

  // ✅ Creación de cita sin método de pago (se completará después)
  const cita = crearCita({
    userId: usuario!.id,
    nombres: nombre,
    apellidos: "",
    telefono,
    correo,
    procedimiento,
    nota: formData.nota,
    fecha: fecha!.toISOString(),
    hora,
    metodoPago: null, // Se llenará en paso 3
    tipoPagoConsultorio: null,
    tipoPagoOnline: null,
    tipoCita: esPrimeraCita ? "valoracion" : "implementacion",
    creadaPor: "usuario",
  });

  setCitaConfirmada(cita);
  setStep(3); // Avanza a la confirmación
  showToast("Cita confirmada con éxito", "success");
};


  // ======== Datos para la barra de pasos ========
  const steps = [
    { id: 1, label: "Selecciona fecha y hora" },
    { id: 2, label: "Completa tus datos" },
    { id: 3, label: "Confirmación" },
  ];

  // ======== Render principal ========
  return (
    <main
      className="min-h-screen w-full py-10 px-4 md:px-8"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.bgGradFrom}, ${PALETTE.bgGradTo})`,
      }}
    >
      {/* === Barra de progreso animada === */}
      <div className="max-w-3xl mx-auto mb-12 relative">
        <div className="flex justify-between items-center relative">
          {/* Línea base */}
          <div
            className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 rounded-full"
            style={{ background: "#E5D8C8", zIndex: 0 }}
          />
          {/* Línea de progreso rellena */}
          <motion.div
            className="absolute top-1/2 left-0 h-[4px] -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${PALETTE.main}, ${PALETTE.accent})`,
              zIndex: 1,
            }}
            animate={{
              width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          {/* Círculos */}
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              className="relative flex flex-col items-center z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shadow-md"
                style={{
                  background:
                    s.id <= step ? PALETTE.main : "rgba(200, 190, 170, 0.6)",
                  border:
                    s.id === step
                      ? `2px solid ${PALETTE.accent}`
                      : "2px solid transparent",
                }}
                animate={{ scale: s.id === step ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {s.id}
              </motion.div>
              <p
                className="text-sm mt-2 font-medium text-center"
                style={{
                  color: s.id <= step ? PALETTE.text : PALETTE.textSoft,
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === Contenido principal === */}
      <div className="mx-auto w-full max-w-7xl grid gap-6 items-start">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AgendarCalendar
                fecha={fecha}
                hora={hora}
                onFechaSelect={setFecha}
                onHoraSelect={setHora}
                usuario={usuario}
              />
              <div className="text-center mt-8">
                <button
                  onClick={handleAvanzar}
                  className="px-6 py-3 rounded-lg text-white font-semibold shadow-md"
                  style={{ background: PALETTE.main }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = PALETTE.mainHover)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = PALETTE.main)
                  }
                >
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
  esPrimeraCita={esPrimeraCita}
/>

          )}

          {step === 3 && citaConfirmada && (
            <AgendarConfirmacion cita={citaConfirmada} usuario={usuario} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
