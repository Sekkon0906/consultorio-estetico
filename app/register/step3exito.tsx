"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PALETTE } from "./palette";
import { createUser, findUserByEmail } from "../utils/localDB";
import type { RegisterFormData } from "./page";

interface Props {
  formData: RegisterFormData;
}

export default function Step3Exito({ formData }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!formData?.email) return;

    try {
      // Evita crear usuario duplicado si recarga la pantalla
      const existe = findUserByEmail(formData.email.trim());
      if (existe) return;

      createUser({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telefono: formData.telefono || "",
        edad: Number(formData.edad) || 0,
        genero: formData.genero || "Otro",
        antecedentes: formData.antecedentes || "",
        antecedentesDescripcion: formData.antecedentesDescripcion || "",
        alergias: formData.alergias || "",
        alergiasDescripcion: formData.alergiasDescripcion || "",
        medicamentos: formData.medicamentos || "",
        medicamentosDescripcion: formData.medicamentosDescripcion || "",
      });
    } catch (e) {
      console.warn("Error creando usuario:", e);
    }
  }, [formData]);

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
        Ya puedes iniciar sesión para agendar tus citas o administrar tu
        información médica desde tu perfil.
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
