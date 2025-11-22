"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PALETTE } from "./palette";
import { createUser, type User } from "../utils/localDB";
import type { RegisterFormData } from "./page";

interface Props {
  formData: RegisterFormData;
}

// helper para calcular edad a partir de la fecha
const calcularEdad = (date: Date | null): number => {
  if (!date) return 0;
  const hoy = new Date();
  let edad = hoy.getFullYear() - date.getFullYear();
  const mes = hoy.getMonth() - date.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < date.getDate())) {
    edad--;
  }
  return edad;
};

export default function Step3Exito({ formData }: Props) {
  const router = useRouter();

  // Guardar el usuario en localDB al montar el componente
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const antecedentesTxt = (formData.antecedentes || []).join(", ");
      const alergiasTxt = (formData.alergias || []).join(", ");
      const medicamentosTxt = (formData.medicamentos || []).join(", ");

      const edadNumber =
        formData.fechaNacimiento != null
          ? calcularEdad(formData.fechaNacimiento)
          : Number(formData.edad) || 0;

      // mapear sexo a tipo User["genero"]
      const generoMapped: User["genero"] =
        formData.sexo === "Masculino" || formData.sexo === "Femenino"
          ? formData.sexo
          : "Otro";

      createUser({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telefono: formData.telefono?.trim() || "",
        edad: edadNumber,
        genero: generoMapped,
        antecedentes: antecedentesTxt,
        antecedentesDescripcion:
          formData.antecedentesDescripcion || "",
        alergias: alergiasTxt,
        alergiasDescripcion: formData.alergiasDescripcion || "",
        medicamentos: medicamentosTxt,
        medicamentosDescripcion:
          formData.medicamentosDescripcion || "",
        // photo se genera con avatar por defecto en localDB
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Error creando usuario:", e);
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
