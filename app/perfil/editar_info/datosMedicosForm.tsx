"use client";

import { motion, AnimatePresence } from "framer-motion";
import Select, { MultiValue } from "react-select";
import { PALETTE } from "./palette";

const opciones = (arr: string[]) => arr.map((x) => ({ value: x, label: x }));

interface Props {
  antecedentes: MultiValue<{ value: string; label: string }>;
  alergias: MultiValue<{ value: string; label: string }>;
  medicamentos: MultiValue<{ value: string; label: string }>;
  setAntecedentes: (v: MultiValue<{ value: string; label: string }>) => void;
  setAlergias: (v: MultiValue<{ value: string; label: string }>) => void;
  setMedicamentos: (v: MultiValue<{ value: string; label: string }>) => void;
  antecedentesDescripcion: string;
  alergiasDescripcion: string;
  medicamentosDescripcion: string;
  setAntecedentesDescripcion: (v: string) => void;
  setAlergiasDescripcion: (v: string) => void;
  setMedicamentosDescripcion: (v: string) => void;
  canEdit: boolean;
}

export default function DatosMedicosForm({
  antecedentes,
  alergias,
  medicamentos,
  setAntecedentes,
  setAlergias,
  setMedicamentos,
  antecedentesDescripcion,
  alergiasDescripcion,
  medicamentosDescripcion,
  setAntecedentesDescripcion,
  setAlergiasDescripcion,
  setMedicamentosDescripcion,
  canEdit,
}: Props) {
  const selectStyles = {
    control: (p: any) => ({
      ...p,
      borderColor: PALETTE.border,
      boxShadow: "none",
      minHeight: "44px",
      borderRadius: 12,
    }),
  };

  const ANTECEDENTES = [
    "Hipertensión",
    "Diabetes",
    "Asma",
    "Cirugías previas",
    "Otra condición",
    "No tengo",
  ];
  const ALERGIAS = ["Penicilina", "Polen", "Lácteos", "Otra alergia", "No tengo"];
  const MEDICAMENTOS = ["Ibuprofeno", "Insulina", "Otro medicamento", "No tengo"];

  const renderCampo = (
    titulo: string,
    valor: MultiValue<{ value: string; label: string }>,
    setValor: (v: any) => void,
    desc: string,
    setDesc: (v: string) => void,
    opcionesLista: string[]
  ) => {
    const tieneNoTengo = valor.some((x) => x.value === "No tengo");
    return (
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold" style={{ color: PALETTE.text }}>
          {titulo}
        </label>
        <Select
          isMulti
          options={opciones(opcionesLista)}
          value={valor}
          onChange={(v) => setValor(v)}
          styles={selectStyles}
          classNamePrefix="react-select"
          placeholder={`Selecciona ${titulo.toLowerCase()}...`}
          isDisabled={!canEdit}
        />
        <AnimatePresence>
          {!tieneNoTengo && valor.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{ overflow: "hidden" }}
            >
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="form-control mt-2 rounded-3 shadow-sm"
                placeholder="Describe detalles relevantes..."
                disabled={!canEdit}
                style={{
                  borderColor: PALETTE.border,
                  backgroundColor: PALETTE.surface,
                  minHeight: 80,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h5 className="fw-semibold mb-3" style={{ color: PALETTE.main }}>
        Datos médicos
      </h5>
      {renderCampo(
        "Antecedentes médicos",
        antecedentes,
        setAntecedentes,
        antecedentesDescripcion,
        setAntecedentesDescripcion,
        ANTECEDENTES
      )}
      {renderCampo(
        "Alergias",
        alergias,
        setAlergias,
        alergiasDescripcion,
        setAlergiasDescripcion,
        ALERGIAS
      )}
      {renderCampo(
        "Medicamentos actuales",
        medicamentos,
        setMedicamentos,
        medicamentosDescripcion,
        setMedicamentosDescripcion,
        MEDICAMENTOS
      )}
    </motion.div>
  );
}
