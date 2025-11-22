// app/perfil/editar_info/useEditarInfo.ts
"use client";

import { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import { getCurrentUser, updateCurrentUser, type SessionUser } from "../../utils/auth";
import { updateUserData, type User } from "../../utils/localDB";

/* ============================
   Tipos y utilidades
   ============================ */
type AuthUser = User | SessionUser;

type WithPhoto = { photo?: string | null | undefined };

function isFullUser(u: AuthUser): u is User {
  // Heurística: en tu modelo localDB, los User tienen 'password'
  return typeof (u as User).password !== "undefined";
}

function toMulti(
  s: string | undefined | null
): MultiValue<{ value: string; label: string }> {
  if (!s) return [];
  if (s === "No tengo") return [{ value: "No tengo", label: "No tengo" }];
  return s.split(",").map((p) => {
    const t = p.trim();
    return { value: t, label: t };
  });
}

function buildString(m: MultiValue<{ value: string }>) {
  const vals = m.map((s) => s.value);
  if (vals.includes("No tengo")) return "No tengo";
  return vals.join(", ");
}

/* ============================
   Hook personalizado principal
   ============================ */
export function useEditarInfo() {
  const [user, setUser] = useState<AuthUser | null>(null);
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
    const u = getCurrentUser(); // SessionUser | User | null
    if (!u) return;

    setUser(u);

    // Campos comunes
    setNombres(u.nombres ?? "");
    setApellidos(u.apellidos ?? "");
    setTelefono(u.telefono ?? "");

    // photo existe en ambos modelos; la normalizamos a string | undefined
    const p = (u as WithPhoto).photo ?? undefined;
    setPhoto(p ?? undefined);

    if (isFullUser(u)) {
      // Campos completos cuando el usuario es de localDB
      setEdad(u.edad ?? 0);
      setGenero(u.genero ?? "Otro");

      setAntecedentes(toMulti(u.antecedentes ?? ""));
      setAlergias(toMulti(u.alergias ?? ""));
      setMedicamentos(toMulti(u.medicamentos ?? ""));
      setAntecedentesDescripcion(u.antecedentesDescripcion ?? "");
      setAlergiasDescripcion(u.alergiasDescripcion ?? "");
      setMedicamentosDescripcion(u.medicamentosDescripcion ?? "");
    } else {
      // Defaults seguros para SessionUser (viene de API/Google)
      setEdad(0);
      setGenero("Otro");

      setAntecedentes([]);
      setAlergias([]);
      setMedicamentos([]);
      setAntecedentesDescripcion("");
      setAlergiasDescripcion("");
      setMedicamentosDescripcion("");
    }

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

    // Si es un User completo (localDB) → persiste también en la "DB" local
    if (isFullUser(user)) {
      updateUserData(updated, user.email);
    }

    // Siempre sincroniza la sesión (maneja SessionUser | User)
    updateCurrentUser(updated);

    localStorage.setItem(`lastEdit_${user.email}`, new Date().toISOString());
    setUser({ ...user, ...updated } as AuthUser);
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
