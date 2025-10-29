"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PALETTE } from "./palette";
import { createUser } from "../utils/localDB";

interface Props {
  formData: any;
}

export default function Step3Exito({ formData }: Props) {
  const router = useRouter();

  // Guardar el usuario en localDB al montar
  if (typeof window !== "undefined") {
    try {
      createUser({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telefono: formData.telefono?.trim() || "",
        edad: Number(formData.edad) || 0,
        genero: formData.genero || "Otro",
        antecedentes:
          formData.antecedentes?.map((a: any) => a.value).join(", ") || "",
        antecedentesDescripcion: formData.antecedentesDescripcion || "",
        alergias:
          formData.alergias?.map((a: any) => a.value).join(", ") || "",
        alergiasDescripcion: formData.alergiasDescripcion || "",
        medicamentos:
          formData.medicamentos?.map((a: any) => a.value).join(", ") || "",
        medicamentosDescripcion: formData.medicamentosDescripcion || "",
      });
    } catch (e) {
      console.warn("Error creando usuario:", e);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div
        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4"
        style={{
          width: 100,
          height: 100,
          backgroundColor: "#E1D4C6",
          color: PALETTE.text,
        }}
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke={PALETTE.main}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        </svg>
      </div>

      <h2
        className="fw-bold mb-2"
        style={{ color: PALETTE.text, fontFamily: "'Playfair Display', serif" }}
      >
        Cuenta creada con éxito
      </h2>

      <p style={{ color: PALETTE.muted, maxWidth: 400, margin: "0 auto" }}>
        Puedes iniciar sesión para agendar tus citas o modificar tu información
        médica desde tu perfil.
      </p>

      <div className="mt-4">
        <button
          onClick={() => router.push("/login")}
          className="btn w-100 fw-semibold py-2"
          style={{
            backgroundColor: PALETTE.main,
            border: "none",
            color: "white",
            borderRadius: "50px",
          }}
        >
          Ir al inicio de sesión
        </button>
      </div>
    </motion.div>
  );
}
