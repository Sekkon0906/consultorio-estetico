"use client";

import React, { useState, useMemo } from "react";
import Select, { MultiValue } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AnimatePresence, motion } from "framer-motion";
import { PALETTE } from "./palette";

// Antecedentes médicos relevantes antes de procedimientos estéticos
const ANTECEDENTES = [
  "Hipertensión arterial",
  "Diabetes mellitus",
  "Trastornos de coagulación (trombosis, hemofilia)",
  "Problemas cardiacos (arritmia, insuficiencia, marcapasos)",
  "Cirugías recientes (menos de 6 meses)",
  "Tratamiento oncológico (quimioterapia o radioterapia)",
  "Trastornos hormonales o tiroideos",
  "Enfermedades autoinmunes (lupus, artritis reumatoide)",
  "Trastornos de cicatrización o queloides",
  "Embarazo o lactancia",
  "Uso de medicamentos anticoagulantes o corticoides",
  "Otra condición médica",
  "No tengo antecedentes médicos",
];

// Alergias relevantes antes de procedimientos estéticos
const ALERGIAS = [
  "Lidocaína o anestésicos locales",
  "Penicilina o antibióticos similares",
  "Latex (guantes médicos)",
  "Alcohol o antisépticos",
  "Ácido hialurónico o rellenos dérmicos",
  "Botox (toxina botulínica)",
  "Adhesivos médicos o esparadrapo",
  "Metales (níquel, titanio, etc.)",
  "Colorantes o pigmentos cosméticos",
  "Productos tópicos (cremas, perfumes, etc.)",
  "Otra alergia importante",
  "No tengo alergias",
];

// Medicamentos comunes relevantes para valoración médica
const MEDICAMENTOS = [
  "Anticoagulantes (warfarina, aspirina, etc.)",
  "Antiinflamatorios (ibuprofeno, naproxeno, diclofenaco)",
  "Corticoides (prednisona, dexametasona)",
  "Antibióticos recientes (amoxicilina, azitromicina)",
  "Anticonceptivos orales o hormonales",
  "Antidepresivos o ansiolíticos (fluoxetina, sertralina, alprazolam)",
  "Antihipertensivos (enalapril, losartán, amlodipino)",
  "Hipoglucemiantes (metformina, insulina)",
  "Tratamientos dermatológicos (isotretinoína, tretinoína)",
  "Suplementos o vitaminas (omega 3, colágeno, ginkgo, biotina)",
  "Analgésicos de uso frecuente (paracetamol, tramadol)",
  "Antihistamínicos (loratadina, cetirizina)",
  "Otro medicamento",
  "No tomo ninguno",
];

const toOptions = (arr: string[]) => arr.map((a) => ({ value: a, label: a }));

interface Props {
  formData: any;
  setFormData: (d: any) => void;
  prevStep: () => void;
  nextStep: () => void;
  setErr: (e: string | null) => void;
}

export default function Step2InfoMedica({
  formData,
  setFormData,
  prevStep,
  nextStep,
  setErr,
}: Props) {
  const [touched, setTouched] = useState(false);
  const [fechaError, setFechaError] = useState<string | null>(null);

  const antecedentsOptions = toOptions(ANTECEDENTES);
  const alergiasOptions = toOptions(ALERGIAS);
  const medicamentosOptions = toOptions(MEDICAMENTOS);

  // Rango de edad permitido: entre 16 y 80 años
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());

  const normalizeSelection = (sel: MultiValue<{ value: string; label: string }>) => {
    const values = sel.map((s) => s.value);
    return values.some((v) => v.includes("No tengo") || v.includes("No tomo"))
      ? [{ value: values.find((v) => v.includes("No")) || "No tengo", label: "No tengo" }]
      : sel;
  };

  // Validación de edad manual
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setFechaError("Selecciona una fecha válida.");
      setFormData({ ...formData, fechaNacimiento: null });
      return;
    }

    const ageDifMs = today.getTime() - date.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 16) {
      setFechaError("Debes tener al menos 16 años.");
      setFormData({ ...formData, fechaNacimiento: null });
    } else if (age > 80) {
      setFechaError("La edad máxima permitida es 80 años.");
      setFormData({ ...formData, fechaNacimiento: null });
    } else {
      setFechaError(null);
      setFormData({ ...formData, fechaNacimiento: date });
    }
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!formData.fechaNacimiento) e.fechaNacimiento = "Selecciona tu fecha";
    if (!formData.sexo) e.sexo = "Selecciona tu sexo";
    if (!formData.genero) e.genero = "Selecciona tu género";
    if (!formData.antecedentes?.length) e.antecedentes = "Campo obligatorio";
    if (!formData.alergias?.length) e.alergias = "Campo obligatorio";
    if (!formData.medicamentos?.length) e.medicamentos = "Campo obligatorio";
    return e;
  }, [formData]);

  const valid = Object.keys(errors).length === 0 && !fechaError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (valid) {
      setErr(null);
      nextStep();
    } else {
      setErr("Completa todos los campos requeridos correctamente.");
    }
  };

  const selectStyles = {
    control: (p: any) => ({
      ...p,
      background: PALETTE.surface,
      borderColor: PALETTE.border,
      boxShadow: "none",
      minHeight: "44px",
      borderRadius: 12,
    }),
    multiValue: (p: any) => ({
      ...p,
      background: "#E9DED2",
      borderRadius: 999,
      padding: "4px 8px",
    }),
  };

  const hasNoTengo = (field: string) =>
    formData[field]?.some((a: any) => a.value.includes("No"));

  return (
    <form onSubmit={handleSubmit}>
      {/* Fecha */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Fecha de nacimiento
        </label>
        <DatePicker
          selected={formData.fechaNacimiento || null}
          onChange={(date) => handleDateChange(date)}
          minDate={minDate}
          maxDate={maxDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={100}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecciona tu fecha de nacimiento"
          className={`form-control rounded-3 shadow-sm ${
            touched && (errors.fechaNacimiento || fechaError) ? "is-invalid" : ""
          }`}
        />
        {(touched && (errors.fechaNacimiento || fechaError)) && (
          <div className="invalid-feedback">
            {fechaError || errors.fechaNacimiento}
          </div>
        )}
      </div>

      {/* Sexo */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Sexo biológico
        </label>
        <select
          className={`form-select rounded-3 shadow-sm ${
            touched && errors.sexo ? "is-invalid" : ""
          }`}
          value={formData.sexo || ""}
          onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
          style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
        >
          <option value="">Selecciona</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Intersex">Intersex</option>
          <option value="Prefiero no decirlo">Prefiero no decirlo</option>
        </select>
        {touched && errors.sexo && <div className="invalid-feedback">{errors.sexo}</div>}
      </div>

      {/* Género */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Género
        </label>
        <Select
          options={[
            { value: "Heterosexual", label: "Heterosexual" },
            { value: "Homosexual", label: "Homosexual" },
            { value: "Bisexual", label: "Bisexual" },
            { value: "Pansexual", label: "Pansexual" },
            { value: "Asexual", label: "Asexual" },
            { value: "Otro", label: "Otro / Prefiero no decirlo" },
          ]}
          placeholder="Selecciona o escribe tu género..."
          value={formData.genero ? { value: formData.genero, label: formData.genero } : null}
          onChange={(opt) => setFormData({ ...formData, genero: opt?.value })}
          styles={selectStyles}
        />
        {touched && errors.genero && <div className="invalid-feedback">{errors.genero}</div>}
      </div>

      {/* Antecedentes */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Antecedentes médicos relevantes
        </label>
        <Select
          isMulti
          options={antecedentsOptions}
          value={formData.antecedentes || []}
          onChange={(v) => setFormData({ ...formData, antecedentes: normalizeSelection(v) })}
          styles={selectStyles}
          placeholder="Selecciona antecedentes..."
        />
        {touched && errors.antecedentes && (
          <div className="invalid-feedback">{errors.antecedentes}</div>
        )}
        <AnimatePresence>
          {!hasNoTengo("antecedentes") && formData.antecedentes?.length > 0 && (
            <motion.textarea
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              maxLength={500}
              className="form-control rounded-3 shadow-sm mt-2"
              placeholder="Describe detalles relevantes..."
              value={formData.antecedentesDesc || ""}
              onChange={(e) =>
                setFormData({ ...formData, antecedentesDesc: e.target.value })
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                minHeight: 80,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Alergias */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Alergias
        </label>
        <Select
          isMulti
          options={alergiasOptions}
          value={formData.alergias || []}
          onChange={(v) => setFormData({ ...formData, alergias: normalizeSelection(v) })}
          styles={selectStyles}
          placeholder="Selecciona alergias..."
        />
        {touched && errors.alergias && (
          <div className="invalid-feedback">{errors.alergias}</div>
        )}
        <AnimatePresence>
          {!hasNoTengo("alergias") && formData.alergias?.length > 0 && (
            <motion.textarea
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              maxLength={500}
              className="form-control rounded-3 shadow-sm mt-2"
              placeholder="Describe las reacciones o tratamiento..."
              value={formData.alergiasDesc || ""}
              onChange={(e) =>
                setFormData({ ...formData, alergiasDesc: e.target.value })
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                minHeight: 80,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Medicamentos */}
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          Medicamentos actuales
        </label>
        <Select
          isMulti
          options={medicamentosOptions}
          value={formData.medicamentos || []}
          onChange={(v) => setFormData({ ...formData, medicamentos: normalizeSelection(v) })}
          styles={selectStyles}
          placeholder="Selecciona medicamentos..."
        />
        {touched && errors.medicamentos && (
          <div className="invalid-feedback">{errors.medicamentos}</div>
        )}
        <AnimatePresence>
          {!hasNoTengo("medicamentos") && formData.medicamentos?.length > 0 && (
            <motion.textarea
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              maxLength={500}
              className="form-control rounded-3 shadow-sm mt-2"
              placeholder="Describe dosis o frecuencia..."
              value={formData.medicamentosDesc || ""}
              onChange={(e) =>
                setFormData({ ...formData, medicamentosDesc: e.target.value })
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                minHeight: 80,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Botones */}
      <div className="d-grid gap-2 mt-4">
        <button
          type="submit"
          disabled={!valid}
          className="btn fw-semibold py-2"
          style={{
            backgroundColor: valid ? PALETTE.main : "#c9b7a8",
            border: "none",
            color: "white",
            borderRadius: "50px",
            cursor: valid ? "pointer" : "not-allowed",
            opacity: valid ? 1 : 0.7,
          }}
        >
          Continuar
        </button>
        <button
          type="button"
          className="btn fw-semibold py-2"
          style={{
            backgroundColor: "#D6C1B1",
            border: "none",
            color: PALETTE.text,
            borderRadius: "50px",
          }}
          onClick={prevStep}
        >
          Volver
        </button>
      </div>
    </form>
  );
}
