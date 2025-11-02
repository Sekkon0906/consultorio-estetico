"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProcedimientos, User } from "../utils/localDB";
import AgendarCalendar from "./agendarCalendar";
import AgendarForm from "./agendarForm";
import AgendarPago from "./agendarPago";
import TarjetaCita from "./tarjetaCita";

export const PALETTE = {
  bgGradFrom: "#E9E0D1",
  bgGradTo: "#C9AD8D",
  surface: "#FBF7F2",
  border: "#E5D8C8",
  main: "#7A5534",        // Marrón tostado más intenso
  mainHover: "#604028",   // Versión más profunda al hacer hover
  accent: "#B98E63",      // Dorado más cálido
  text: "#2A1C12",        // Café oscuro elegante para textos principales
  textSoft: "#4B3726",    // Marrón medio para etiquetas secundarias
};

export default function AgendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const procParam = searchParams.get("proc") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [procedimientos, setProcedimientos] = useState<any[]>([]);
  const [citaConfirmada, setCitaConfirmada] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState<"Consultorio" | "Online" | null>(
    null
  );
  const [tipoPagoConsultorio, setTipoPagoConsultorio] = useState<
    "Efectivo" | "Tarjeta" | undefined
  >(undefined);
  const [tipoPagoOnline, setTipoPagoOnline] = useState<
    "PayU" | "PSE" | undefined
  >(undefined);
  const [formData, setFormData] = useState<any>({
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
    setStep(2);
  };

  // === Paso 2 → 3 ===
  const handleConfirmar = () => {
    const nuevaCita = {
      userId: usuario?.id,
      nombres: formData.nombre,
      telefono: formData.telefono,
      correo: formData.correo,
      procedimiento: formData.procedimiento,
      tipoCita: "valoracion",
      fecha: fecha!.toISOString(),
      hora,
      metodoPago: metodoPago || "Online",
      tipoPagoConsultorio: tipoPagoConsultorio || null,
      tipoPagoOnline: tipoPagoOnline || null,
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
    { id: 3, label: "Escoger metodo de pago" },
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
<div className="max-w-3xl mx-auto mb-14 relative">
  {/* Línea base */}
  <div
    className="absolute top-[60%] left-0 w-full h-[5px] -translate-y-1/2 rounded-full bg-[#E9DED2]"
  />
  {/* Línea de progreso */}
  <motion.div
    className="absolute top-[60%] left-0 h-[5px] -translate-y-1/2 rounded-full shadow-sm"
    style={{
      background: `linear-gradient(90deg, ${PALETTE.main}, ${PALETTE.accent})`,
    }}
    animate={{
      width:
        step === 1
          ? "25%"
          : step === 2
          ? "50%"
          : step === 3
          ? "75%"
          : "100%",
    }}
    transition={{ duration: 0.9, ease: "easeInOut" }}
  />

  {/* Círculos y etiquetas */}
  <div className="flex justify-between relative z-10 -mt-4">
    {steps.map((s, i) => (
      <motion.div
        key={s.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.15 }}
        className="flex flex-col items-center"
      >
        {/* Círculo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: i * 0.15 + 0.3,
            type: "spring",
            stiffness: 150,
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shadow-md transition-all duration-500 ${
            s.id <= step
              ? "bg-gradient-to-br from-[#B08968] to-[#C7A27A] border-2 border-[#FFF5E6]"
              : "bg-[#E0D6C5] border-2 border-transparent"
          }`}
        >
          {s.id}
        </motion.div>

        {/* Etiqueta */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 + 0.4 }}
          className="text-sm mt-4 font-medium text-center"
          style={{
            color: s.id <= step ? PALETTE.text : PALETTE.textSoft,
          }}
        >
          {s.label}
        </motion.p>
      </motion.div>
    ))}
  </div>
</div>


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
              handleConfirmar={handleConfirmar}
              goBack={() => setStep(1)}
              usuario={usuario}
              esPrimeraCita={false}
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
              onConfirmar={() => setStep(4)}
            />
          )}

          {step === 4 && citaConfirmada && (
            <motion.div
              key="confirmacion"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h3 className="text-2xl font-serif text-[#4E3B2B] mb-6">
                ¡Cita Confirmada!
              </h3>
              <TarjetaCita
                cita={citaConfirmada}
                modo="confirmacion"
                mostrarQR={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
