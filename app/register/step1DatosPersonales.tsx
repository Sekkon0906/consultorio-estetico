"use client";

import React, { useMemo, useState } from "react";
import Input from "./input";
import InputPassword from "./inputPassword";
import { PALETTE } from "./palette";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  nextStep: () => void;
  setErr: (err: string | null) => void;
}

export default function Step1DatosPersonales({
  formData,
  setFormData,
  nextStep,
  setErr,
}: Props) {
  const [touched, setTouched] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!formData.nombres || formData.nombres.length < 2)
      e.nombres = "Nombre inválido";
    if (!formData.apellidos || formData.apellidos.length < 2)
      e.apellidos = "Apellido inválido";
    if (!/^\S+@\S+\.\S+$/.test(formData.email || ""))
      e.email = "Correo no válido";
    if (!/^[0-9\s()+-]{7,}$/.test(formData.telefono || ""))
      e.telefono = "Teléfono no válido";
    if (!formData.password || formData.password.length <= 10)
      e.password = "Mínimo 10 caracteres";
    if (formData.password !== formData.confirm)
      e.confirm = "Las contraseñas no coinciden";
    return e;
  }, [formData]);

  const valid = Object.keys(errors).length === 0;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (valid) {
      nextStep();
      setErr(null);
    } else {
      setErr("Corrige los errores antes de continuar.");
    }
  };

  return (
    <form onSubmit={handleNext}>
      <Input
        label="Nombres"
        value={formData.nombres || ""}
        setValue={(v) => setFormData({ ...formData, nombres: v })}
        error={touched && errors.nombres}
        palette={PALETTE}
      />
      <Input
        label="Apellidos"
        value={formData.apellidos || ""}
        setValue={(v) => setFormData({ ...formData, apellidos: v })}
        error={touched && errors.apellidos}
        palette={PALETTE}
      />
      <Input
        label="Correo electrónico"
        type="email"
        value={formData.email || ""}
        setValue={(v) => setFormData({ ...formData, email: v })}
        error={touched && errors.email}
        palette={PALETTE}
      />
      <Input
        label="Teléfono"
        value={formData.telefono || ""}
        setValue={(v) => setFormData({ ...formData, telefono: v })}
        error={touched && errors.telefono}
        palette={PALETTE}
      />
      <InputPassword
        label="Contraseña"
        value={formData.password || ""}
        setValue={(v) => setFormData({ ...formData, password: v })}
        show={showPass}
        setShow={setShowPass}
        error={touched && errors.password}
        palette={PALETTE}
      />
      <InputPassword
        label="Confirmar contraseña"
        value={formData.confirm || ""}
        setValue={(v) => setFormData({ ...formData, confirm: v })}
        show={showConfirm}
        setShow={setShowConfirm}
        error={touched && errors.confirm}
        palette={PALETTE}
      />

      <button
        type="submit"
        className="btn w-100 fw-semibold py-2 mt-2"
        style={{
          backgroundColor: PALETTE.main,
          border: "none",
          color: "white",
          borderRadius: "50px",
        }}
      >
        Siguiente
      </button>
    </form>
  );
}
