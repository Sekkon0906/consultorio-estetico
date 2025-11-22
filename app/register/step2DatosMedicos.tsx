"use client";

import React, {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import Select, { MultiValue, StylesConfig } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PALETTE } from "./palette";
import type { RegisterFormData } from "./page";

// ---- Tipos auxiliares ----
type MedicalOption = { value: string; label: string };

interface Props {
  formData: RegisterFormData;
  setFormData: Dispatch<SetStateAction<RegisterFormData>>;
  prevStep: () => void;
  nextStep: () => void;
  setErr: (e: string | null) => void;
}

// ---- Listas de opciones ----
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

const toOptions = (arr: string[]): MedicalOption[] =>
  arr.map((a) => ({ value: a, label: a }));

export default function Step2DatosMedicos({
  formData,
  setFormData,
  prevStep,
  nextStep,
  setErr,
}: Props) {
  const [touched, setTouched] = useState(false);
  const [fechaError, setFechaError] = useState<string | null>(null);

  // Estado local para la fecha (edad se guarda en formData.edad)
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);

  // Estado local para los multi-selects (en formData se guarda string)
  const [selectedAntecedentes, setSelectedAntecedentes] = useState<
    MedicalOption[]
  >(
    formData.antecedentes
      ? toOptions(formData.antecedentes.split(";").map((s) => s.trim()))
      : []
  );
  const [selectedAlergias, setSelectedAlergias] = useState<MedicalOption[]>(
    formData.alergias
      ? toOptions(formData.alergias.split(";").map((s) => s.trim()))
      : []
  );
  const [selectedMedicamentos, setSelectedMedicamentos] = useState<
    MedicalOption[]
  >(
    formData.medicamentos
      ? toOptions(formData.medicamentos.split(";").map((s) => s.trim()))
      : []
  );

  const antecedentsOptions = toOptions(ANTECEDENTES);
  const alergiasOptions = toOptions(ALERGIAS);
  const medicamentosOptions = toOptions(MEDICAMENTOS);

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );
  const minDate = new Date(
    today.getFullYear() - 80,
    today.getMonth(),
    today.getDate()
  );

  // Si el usuario marca "No tengo..." o "No tomo...", limpiamos las demás selecciones
  const normalizeSelection = (
    sel: MultiValue<MedicalOption>
  ): MedicalOption[] => {
    const values = sel.map((s) => s.value);
    const hasNoOption = values.some(
      (v) => v.includes("No tengo") || v.includes("No tomo")
    );

    if (hasNoOption) {
      const firstNo = values.find((v) => v.includes("No")) ?? "No tengo";
      return [{ value: firstNo, label: firstNo }];
    }

    return sel as MedicalOption[];
  };

  const handleDateChange = (date: Date | null) => {
    setFechaNacimiento(date);

    if (!date) {
      setFechaError("Selecciona tu fecha de nacimiento.");
      setFormData((prev) => ({ ...prev, edad: "" }));
      return;
    }

    const age =
      today.getFullYear() -
      date.getFullYear() -
      (today < new Date(date.getFullYear() + age, date.getMonth(), date.getDate())
        ? 1
        : 0);

    const ageSimple = today.getFullYear() - date.getFullYear();

    if (ageSimple < 16) {
      setFechaError("Debes tener al menos 16 años.");
      setFormData((prev) => ({ ...prev, edad: "" }));
    } else if (ageSimple > 80) {
      setFechaError("La edad máxima permitida es 80 años.");
      setFormData((prev) => ({ ...prev, edad: "" }));
    } else {
      setFechaError(null);
      setFormData((prev) => ({ ...prev, edad: String(ageSimple) }));
    }
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!formData.edad) e.edad = "Selecciona tu fecha de nacimiento.";
    if (!formData.genero) e.genero = "Selecciona tu sexo biológico.";
    if (!selectedAntecedentes.length) e.antecedentes = "Campo obligatorio.";
    if (!selectedAlergias.length) e.alergias = "Campo obligatorio.";
    if (!selectedMedicamentos.length) e.medicamentos = "Campo obligatorio.";
    return e;
  }, [
    formData.edad,
    formData.genero,
    selectedAntecedentes,
    selectedAlergias,
    selectedMedicamentos,
  ]);

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

  // Estilos tipados para react-select
  const selectStyles: StylesConfig<MedicalOption, boolean> = {
    control: (provided) => ({
      ...provided,
      background: PALETTE.surface,
      borderColor: PALETTE.border,
      boxShadow: "none",
      minHeight: "44px",
      borderRadius: 12,
      color: PALETTE.text,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: PALETTE.text,
    }),
    input: (provided) => ({
      ...provided,
      color: PALETTE.text,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: PALETTE.text,
      opacity: 0.6,
    }),
    option: (provided, state) => ({
      ...provided,
      color: PALETTE.text,
      backgroundColor: state.isSelected
        ? "#e6d3c2"
        : state.isFocused
        ? "#f5ebe3"
        : "white",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    multiValue: (provided) => ({
      ...provided,
      background: "#E9DED2",
      borderRadius: 999,
      padding: "4px 8px",
      color: PALETTE.text,
    }),
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ overflow: "visible", color: PALETTE.text }}
    >
      {/* Fecha de nacimiento */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Fecha de nacimiento
        </label>
        <DatePicker
          selected={fechaNacimiento}
          onChange={(date) => handleDateChange(date as Date | null)}
          maxDate={maxDate}
          minDate={minDate}
          placeholderText="Selecciona tu fecha"
          className={`form-control rounded-3 shadow-sm ${
            touched && (errors.edad || fechaError) ? "is-invalid" : ""
          }`}
          dateFormat="dd/MM/yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          popperPlacement="bottom-start"
          calendarClassName="custom-calendar"
        />
        {(touched && errors.edad) || fechaError ? (
          <div className="invalid-feedback d-block">
            {errors.edad || fechaError}
          </div>
        ) : null}
      </div>

      {/* Sexo biológico -> genero en BD */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Sexo biológico
        </label>
        <select
          className={`form-select rounded-3 shadow-sm ${
            touched && errors.genero ? "is-invalid" : ""
          }`}
          value={formData.genero || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              genero: e.target.value as RegisterFormData["genero"],
            }))
          }
          style={{
            borderColor: PALETTE.border,
            backgroundColor: PALETTE.surface,
            color: PALETTE.text,
          }}
        >
          <option value="">Selecciona</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        {touched && errors.genero && (
          <div className="invalid-feedback d-block">{errors.genero}</div>
        )}
      </div>

      {/* Antecedentes */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Antecedentes médicos relevantes
        </label>
        <Select<MedicalOption, true>
          isMulti
          options={antecedentsOptions}
          value={selectedAntecedentes}
          onChange={(v) => {
            const norm = normalizeSelection(v);
            setSelectedAntecedentes(norm);
            setFormData((prev) => ({
              ...prev,
              antecedentes: norm.map((o) => o.value).join("; "),
            }));
          }}
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          placeholder="Selecciona antecedentes..."
        />
        {touched && errors.antecedentes && (
          <div className="invalid-feedback d-block">
            {errors.antecedentes}
          </div>
        )}

        {selectedAntecedentes.length > 0 &&
          !selectedAntecedentes.some((a) =>
            a.value.includes("No tengo")
          ) && (
            <textarea
              className="form-control mt-2 rounded-3 shadow-sm"
              placeholder="Explica tu antecedente médico (opcional)"
              value={formData.antecedentesDescripcion || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  antecedentesDescripcion: e.target.value,
                }))
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                color: PALETTE.text,
                minHeight: "90px",
              }}
            />
          )}
      </div>

      {/* Alergias */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Alergias
        </label>
        <Select<MedicalOption, true>
          isMulti
          options={alergiasOptions}
          value={selectedAlergias}
          onChange={(v) => {
            const norm = normalizeSelection(v);
            setSelectedAlergias(norm);
            setFormData((prev) => ({
              ...prev,
              alergias: norm.map((o) => o.value).join("; "),
            }));
          }}
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          placeholder="Selecciona alergias..."
        />
        {touched && errors.alergias && (
          <div className="invalid-feedback d-block">{errors.alergias}</div>
        )}

        {selectedAlergias.length > 0 &&
          !selectedAlergias.some((a) =>
            a.value.includes("No tengo")
          ) && (
            <textarea
              className="form-control mt-2 rounded-3 shadow-sm"
              placeholder="Explica tu alergia (opcional)"
              value={formData.alergiasDescripcion || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  alergiasDescripcion: e.target.value,
                }))
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                color: PALETTE.text,
                minHeight: "90px",
              }}
            />
          )}
      </div>

      {/* Medicamentos */}
      <div className="mb-3 text-start">
        <label
          className="form-label fw-semibold"
          style={{ color: PALETTE.text }}
        >
          Medicamentos actuales
        </label>
        <Select<MedicalOption, true>
          isMulti
          options={medicamentosOptions}
          value={selectedMedicamentos}
          onChange={(v) => {
            const norm = normalizeSelection(v);
            setSelectedMedicamentos(norm);
            setFormData((prev) => ({
              ...prev,
              medicamentos: norm.map((o) => o.value).join("; "),
            }));
          }}
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          placeholder="Selecciona medicamentos..."
        />
        {touched && errors.medicamentos && (
          <div className="invalid-feedback d-block">
            {errors.medicamentos}
          </div>
        )}

        {selectedMedicamentos.length > 0 &&
          !selectedMedicamentos.some((a) =>
            a.value.includes("No tomo")
          ) && (
            <textarea
              className="form-control mt-2 rounded-3 shadow-sm"
              placeholder="Explica tu medicamento actual (opcional)"
              value={formData.medicamentosDescripcion || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  medicamentosDescripcion: e.target.value,
                }))
              }
              style={{
                borderColor: PALETTE.border,
                backgroundColor: PALETTE.surface,
                color: PALETTE.text,
                minHeight: "90px",
              }}
            />
          )}
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
