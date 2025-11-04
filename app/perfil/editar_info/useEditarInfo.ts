"use client";

import { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import { getCurrentUser, updateCurrentUser } from "../../utils/auth";
import { updateUserData, User } from "../../utils/localDB";

/* ============================
   Hook personalizado principal
   ============================ */
export function useEditarInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [canEdit, setCanEdit] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Campos de formulario
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [edad, setEdad] = useState<number>(0);
  const [genero, setGenero] = useState<"Masculino" | "Femenino" | "Otro">("Otro");
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  const [antecedentes, setAntecedentes] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [alergias, setAlergias] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [medicamentos, setMedicamentos] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);

  const [antecedentesDescripcion, setAntecedentesDescripcion] = useState("");
  const [alergiasDescripcion, setAlergiasDescripcion] = useState("");
  const [medicamentosDescripcion, setMedicamentosDescripcion] = useState("");

  /* ============================
     Cargar datos iniciales
     ============================ */
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;

    setUser(u);
    setNombres(u.nombres || "");
    setApellidos(u.apellidos || "");
    setTelefono(u.telefono || "");
    setEdad(u.edad || 0);
    setGenero(u.genero || "Otro");
    setPhoto(u.photo || undefined);

    const toMulti = (s: string) =>
      !s
        ? []
        : s === "No tengo"
        ? [{ value: "No tengo", label: "No tengo" }]
        : s.split(",").map((p) => ({ value: p.trim(), label: p.trim() }));

    setAntecedentes(toMulti(u.antecedentes || ""));
    setAlergias(toMulti(u.alergias || ""));
    setMedicamentos(toMulti(u.medicamentos || ""));
    setAntecedentesDescripcion(u.antecedentesDescripcion || "");
    setAlergiasDescripcion(u.alergiasDescripcion || "");
    setMedicamentosDescripcion(u.medicamentosDescripcion || "");

    // Control de 30 días
    const lastEdit = localStorage.getItem(`lastEdit_${u.email}`);
    if (lastEdit) {
      const lastDate = new Date(lastEdit);
      const diffDays = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      setCanEdit(diffDays >= 30);
      setDaysRemaining(Math.max(0, 30 - diffDays));
    }
  }, []);

  /* ============================
     Guardar cambios
     ============================ */
  const handleSave = () => {
    if (!user) return;

    const buildString = (m: MultiValue<{ value: string }>) => {
      const vals = m.map((s) => s.value);
      if (vals.includes("No tengo")) return "No tengo";
      return vals.join(", ");
    };

    const updated: Partial<User> = {
      nombres,
      apellidos,
      telefono,
      edad,
      genero,
      antecedentes: buildString(antecedentes),
      antecedentesDescripcion,
      alergias: buildString(alergias),
      alergiasDescripcion,
      medicamentos: buildString(medicamentos),
      medicamentosDescripcion,
      photo,
    };

    // llamada 
    updateUserData(updated, user.email);
    updateCurrentUser(updated);

    localStorage.setItem(`lastEdit_${user.email}`, new Date().toISOString());
    setUser({ ...user, ...updated });
    setMessage("Información actualizada correctamente.");
    setCanEdit(false);
    setDaysRemaining(30);

    setTimeout(() => setMessage(""), 3500);
  };

  /* ============================
     Valores exportados
     ============================ */
  const formState = {
    nombres,
    apellidos,
    telefono,
    edad,
    genero,
    photo,
    antecedentes,
    alergias,
    medicamentos,
    antecedentesDescripcion,
    alergiasDescripcion,
    medicamentosDescripcion,
  };

  const setters = {
    setNombres,
    setApellidos,
    setTelefono,
    setEdad,
    setGenero,
    setPhoto,
    setAntecedentes,
    setAlergias,
    setMedicamentos,
    setAntecedentesDescripcion,
    setAlergiasDescripcion,
    setMedicamentosDescripcion,
  };

  return {
    user,
    message,
    setMessage,
    canEdit,
    daysRemaining,
    formState,
    setters,
    handleSave,
  };
}
