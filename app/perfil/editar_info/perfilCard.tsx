"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "./palette";
import FotoPerfil from "./fotoPerfil";
import DatosPersonalesForm from "./datosPersonalesForm";
import DatosMedicosForm from "./datosMedicosForm";
import { useEditarInfo } from "./useEditarInfo";

export default function PerfilCard() {
  const {
    user,
    formState,
    setters,
    handleSave,
    canEdit,
    message,
    daysRemaining,
  } = useEditarInfo();

  return (
    <motion.div
      className="card rounded-4 shadow-lg p-4"
      style={{ border: "none", backgroundColor: PALETTE.surface }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FotoPerfil
        photo={formState.photo}
        email={user?.email}
        canEdit={canEdit}
        setPhoto={setters.setPhoto}
      />

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div
              className="alert text-center"
              style={{
                backgroundColor: PALETTE.main,
                color: "white",
                border: "none",
              }}
            >
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="row g-4">
        <div className="col-md-6">
          <DatosPersonalesForm {...formState} {...setters} canEdit={canEdit} />
        </div>
        <div className="col-md-6">
          <DatosMedicosForm {...formState} {...setters} canEdit={canEdit} />
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={handleSave}
          className="btn text-white fw-semibold px-4 py-2 rounded-3 shadow-sm"
          style={{
            backgroundColor: PALETTE.main,
            opacity: canEdit ? 1 : 0.6,
          }}
          disabled={!canEdit}
        >
          Guardar cambios
        </button>

        <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
          {canEdit
            ? "Solo puedes actualizar tu información una vez cada 30 días."
            : `Vuelve el ${new Date(
                Date.now() + daysRemaining * 86400000
              ).toLocaleDateString()} para modificar tus datos.`}
        </p>
      </div>
    </motion.div>
  );
}
