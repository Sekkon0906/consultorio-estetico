"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { MultiValue, Options } from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser as registerUserAuth } from "../utils/auth";

/**
 * RegisterPage.tsx (MONOLÍTICO)
 *
 * - Paso 1: datos personales (nombre, apellido, email, teléfono, contraseña)
 * - Paso 2: información médica (fecha, sexo, género, antecedentes, alergias, medicamentos)
 * - Paso 3: pantalla de éxito (slide horizontal)
 *
 * Reglas específicas implementadas:
 * - Antecedentes / Alergias / Medicamentos: multiselección (react-select).
 *   - Incluyen una opción "No tengo" que, si se selecciona, es la única selección válida.
 *   - Si "No tengo" está seleccionado, el textarea de descripción se desactiva y se guarda vacío.
 * - Todos los campos médicos son obligatorios (deben tener selección, o "No tengo").
 * - Validaciones estrictas en Paso 1 (email, teléfono, contraseña >= 8).
 * - Se calcula `edad` desde `fechaNacimiento` y se pasa como número a registerUser.
 * - Al finalizar, se llama a registerUserAuth(...) con todos los campos médicos y personales.
 *
 * Estilos: se usan los mismos colores/paleta que tenías integrados: beige/marrón.
 */

/* ----------------------------- Paleta ----------------------------- */
const PALETTE = {
  main: "#B08968",
  text: "#4E3B2B",
  muted: "#6C584C",
  surface: "#FFFDF9",
  border: "#E9DED2",
};

/* ------------------------ Opciones predefinidas ------------------- */
/* Listas iniciales (al menos 10 cada una). Puedes editarlas fácilmente aquí */
const ANTECEDENTES_OPTIONS = [
  "Hipertensión",
  "Diabetes",
  "Cardiopatía",
  "Epilepsia",
  "Trastornos hormonales",
  "Enfermedades autoinmunes",
  "Problemas de coagulación",
  "Asma",
  "Cirugías previas",
  "Cáncer",
  "Otra condición",
  "No tengo",
];

const ALERGIAS_OPTIONS = [
  "Penicilina",
  "Ibuprofeno",
  "Anestesia",
  "Polvo",
  "Polen",
  "Mariscos",
  "Frutos secos",
  "Lácteos",
  "Picaduras de insectos",
  "Látex",
  "Otra alergia",
  "No tengo",
];

const MEDICAMENTOS_OPTIONS = [
  "Ibuprofeno",
  "Paracetamol",
  "Metformina",
  "Insulina",
  "Antihipertensivos",
  "Antidepresivos",
  "Anticonceptivos",
  "Inhaladores",
  "Anticoagulantes",
  "Antibióticos (último mes)",
  "Otro medicamento",
  "No tengo",
];

const GENDER_OPTIONS = [
  "Heterosexual",
  "Homosexual",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Demisexual",
  "Queer",
  "Intersexual",
  "Transexual",
  "No binario",
  "Otro / Prefiero no decirlo",
];

/* ----------------------------- Helpers --------------------------- */

/** Convierte una lista de strings en opciones para react-select */
function toSelectOptions(arr: string[]) {
  return arr.map((s) => ({ value: s, label: s }));
}

/** Calcula edad en años desde una fecha */
function calculateAge(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

/** Mapear género extendido (multi opciones) a "Masculino"|"Femenino"|"Otro" para fakeDB */
function mapGenderToSimple(selected: string): "Masculino" | "Femenino" | "Otro" {
  const s = selected.toLowerCase();
  if (s.includes("masculino") || s.includes("hombre")) return "Masculino";
  if (s.includes("femenino") || s.includes("mujer")) return "Femenino";
  return "Otro";
}

/* --------------------------- Main Component ---------------------- */

export default function RegisterPage() {
  const router = useRouter();

  /* ---------- Step control ---------- */
  const [step, setStep] = useState<number>(1);

  /* ---------- Paso 1: datos personales ---------- */
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------- Paso 2: datos médicos ---------- */
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [sexo, setSexo] = useState(""); // "masculino" | "femenino" etc.
  const [genero, setGenero] = useState("");

  // react-select multiselect values
  const [antecedentes, setAntecedentes] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [alergias, setAlergias] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [medicamentos, setMedicamentos] = useState<MultiValue<{ value: string; label: string }>>([]);

  // descripciones (textareas) para cada sección (máx 1000 chars)
  const [antecedentesDesc, setAntecedentesDesc] = useState("");
  const [alergiasDesc, setAlergiasDesc] = useState("");
  const [medicamentosDesc, setMedicamentosDesc] = useState("");

  /* ---------- UI / validation states ---------- */
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* ---------- Select options (react-select) ---------- */
  const antecedentsOptions = toSelectOptions(ANTECEDENTES_OPTIONS);
  const allergiesOptions = toSelectOptions(ALERGIAS_OPTIONS);
  const medsOptions = toSelectOptions(MEDICAMENTOS_OPTIONS);
  const genderSelectOptions = toSelectOptions(GENDER_OPTIONS);

  /* ---------- Validaciones Paso 1 (más estrictas) ---------- */
  const errorsStep1 = useMemo(() => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/.test(nombre.trim())) e.nombre = "Nombre inválido";
    if (!apellido.trim()) e.apellido = "Ingresa tu apellido";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/.test(apellido.trim())) e.apellido = "Apellido inválido";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Correo no válido";
    if (!/^[0-9\s()+-]{7,}$/.test(telefono)) e.telefono = "Teléfono no válido";
    if (password.length < 8) e.password = "Mínimo 8 caracteres";
    if (password !== confirm) e.confirm = "Las contraseñas no coinciden";
    return e;
  }, [nombre, apellido, email, telefono, password, confirm]);

  const isStep1Valid = Object.keys(errorsStep1).length === 0;

  /* ---------- Validaciones Paso 2 (obligatorios) ---------- */
  const errorsStep2 = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fechaNacimiento) e.fechaNacimiento = "Selecciona tu fecha de nacimiento";
    if (!sexo) e.sexo = "Selecciona tu sexo biológico";
    if (!genero) e.genero = "Selecciona tu género";

    // Para multiselect obligatorio: al menos una selección, o "No tengo"
    const checkMulti = (sel: MultiValue<{ value: string }>, name: string) => {
      if (!sel || sel.length === 0) {
        e[name] = "Campo obligatorio";
        return;
      }
      const values = sel.map((s) => s.value);
      if (values.includes("No tengo")) {
        // OK
        return;
      }
      // si hay elementos distintos a "No tengo", ok; (si no, error)
      if (values.length === 0) e[name] = "Campo obligatorio";
    };

    checkMulti(antecedentes, "antecedentes");
    checkMulti(alergias, "alergias");
    checkMulti(medicamentos, "medicamentos");

    return e;
  }, [fechaNacimiento, sexo, genero, antecedentes, alergias, medicamentos]);

  const isStep2Valid = Object.keys(errorsStep2).length === 0;

  /* ---------------------- React-Select custom styles ---------------------- */
  const reactSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      background: PALETTE.surface,
      borderColor: PALETTE.border,
      boxShadow: "none",
      minHeight: "44px",
      borderRadius: 12,
    }),
    menu: (provided: any) => ({
      ...provided,
      background: PALETTE.surface,
      borderRadius: 12,
      boxShadow: "0 6px 20px rgba(78,59,43,0.12)",
      marginTop: 8,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      background: state.isFocused ? PALETTE.border : "transparent",
      color: PALETTE.text,
      padding: 10,
    }),
    multiValue: (provided: any) => ({
      ...provided,
      background: "#E9DED2",
      color: PALETTE.text,
      borderRadius: 999,
      padding: "4px 8px",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: PALETTE.muted,
    }),
  };

  /* ---------------------- Helper helpers ---------------------- */

  // Normaliza selección múltiple: si incluye "No tengo", devuelve solo esa opción
  function normalizeMultiSelection(
    sel: MultiValue<{ value: string; label: string }>
  ) {
    const values = sel.map((s) => s.value);
    if (values.includes("No tengo")) {
      return [{ value: "No tengo", label: "No tengo" }];
    }
    return sel;
  }

  /* ---------------------- Handlers de UI ---------------------- */

  function handleNextFromStep1() {
    setTouched(true);
    if (isStep1Valid) {
      setStep(2);
      setTouched(false);
      setErr(null);
    } else {
      setErr("Corrige los errores antes de continuar.");
    }
  }

  function handleBack() {
    setErr(null);
    setTouched(false);
    setStep((s) => Math.max(1, s - 1));
  }

  /* lógica para deshabilitar la descripción si "No tengo" está seleccionado */
  const antecedentesHasNoTengo = antecedentes.some((a) => a.value === "No tengo");
  const alergiasHasNoTengo = alergias.some((a) => a.value === "No tengo");
  const medicamentosHasNoTengo = medicamentos.some((a) => a.value === "No tengo");

  /* ---------------------- Submit final ---------------------- */

  async function handleFinalSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setTouched(true);
    setErr(null);

    if (!isStep1Valid || !isStep2Valid) {
      setErr("Completa todos los campos requeridos.");
      return;
    }

    if (!fechaNacimiento) {
      setErr("Selecciona tu fecha de nacimiento.");
      return;
    }

    // calcular edad
    const edad = calculateAge(fechaNacimiento);

    // preparar strings para guardar:
    // si la selección contiene "No tengo" -> guardamos "" (vacío) en la DB para la parte de texto asociada
    const antecedSelectedValues = normalizeMultiSelection(antecedentes).map((s) => s.value);
    const alergiasSelectedValues = normalizeMultiSelection(alergias).map((s) => s.value);
    const medsSelectedValues = normalizeMultiSelection(medicamentos).map((s) => s.value);

    // para guardar en el campo simple `antecedentes` (tu fakeDB espera una string)
    // guardaremos la lista separada por comas o "" si "No tengo"
    const antecedentesToSave = antecedSelectedValues.includes("No tengo")
      ? ""
      : antecedSelectedValues.join(", ");

    const alergiasToSave = alergiasSelectedValues.includes("No tengo")
      ? ""
      : alergiasSelectedValues.join(", ");

    const medicamentosToSave = medsSelectedValues.includes("No tengo")
      ? ""
      : medsSelectedValues.join(", ");

    // descripciones: si "No tengo" -> limpiar (guardar "")
    const antecedentesDescToSave = antecedSelectedValues.includes("No tengo") ? "" : antecedentesDesc.trim();
    const alergiasDescToSave = alergiasSelectedValues.includes("No tengo") ? "" : alergiasDesc.trim();
    const medicamentosDescToSave = medsSelectedValues.includes("No tengo") ? "" : medicamentosDesc.trim();

    // normalizar genero: mapear a "Masculino"|"Femenino"|"Otro" para la DB
    const generoSimple = mapGenderToSimple(genero);

    // Llamada a auth.registerUser (asegúrate de que auth.ts tenga la firma que espera estos parámetros)
    const res = registerUserAuth(
      `${nombre.trim()} ${apellido.trim()}`, // name
      email.trim(), // email
      password, // password
      telefono.trim(), // telefono
      edad, // edad (number)
      generoSimple, // genero ("Masculino" | "Femenino" | "Otro")
      antecedentesToSave, // antecedentes
      antecedentesDescToSave, // antecedentesDescripcion
      alergiasToSave, // alergias
      alergiasDescToSave, // alergiasDescripcion
      medicamentosToSave, // medicamentos
      medicamentosDescToSave // medicamentosDescripcion
    );

    if (!res.ok) {
      setErr(res.error || "No se pudo registrar. Intenta nuevamente.");
      return;
    }

    // Si todo OK, vamos al paso 3 (pantalla de éxito)
    setStep(3);
  }

  /* ---------------------- Framer Motion variants (slide) ---------------------- */
  const containerVariants = {
    enter: (direction = 0) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction = 0) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  /* ---------------------- Render ---------------------- */
  return (
    <section
      className="py-5"
      style={{
        background: `linear-gradient(180deg,#FAF9F7 0%,#F1E9E0 100%)`,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card border-0 shadow-lg rounded-4"
              style={{ backgroundColor: PALETTE.surface, overflow: "hidden" }}
            >
              <div className="card-body p-4 p-md-5 text-center position-relative">
                {/* Volver atrás (en subvistas) */}
                {step > 1 && step < 3 && (
                  <p
                    onClick={handleBack}
                    style={{
                      position: "absolute",
                      left: "1.2rem",
                      top: "1.2rem",
                      color: PALETTE.text,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    ← Volver atrás
                  </p>
                )}

                {/* Indicador de progreso: oculto en pantalla de éxito */}
                {step < 3 && (
                  <div className="d-flex align-items-center justify-content-center mb-3 mt-1">
                    <div className="d-flex align-items-center">
                      <div className={`circle ${step >= 1 ? "filled" : ""}`}>1</div>
                      <div className={`line ${step === 2 ? "active" : ""}`}></div>
                      <div className={`circle ${step === 2 ? "filled" : ""}`}>2</div>
                      <div className={`line ${step === 3 ? "active" : ""}`} style={{ marginLeft: 10, marginRight: 10 }}></div>
                      <div className={`circle ${step === 3 ? "filled" : ""}`}>✓</div>
                    </div>
                  </div>
                )}

                <h1
                  className="fw-bold mb-1"
                  style={{
                    color: PALETTE.text,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {step === 1 ? "Crear cuenta" : step === 2 ? "Información médica" : "Registro exitoso"}
                </h1>

                <p className="text-muted mb-4" style={{ color: PALETTE.muted, fontSize: "0.95rem" }}>
                  {step === 1
                    ? "Regístrate para agendar tus citas de forma más rápida."
                    : step === 2
                    ? "Completa tu información médica básica."
                    : "Cuenta creada correctamente."}
                </p>

                {err && (
                  <div
                    className="alert alert-danger text-center"
                    style={{
                      backgroundColor: "#FCEAEA",
                      color: "#8C2B2B",
                      border: "1px solid #E3B4A0",
                    }}
                  >
                    {err}
                  </div>
                )}

                {/* ---------- Animated Steps (Framer Motion) ---------- */}
                <div style={{ position: "relative", height: "auto" }}>
                  <AnimatePresence initial={false} mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        custom={1}
                        variants={containerVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        {/* ---------------------- STEP 1 ---------------------- */}
                        <form onSubmit={(e) => { e.preventDefault(); handleNextFromStep1(); }} noValidate>
                          <Input
                            label="Nombre"
                            value={nombre}
                            setValue={setNombre}
                            error={touched && errorsStep1.nombre}
                            palette={PALETTE}
                          />
                          <Input
                            label="Apellido"
                            value={apellido}
                            setValue={setApellido}
                            error={touched && errorsStep1.apellido}
                            palette={PALETTE}
                          />
                          <Input
                            label="Correo electrónico"
                            type="email"
                            value={email}
                            setValue={setEmail}
                            error={touched && errorsStep1.email}
                            palette={PALETTE}
                          />
                          <Input
                            label="Teléfono"
                            value={telefono}
                            setValue={setTelefono}
                            error={touched && errorsStep1.telefono}
                            palette={PALETTE}
                          />

                          <InputPassword
                            label="Contraseña"
                            value={password}
                            setValue={setPassword}
                            show={showPassword}
                            setShow={setShowPassword}
                            error={touched && errorsStep1.password}
                            palette={PALETTE}
                          />

                          <InputPassword
                            label="Confirmar contraseña"
                            value={confirm}
                            setValue={setConfirm}
                            show={showConfirm}
                            setShow={setShowConfirm}
                            error={touched && errorsStep1.confirm}
                            palette={PALETTE}
                          />

                          <div className="d-grid gap-2">
                            <button
                              type="button"
                              className="btn w-100 fw-semibold py-2 mt-2"
                              style={{
                                backgroundColor: PALETTE.main,
                                border: "none",
                                color: "white",
                                borderRadius: "50px",
                                transition: "all 0.18s ease",
                              }}
                              onClick={handleNextFromStep1}
                            >
                              Siguiente
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        custom={2}
                        variants={containerVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        {/* ---------------------- STEP 2 (medica) ---------------------- */}
                        <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} noValidate>
                          {/* Fecha de nacimiento */}
                          <div className="mb-3 text-start">
                            <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
                              Fecha de nacimiento
                            </label>
                            <div style={{ position: "relative" }}>
                              <DatePicker
                                selected={fechaNacimiento}
                                onChange={(date: Date | null) => setFechaNacimiento(date)}
                                maxDate={new Date()}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                placeholderText="Selecciona tu fecha"
                                className={`form-control rounded-3 shadow-sm ${touched && errorsStep2.fechaNacimiento ? "is-invalid" : ""}`}
                                calendarClassName="custom-react-datepicker"
                                popperPlacement="bottom"
                                dateFormat="dd/MM/yyyy"
                              />
                              {touched && errorsStep2.fechaNacimiento && <div className="invalid-feedback">{errorsStep2.fechaNacimiento}</div>}
                            </div>
                          </div>

                          {/* Sexo */}
                          <div className="mb-3 text-start">
                            <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
                              Sexo biológico
                            </label>
                            <select
                              className={`form-select rounded-3 shadow-sm ${touched && errorsStep2.sexo ? "is-invalid" : ""}`}
                              value={sexo}
                              onChange={(e) => setSexo(e.target.value)}
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                            >
                              <option value="">Selecciona</option>
                              <option value="masculino">Masculino</option>
                              <option value="femenino">Femenino</option>
                              <option value="intersex">Intersex</option>
                              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
                            </select>
                            {touched && errorsStep2.sexo && <div className="invalid-feedback">{errorsStep2.sexo}</div>}
                          </div>

                          {/* Campo: Género (filtrable, selección única con animación) */}
{/* Género (react-select con animación similar a antecedentes médicos) */}
<div className="mb-3 text-start">
  <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
    Género
  </label>

  <Select
    options={genderSelectOptions}
    placeholder="Selecciona o escribe tu género..."
    isSearchable
    isMulti={false}
    value={genero ? { value: genero, label: genero } : null}
    onChange={(selected) => setGenero(selected ? selected.value : "")}
    styles={reactSelectStyles}
    classNamePrefix="react-select"
  />

  {touched && errorsStep2.genero && (
    <div className="invalid-feedback">{errorsStep2.genero}</div>
  )}

  {/* Descripción animada (solo si selecciona “Otro”) */}
  <AnimatePresence>
    {genero === "Otro / Prefiero no decirlo" && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.28 }}
        style={{ overflow: "hidden" }}
      >
        <div className="mt-2">
          <textarea
            maxLength={200}
            className="form-control rounded-3 shadow-sm"
            placeholder="Especifica tu género (opcional)"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            style={{
              borderColor: PALETTE.border,
              backgroundColor: PALETTE.surface,
              minHeight: 60,
            }}
          />
          <small style={{ color: PALETTE.muted }}>{genero.length}/200</small>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

                          {/* Antecedentes médicos (react-select multiselect) */}
                          <div className="mb-3 text-start">
                            <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
                              Antecedentes médicos
                            </label>

                            <Select
                              isMulti
                              options={antecedentsOptions}
                              value={antecedentes}
                              onChange={(v) => setAntecedentes(normalizeMultiSelection(v as any) as any)}
                              styles={reactSelectStyles}
                              placeholder="Busca o selecciona antecedentes..."
                              classNamePrefix="react-select"
                            />
                            {touched && (errorsStep2 as any).antecedentes && (
                              <div className="invalid-feedback">{(errorsStep2 as any).antecedentes}</div>
                            )}

                            {/* Descripción animada */}
                            <AnimatePresence>
                              {!antecedentesHasNoTengo && antecedentes.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.28 }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div className="mt-2">
                                    <textarea
                                      maxLength={1000}
                                      className="form-control rounded-3 shadow-sm"
                                      placeholder="Describe detalles relevantes (máx 1000 caracteres)"
                                      value={antecedentesDesc}
                                      onChange={(e) => setAntecedentesDesc(e.target.value)}
                                      style={{
                                        borderColor: PALETTE.border,
                                        backgroundColor: PALETTE.surface,
                                        minHeight: 100,
                                      }}
                                    />
                                    <small style={{ color: PALETTE.muted }}>{antecedentesDesc.length}/1000</small>
                                  </div>
                                </motion.div>
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
                              options={allergiesOptions}
                              value={alergias}
                              onChange={(v) => setAlergias(normalizeMultiSelection(v as any) as any)}
                              styles={reactSelectStyles}
                              placeholder="Busca o selecciona alergias..."
                              classNamePrefix="react-select"
                            />
                            {touched && (errorsStep2 as any).alergias && (
                              <div className="invalid-feedback">{(errorsStep2 as any).alergias}</div>
                            )}

                            <AnimatePresence>
                              {!alergiasHasNoTengo && alergias.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.28 }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div className="mt-2">
                                    <textarea
                                      maxLength={1000}
                                      className="form-control rounded-3 shadow-sm"
                                      placeholder="Describe las reacciones o tratamiento (máx 1000 caracteres)"
                                      value={alergiasDesc}
                                      onChange={(e) => setAlergiasDesc(e.target.value)}
                                      style={{
                                        borderColor: PALETTE.border,
                                        backgroundColor: PALETTE.surface,
                                        minHeight: 100,
                                      }}
                                    />
                                    <small style={{ color: PALETTE.muted }}>{alergiasDesc.length}/1000</small>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Medicamentos actuales (tags) */}
                          <div className="mb-3 text-start">
                            <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
                              Medicamentos actuales
                            </label>

                            <Select
                              isMulti
                              options={medsOptions}
                              value={medicamentos}
                              onChange={(v) => setMedicamentos(normalizeMultiSelection(v as any) as any)}
                              styles={reactSelectStyles}
                              placeholder="Escribe o selecciona medicamentos..."
                              classNamePrefix="react-select"
                            />
                            {touched && (errorsStep2 as any).medicamentos && (
                              <div className="invalid-feedback">{(errorsStep2 as any).medicamentos}</div>
                            )}

                            <AnimatePresence>
                              {!medicamentosHasNoTengo && medicamentos.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.28 }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div className="mt-2">
                                    <textarea
                                      maxLength={1000}
                                      className="form-control rounded-3 shadow-sm"
                                      placeholder="Describe dosis, frecuencia o notas (máx 1000 caracteres)"
                                      value={medicamentosDesc}
                                      onChange={(e) => setMedicamentosDesc(e.target.value)}
                                      style={{
                                        borderColor: PALETTE.border,
                                        backgroundColor: PALETTE.surface,
                                        minHeight: 100,
                                      }}
                                    />
                                    <small style={{ color: PALETTE.muted }}>{medicamentosDesc.length}/1000</small>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Buttons */}
                          <div className="d-grid gap-2">
                            <button
                              type="submit"
                              className="btn w-100 fw-semibold py-2"
                              style={{
                                backgroundColor: PALETTE.main,
                                border: "none",
                                color: "white",
                                borderRadius: "50px",
                                transition: "all 0.18s ease",
                              }}
                              onClick={() => setTouched(true)}
                            >
                              Crear cuenta
                            </button>

                            <button
                              type="button"
                              className="btn w-100 fw-semibold py-2 mt-2"
                              style={{
                                backgroundColor: "#D6C1B1",
                                border: "none",
                                color: PALETTE.text,
                                borderRadius: "50px",
                                transition: "all 0.18s ease",
                              }}
                              onClick={handleBack}
                            >
                              Volver
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        custom={3}
                        variants={containerVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        {/* ---------------------- STEP 3 (success) ---------------------- */}
                        <div style={{ padding: "0 1rem" }}>
                          <div
                            style={{
                              padding: "2rem 1rem",
                              borderRadius: 12,
                              background: "#FBF7F3",
                              boxShadow: "0 6px 20px rgba(78,59,43,0.04)",
                            }}
                          >
                            <h2 style={{ color: PALETTE.text }}>Cuenta creada con éxito</h2>

                            <p style={{ color: PALETTE.muted }}>
                              Si quieres cambiar tu información ya sea de perfil o médica, podrás hacerlo luego de iniciar sesión seleccionando el icono de usuario y el apartado que quieras cambiar.
                            </p>

                            <div style={{ marginTop: 16 }}>
                              <button
                                className="btn w-100 fw-semibold py-2"
                                style={{
                                  backgroundColor: PALETTE.main,
                                  border: "none",
                                  color: "white",
                                  borderRadius: "50px",
                                }}
                                onClick={() => router.push("/login")}
                              >
                                Ir al inicio de sesión
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Link de login */}
                <p
                  className="mt-3"
                  style={{
                    color: PALETTE.text,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => router.push("/login")}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------- Styles (JSX) ---------------------- */}
      <style jsx>{`
        .form-control,
        .form-select {
          border-color: ${PALETTE.border} !important;
          background-color: ${PALETTE.surface} !important;
        }

        .form-control:focus,
        .form-select:focus {
          box-shadow: none;
          outline: 2px solid rgba(176, 136, 96, 0.12);
        }

        .invalid-feedback {
          display: block;
          color: #d9534f;
          margin-top: 0.25rem;
          font-size: 0.9rem;
        }

        .circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid ${PALETTE.main};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: ${PALETTE.main};
          transition: all 0.28s ease;
        }

        .circle.filled {
          background-color: ${PALETTE.main};
          color: white;
        }

        .line {
          width: 56px;
          height: 4px;
          background-color: #e6d9cf;
          margin: 0 10px;
          transition: background-color 0.28s ease;
        }

        .line.active {
          background-color: ${PALETTE.main};
        }

        /* react-datepicker custom styling */
        :global(.custom-react-datepicker) {
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(78, 59, 43, 0.12);
          border: 1px solid ${PALETTE.border};
        }

        :global(.react-datepicker__header) {
          background: ${PALETTE.surface};
          border-bottom: 1px solid ${PALETTE.border};
        }

        :global(.react-datepicker__current-month),
        :global(.react-datepicker-time__header) {
          color: ${PALETTE.text};
        }

        :global(.react-datepicker__day--selected),
        :global(.react-datepicker__day--keyboard-selected) {
          background-color: ${PALETTE.main};
          color: #fff;
          border-radius: 8px;
        }

        :global(.react-datepicker__day) {
          color: ${PALETTE.text};
        }

        /* PASSWORD input wrapper to place eye icon */
        .pwd-input-wrapper {
          position: relative;
        }

        .pwd-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* small responsiveness */
        @media (max-width: 576px) {
          .step-panel {
            width: 100%;
            padding: 0 0.25rem;
          }
        }
      `}</style>
    </section>
  );
}

/* ---------------------- Subcomponentes reutilizables (monolítico) ---------------------- */

/** Input genérico */
function Input({
  label,
  type = "text",
  value,
  setValue,
  error,
  palette,
}: {
  label: string;
  type?: string;
  value: string;
  setValue: (v: string) => void;
  error?: string | false;
  palette: { main: string; text: string; surface: string; border: string; muted?: string };
}) {
  return (
    <div className="mb-3 text-start">
      <label className="form-label fw-semibold" style={{ color: palette.text }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`form-control rounded-3 shadow-sm ${error ? "is-invalid" : ""}`}
        placeholder={type === "email" ? "tucorreo@gmail.com" : undefined}
        style={{
          borderColor: palette.border,
          backgroundColor: palette.surface,
        }}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

/** InputPassword con eye SVG dentro del input, ubicado a la derecha */
function InputPassword({
  label,
  value,
  setValue,
  show,
  setShow,
  error,
  palette,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  show: boolean;
  setShow: (b: boolean) => void;
  error?: string | false;
  palette: { main: string; text: string; surface: string; border: string };
}) {
  return (
    <div className="mb-3 text-start">
      <label className="form-label fw-semibold" style={{ color: palette.text }}>
        {label}
      </label>
      <div className="pwd-input-wrapper">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`form-control rounded-3 shadow-sm ${error ? "is-invalid" : ""}`}
          style={{
            paddingRight: "44px",
            borderColor: palette.border,
            backgroundColor: palette.surface,
          }}
          placeholder={label === "Contraseña" ? "Mínimo 8 caracteres" : "Repite tu contraseña"}
        />

        <div
          role="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="pwd-eye"
          onClick={() => setShow(!show)}
        >
          {show ? (
            // eye-off icon (closed)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 3l18 18" stroke={palette.main} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke={palette.main} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 12s2.5-5 9.5-5c2 .01 3.58.74 4.92 1.83" stroke={palette.text} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
              <path d="M21.5 12s-2.5 5-9.5 5c-2-.01-3.58-.74-4.92-1.83" stroke={palette.text} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
            </svg>
          ) : (
            // eye icon (open)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M1 12s2.5-6 11-6 11 6 11 6-2.5 6-11 6S1 12 1 12z" stroke={palette.main} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke={palette.main} strokeWidth="1.6" />
            </svg>
          )}
        </div>
      </div>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
