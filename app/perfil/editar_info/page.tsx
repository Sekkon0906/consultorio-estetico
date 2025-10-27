"use client";

import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { MultiValue } from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser } from "../../utils/auth";
import { fakeUsers, User, updateUser } from "../../utils/fakeDB";

/* ----------------------------- Paleta ----------------------------- */
const PALETTE = {
  main: "#B08968",
  text: "#4E3B2B",
  muted: "#6C584C",
  surface: "#FFFDF9",
  border: "#E9DED2",
};

/* ------------------------ Opciones predefinidas ------------------- */
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
  "Femenino",
  "Masculino",
  "No binario",
  "Transgénero",
  "Intersexual",
  "Género fluido",
  "Agénero",
  "Prefiero no decirlo",
  "Otro",
];

/* ----------------------------- Helpers --------------------------- */
function toSelectOptions(arr: string[]) {
  return arr.map((s) => ({ value: s, label: s }));
}

function normalizeMultiSelection(sel: MultiValue<{ value: string; label: string }>) {
  const values = sel.map((s) => s.value);
  if (values.includes("No tengo")) {
    return [{ value: "No tengo", label: "No tengo" }];
  }
  return sel;
}

/* react-select styles (coherente con tu diseño) */
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

/* --------------------------- Component --------------------------- */
export default function EditarInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  /* personal */
  const [photo, setPhoto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [sexo, setSexo] = useState("");
  // GENERO: identidad (opción)
  const [genero, setGenero] = useState("");
  // GENERO DESCRIPCION: texto libre si eligió "Otro" o "Prefiero no decirlo"
  const [generoDescripcion, setGeneroDescripcion] = useState("");

  /* password fields (editable) */
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* react-select multiselect states */
  const [antecedentes, setAntecedentes] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [alergias, setAlergias] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [medicamentos, setMedicamentos] = useState<MultiValue<{ value: string; label: string }>>([]);

  /* descriptions */
  const [antecedentesDesc, setAntecedentesDesc] = useState("");
  const [alergiasDesc, setAlergiasDesc] = useState("");
  const [medicamentosDesc, setMedicamentosDesc] = useState("");

  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  /* 30-day lock */
  const [canEdit, setCanEdit] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const antecedentsOptions = toSelectOptions(ANTECEDENTES_OPTIONS);
  const allergiesOptions = toSelectOptions(ALERGIAS_OPTIONS);
  const medsOptions = toSelectOptions(MEDICAMENTOS_OPTIONS);
  const genderSelectOptions = toSelectOptions(GENDER_OPTIONS);

  /* flags for "No tengo" */
  const antecedentesHasNoTengo = antecedentes.some((a) => a.value === "No tengo");
  const alergiasHasNoTengo = alergias.some((a) => a.value === "No tengo");
  const medicamentosHasNoTengo = medicamentos.some((a) => a.value === "No tengo");

  /* -------------------- load current user -------------------- */
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    setEditUser({ ...u });

    // populate form fields from user
    // nombre/apellido split (mantenemos tu lógica original)
    setNombre((u as any).name || "");
    if ((u as any).name && typeof (u as any).name === "string") {
      const parts = (u as any).name.split(" ");
      setNombre(parts.slice(0, -1).join(" ") || parts[0] || "");
      setApellido(parts.slice(-1).join(" ") || "");
    } else {
      setNombre((u as any).name || "");
      setApellido("");
    }

    setEmail(u.email || "");
    setTelefono(u.telefono || "");
    // si tu modelo tiene `fechaNacimiento` en fakeDB, convertimos; si no, queda null
    setFechaNacimiento((u as any).fechaNacimiento ? new Date((u as any).fechaNacimiento) : null);

    setSexo((u as any).sexo || "");

    // Genero & descripcion: si fakeDB trae genero de los permitidos lo usamos,
    // si trae otro texto lo lo ponemos en descripcion y marcamos genero = "Otro"
    const g = (u as any).genero;
    if (g === "Masculino" || g === "Femenino" || g === "Otro") {
      setGenero(g);
      setGeneroDescripcion((u as any).generoDescripcion || "");
    } else if (typeof g === "string" && g) {
      setGenero("Otro");
      setGeneroDescripcion(g);
    } else {
      setGenero("");
      setGeneroDescripcion("");
    }

    // If the fake user stored antecedentes/alergias/medicamentos as comma lists,
    // convert them to react-select MultiValue arrays:
    const toMulti = (s: string) =>
      !s
        ? []
        : s === "No tengo"
        ? [{ value: "No tengo", label: "No tengo" }]
        : s.split(",").map((p) => ({ value: p.trim(), label: p.trim() }));
    // Si el usuario ya tiene foto, úsala; si no, usa una por defecto
    const storedPhoto = u.photo || localStorage.getItem(`photo_${u.email}`);
    setPhoto(storedPhoto || "/default-avatar.png"); // reemplaza con tu ruta de imagen default

    setAntecedentes(toMulti((u as any).antecedentes || ""));
    setAlergias(toMulti((u as any).alergias || ""));
    setMedicamentos(toMulti((u as any).medicamentos || ""));

    setAntecedentesDesc((u as any).antecedentesDescripcion || "");
    setAlergiasDesc((u as any).alergiasDescripcion || "");
    setMedicamentosDesc((u as any).medicamentosDescripcion || "");

    // 30-day lock check
    const lastEdit = localStorage.getItem(`lastEdit_${u.email}`);
    if (lastEdit) {
      const lastDate = new Date(lastEdit);
      const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      setCanEdit(diffDays >= 30);
      setDaysRemaining(Math.max(0, 30 - diffDays));
    } else {
      setCanEdit(true);
      setDaysRemaining(0);
    }
  }, []);

  /* -------------------- handlers -------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // keep both field-level and editUser in sync
    if (name === "nombre") setNombre(value);
    if (name === "apellido") setApellido(value);
    if (name === "telefono") setTelefono(value);
    if (name === "email") setEmail(value);
    // update editUser generic (cast safe)
    setEditUser((prev) => (prev ? ({ ...prev, [name]: value } as User) : prev));
  };

  /* Build user object from form before saving */
  function buildUserFromForm(): User | null {
    if (!editUser && !user) return null;
    const base = editUser ? { ...editUser } : user!;

    // assemble name back from nombre + apellido
    const combinedName = `${nombre?.trim()} ${apellido?.trim()}`.trim();
    base.name = combinedName || base.name || "";
    base.telefono = telefono || base.telefono || "";

    // SEXO (biologico)
    (base as any).sexo = sexo || (base as any).sexo || "";

    // GENERO (identidad) - guardamos la opción en genero y la descripción en generoDescripcion (solo si eligió "Otro")
    if (genero) {
      // si es una de las opciones permitidas de User, guardamos directamente
      if (genero === "Masculino" || genero === "Femenino" || genero === "Otro") {
        (base as any).genero = genero;
      } else {
        // valor libre -> lo guardamos como descripcion y marcamos genero = "Otro"
        (base as any).genero = "Otro";
        (base as any).generoDescripcion = generoDescripcion || genero;
      }
    } else {
      // no seleccionado -> dejar lo que exista o cadena vacía
      (base as any).genero = (base as any).genero || "";
      (base as any).generoDescripcion = (base as any).generoDescripcion || "";
    }

    // contraseñas: si el usuario escribió una nueva contraseña y coincide con confirm, la guardamos
    if (password) {
      if (password === confirm) {
        (base as any).password = password;
      } else {
        // leave password unchanged if mismatch - but UI should prevent confirmSave if mismatch
      }
    }

    // convert multiselects to comma lists (or "No tengo")
    const mapMultiToString = (m: MultiValue<{ value: string }>) => {
      const vals = m.map((s) => s.value);
      if (vals.includes("No tengo")) return "No tengo";
      return vals.join(", ");
    };

    (base as any).antecedentes = mapMultiToString(antecedentes);
    (base as any).antecedentesDescripcion = antecedentesHasNoTengo ? "" : antecedentesDesc;
    (base as any).alergias = mapMultiToString(alergias);
    (base as any).alergiasDescripcion = alergiasHasNoTengo ? "" : alergiasDesc;
    (base as any).medicamentos = mapMultiToString(medicamentos);
    (base as any).medicamentosDescripcion = medicamentosHasNoTengo ? "" : medicamentosDesc;

    // if fechaNacimiento is set compute edad if desired (here we keep fechaNacimiento and edad)
    if (fechaNacimiento) {
      const today = new Date();
      let age = today.getFullYear() - fechaNacimiento.getFullYear();
      const m = today.getMonth() - fechaNacimiento.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < fechaNacimiento.getDate())) {
        age--;
      }
      (base as any).edad = age;
      (base as any).fechaNacimiento = fechaNacimiento.toISOString();
    }

    return base as User;
  }

  /* confirm save after modal */
  const confirmSave = () => {
    // basic client-side validations before saving
    setTouched(true);

    // validate password confirmation if password entered
    if (password && password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      setTimeout(() => setMessage(""), 3500);
      setShowModal(false);
      return;
    }

    const built = buildUserFromForm();
    if (!built) return;

    const index = fakeUsers.findIndex((u) => u.email === built.email);
    if (index !== -1) {
      // use updateUser to keep fakeDB contract
      const updated = updateUser(built.id, built as Partial<User>);
      // fallback to replace in fakeUsers if updateUser not present
      if (updated) {
        // also persist currentUser and lastEdit
        localStorage.setItem("currentUser", JSON.stringify(updated));
        localStorage.setItem(`lastEdit_${updated.email}`, new Date().toISOString());
        setUser(updated);
        setEditUser(updated);
        setMessage("Información actualizada correctamente.");
        setShowModal(false);
        setCanEdit(false);
        setDaysRemaining(30);
        setTimeout(() => setMessage(""), 3500);
      } else {
        // fallback: update array directly
        fakeUsers[index] = built;
        localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
        localStorage.setItem("currentUser", JSON.stringify(built));
        localStorage.setItem(`lastEdit_${built.email}`, new Date().toISOString());
        setUser(built);
        setEditUser(built);
        setMessage("Información actualizada correctamente.");
        setShowModal(false);
        setCanEdit(false);
        setDaysRemaining(30);
        setTimeout(() => setMessage(""), 3500);
      }
    } else {
      // fallback: add user (shouldn't normally happen)
      fakeUsers.push(built);
      localStorage.setItem("fakeUsers", JSON.stringify(fakeUsers));
      localStorage.setItem("currentUser", JSON.stringify(built));
      localStorage.setItem(`lastEdit_${built.email}`, new Date().toISOString());
      setUser(built);
      setEditUser(built);
      setMessage("Información guardada.");
      setShowModal(false);
      setCanEdit(false);
      setDaysRemaining(30);
      setTimeout(() => setMessage(""), 3500);
    }
  };

  const handleSave = () => {
    setTouched(true);
    // basic validation: if password provided ensure confirm matches
    if (password && password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      setTimeout(() => setMessage(""), 3500);
      return;
    }
    setShowModal(true);
  };

  /* small helper to format date display when user has fechaNacimiento */
  const displayDOB = () => {
    if (!editUser) return "";
    if ((editUser as any).fechaNacimiento) {
      try {
        return new Date((editUser as any).fechaNacimiento).toLocaleDateString();
      } catch {
        return "";
      }
    }
    return "";
  };

  /* -------------------- UI -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-vh-100 py-5 d-flex justify-content-center align-items-start"
      style={{ backgroundColor: PALETTE.surface }}
    >
      <div className="container mt-4" style={{ maxWidth: 1000 }}>
        {/* Card with animated subtle background inside */}
        <motion.div
          className="card rounded-4 shadow-lg"
          style={{
            overflow: "hidden",
            border: "none",
            background: PALETTE.surface,
          }}
          initial={{ scale: 0.995, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          {/* animated inner backdrop behind the form (only inside card) */}
          <motion.div
            className="position-absolute inset-0"
            aria-hidden
            style={{ zIndex: 0 }}
            animate={{
              background: [
                `radial-gradient(circle at 15% 20%, ${PALETTE.main}22, transparent 30%)`,
                `radial-gradient(circle at 85% 80%, ${PALETTE.border}22, transparent 30%)`,
                `radial-gradient(circle at 50% 60%, ${PALETTE.surface}33, transparent 40%)`,
              ],
            }}
            transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div style={{ position: "relative", zIndex: 2, padding: 28 }}>
            {/* Title centered at top inside the vignette */}
            <h2 className="text-center fw-bold mb-3" style={{ color: PALETTE.text }}>
              Editar información del perfil
            </h2>
{/* Foto de perfil */}
<div className="text-center mb-4">
  <div
    className="mx-auto mb-3"
    style={{
      width: 140,
      height: 140,
      borderRadius: "50%",
      overflow: "hidden",
      border: `4px solid ${PALETTE.main}`,
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      backgroundColor: "#f8f9fa",
    }}
  >
    <img
      src={photo || "/default-avatar.png"}
      alt="Foto de perfil"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </div>

  <label
    htmlFor="fileInput"
    className="btn btn-outline-secondary btn-sm"
    style={{
      borderColor: PALETTE.main,
      color: PALETTE.main,
    }}
  >
    Cambiar foto
  </label>
  <input
    id="fileInput"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPhoto(base64);
          if (user?.email) {
            localStorage.setItem(`photo_${user.email}`, base64);
          }
          setEditUser((prev) => prev ? ({ ...prev, photo: base64 } as User) : prev);
        };
        reader.readAsDataURL(file);
      }
    }}
  />
</div>

            {/* Animated message (same style as register) */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.32 }}
                >
                  <div className="alert alert-success text-center" style={{ backgroundColor: PALETTE.main, color: "white", border: "none" }}>
                    {message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
              <div className="row g-4">
                {/* LEFT: Datos personales */}
                
                <div className="col-md-6" >
                  <h5 className="fw-semibold mb-3" style={{ color: PALETTE.main }}>Datos personales</h5>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Nombre</label>
                    <input
                      name="nombre"
                      value={nombre}
                      onChange={(e) => { setNombre(e.target.value); setEditUser(prev => prev ? ({ ...prev, name: `${e.target.value} ${apellido}` } as User) : prev); }}
                      className="form-control rounded-3 shadow-sm"
                      disabled={!canEdit}
                      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Apellido</label>
                    <input
                      name="apellido"
                      value={apellido}
                      onChange={(e) => { setApellido(e.target.value); setEditUser(prev => prev ? ({ ...prev, name: `${nombre} ${e.target.value}` } as User) : prev); }}
                      className="form-control rounded-3 shadow-sm"
                      disabled={!canEdit}
                      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Correo electrónico</label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleChange(e)}
                      className="form-control rounded-3 shadow-sm"
                      disabled
                      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Teléfono</label>
                    <input
                      name="telefono"
                      value={telefono}
                      onChange={(e) => { setTelefono(e.target.value); setEditUser(prev => prev ? ({ ...prev, telefono: e.target.value } as User) : prev); }}
                      className="form-control rounded-3 shadow-sm"
                      disabled={!canEdit}
                      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                    />
                  </div>

                  {/* Password and confirm (editable) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Contraseña (si quieres cambiarla)</label>
                    <div className="input-group">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control rounded-3 shadow-sm"
                        disabled={!canEdit}
                        style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((s) => !s)}
                        style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                        disabled={!canEdit}
                      >
                        {showPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Confirmar contraseña</label>
                    <div className="input-group">
                      <input
                        name="confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="form-control rounded-3 shadow-sm"
                        disabled={!canEdit}
                        style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirm((s) => !s)}
                        style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                        disabled={!canEdit}
                      >
                        {showConfirm ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Fecha de nacimiento</label>
                    <div style={{ position: "relative" }}>
                      <DatePicker
                        selected={fechaNacimiento}
                        onChange={(date: Date | null) => {
                          setFechaNacimiento(date);
                          setEditUser(prev => prev ? ({ ...prev, fechaNacimiento: date ? date.toISOString() : undefined } as User) : prev);
                        }}
                        maxDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText={displayDOB() || "Selecciona tu fecha"}
                        className="form-control rounded-3 shadow-sm"
                        calendarClassName="custom-react-datepicker"
                        popperPlacement="bottom"
                        dateFormat="dd/MM/yyyy"
                        disabled={!canEdit}
                      />
                      
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Sexo biológico</label>
                    <select
                      name="sexo"
                      className="form-select rounded-3 shadow-sm"
                      value={sexo}
                      onChange={(e) => { setSexo(e.target.value); setEditUser(prev => prev ? ({ ...prev, sexo: e.target.value } as User) : prev); }}
                      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
                      disabled={!canEdit}
                    >
                      <option value="">Selecciona</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="intersex">Intersex</option>
                      <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>

                  {/* Género - react-select single + textarea para "Otro" */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Género</label>
                    <Select
                      options={genderSelectOptions}
                      placeholder="Selecciona o escribe tu género..."
                      isSearchable
                      isMulti={false}
                      value={genero ? { value: genero, label: genero } : null}
                      onChange={(selected) => {
                        const val = selected ? selected.value : "";
                        setGenero(val);
                        // sincronizar con editUser (guardamos la opción; descripcion por separado)
                        setEditUser(prev => prev ? ({ ...prev, genero: val } as User) : prev);
                        if (val !== "Otro") {
                          setGeneroDescripcion("");
                          setEditUser(prev => prev ? ({ ...prev, generoDescripcion: "" } as User) : prev);
                        }
                      }}
                      styles={reactSelectStyles}
                      classNamePrefix="react-select"
                      isDisabled={!canEdit}
                    />

                    <AnimatePresence>
                      {genero === "Otro" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                          <div className="mt-2">
                            <textarea
                              maxLength={200}
                              className="form-control rounded-3 shadow-sm"
                              placeholder="Especifica tu identidad de género (opcional)"
                              value={generoDescripcion}
                              onChange={(e) => {
                                setGeneroDescripcion(e.target.value);
                                setEditUser(prev => prev ? ({ ...prev, generoDescripcion: e.target.value } as User) : prev);
                              }}
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, minHeight: 60 }}
                              disabled={!canEdit}
                            />
                            <small style={{ color: PALETTE.muted }}>{generoDescripcion.length}/200</small>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* RIGHT: Datos médicos */}
                <div className="col-md-6">
                  <h5 className="fw-semibold mb-3" style={{ color: PALETTE.main }}>Datos médicos</h5>

                  {/* Antecedentes multiselect */}
                  <div className="mb-3 text-start">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Antecedentes médicos</label>
                    <Select
                      isMulti
                      options={antecedentsOptions}
                      value={antecedentes}
                      onChange={(v) => {
                        const normalized = normalizeMultiSelection(v as any);
                        setAntecedentes(normalized as any);
                        setEditUser(prev => prev ? ({ ...prev, antecedentes: (normalized as any).map((x: any)=> x.value).join(", ") } as User) : prev);
                      }}
                      styles={reactSelectStyles}
                      placeholder="Busca o selecciona antecedentes..."
                      classNamePrefix="react-select"
                      isDisabled={!canEdit}
                    />
                    <AnimatePresence>
                      {!antecedentesHasNoTengo && antecedentes.length > 0 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                          <div className="mt-2">
                            <textarea
                              maxLength={1000}
                              className="form-control rounded-3 shadow-sm"
                              placeholder="Describe detalles relevantes (máx 1000 caracteres)"
                              value={antecedentesDesc}
                              onChange={(e) => { setAntecedentesDesc(e.target.value); setEditUser(prev => prev ? ({ ...prev, antecedentesDescripcion: e.target.value } as User) : prev); }}
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, minHeight: 100 }}
                              disabled={!canEdit}
                            />
                            <small style={{ color: PALETTE.muted }}>{antecedentesDesc.length}/1000</small>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Alergias multiselect */}
                  <div className="mb-3 text-start">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Alergias</label>

                    <Select
                      isMulti
                      options={allergiesOptions}
                      value={alergias}
                      onChange={(v) => {
                        const normalized = normalizeMultiSelection(v as any);
                        setAlergias(normalized as any);
                        setEditUser(prev => prev ? ({ ...prev, alergias: (normalized as any).map((x: any)=> x.value).join(", ") } as User) : prev);
                      }}
                      styles={reactSelectStyles}
                      placeholder="Busca o selecciona alergias..."
                      classNamePrefix="react-select"
                      isDisabled={!canEdit}
                    />
                    <AnimatePresence>
                      {!alergiasHasNoTengo && alergias.length > 0 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                          <div className="mt-2">
                            <textarea
                              maxLength={1000}
                              className="form-control rounded-3 shadow-sm"
                              placeholder="Describe las reacciones o tratamiento (máx 1000 caracteres)"
                              value={alergiasDesc}
                              onChange={(e) => { setAlergiasDesc(e.target.value); setEditUser(prev => prev ? ({ ...prev, alergiasDescripcion: e.target.value } as User) : prev); }}
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, minHeight: 100 }}
                              disabled={!canEdit}
                            />
                            <small style={{ color: PALETTE.muted }}>{alergiasDesc.length}/1000</small>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Medicamentos multiselect */}
                  <div className="mb-3 text-start">
                    <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>Medicamentos actuales</label>

                    <Select
                      isMulti
                      options={medsOptions}
                      value={medicamentos}
                      onChange={(v) => {
                        const normalized = normalizeMultiSelection(v as any);
                        setMedicamentos(normalized as any);
                        setEditUser(prev => prev ? ({ ...prev, medicamentos: (normalized as any).map((x: any)=> x.value).join(", ") } as User) : prev);
                      }}
                      styles={reactSelectStyles}
                      placeholder="Escribe o selecciona medicamentos..."
                      classNamePrefix="react-select"
                      isDisabled={!canEdit}
                    />
                    <AnimatePresence>
                      {!medicamentosHasNoTengo && medicamentos.length > 0 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                          <div className="mt-2">
                            <textarea
                              maxLength={1000}
                              className="form-control rounded-3 shadow-sm"
                              placeholder="Describe dosis, frecuencia o notas (máx 1000 caracteres)"
                              value={medicamentosDesc}
                              onChange={(e) => { setMedicamentosDesc(e.target.value); setEditUser(prev => prev ? ({ ...prev, medicamentosDescripcion: e.target.value } as User) : prev); }}
                              style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, minHeight: 100 }}
                              disabled={!canEdit}
                            />
                            <small style={{ color: PALETTE.muted }}>{medicamentosDesc.length}/1000</small>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Save button & note */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn text-white fw-semibold px-4 py-2 rounded-3 shadow-sm"
                  style={{
                    backgroundColor: PALETTE.main,
                    opacity: canEdit ? 1 : 0.6,
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleSave}
                  disabled={!canEdit}
                >
                  Guardar cambios
                </button>

                <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
                  {canEdit
                    ? "Solo puedes actualizar tu información una vez cada 30 días."
                    : `Vuelve el ${new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString()} para modificar tus datos.`}
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Confirmation modal (centered inside viewport) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ background: "rgba(0,0,0,0.45)", zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-4 shadow-lg p-4 text-center"
              style={{ width: 420 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h4 className="fw-bold mb-2" style={{ color: PALETTE.main }}>Cuidado</h4>
              <p className="text-muted mb-3">
                Solo puedes actualizar tu información una vez cada 30 días.
                ¿Confirmas que deseas aplicar los cambios ahora?
              </p>

              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-3" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button
                  className="btn text-white px-3"
                  style={{ backgroundColor: PALETTE.main }}
                  onClick={confirmSave}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
