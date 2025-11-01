"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTestimonios,
  addTestimonio,
  updateTestimonio,
  deleteTestimonio,
  Testimonio,
} from "../../utils/localDB";
import {
  activarTestimonio,
  desactivarTestimonio,
  validarVideoURL,
} from "./helpers";

export default function TestimoniosList() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [modo, setModo] = useState<"lista" | "crear" | "editar">("lista");
  const [actual, setActual] = useState<Testimonio | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    texto: "",
    video: "",
  });

  // === Cargar testimonios al montar ===
  useEffect(() => {
    setTestimonios(getTestimonios());
  }, []);

  // === Guardar nuevo o editar ===
  const handleGuardar = () => {
  if (!form.nombre.trim() || !form.texto.trim()) {
    alert("Debes completar nombre y texto del testimonio");
    return;
  }

  if (modo === "crear") {
    addTestimonio({
      nombre: form.nombre,
      texto: form.texto,
      video: form.video,
      activo: true,
      thumb: "",
    });
  } else if (modo === "editar" && actual) {
    updateTestimonio(actual.id, {
      nombre: form.nombre,
      texto: form.texto,
      video: form.video,
    });
  }

  setForm({ nombre: "", texto: "", video: "" });
  setModo("lista");
  setTestimonios(getTestimonios());
};


  // === Editar un testimonio existente ===
  const handleEditar = (t: Testimonio) => {
    setActual(t);
    setForm({ nombre: t.nombre, texto: t.texto, video: t.video });
    setModo("editar");
  };

  // === Eliminar testimonio ===
  const handleEliminar = (id: number) => {
    if (confirm("¿Eliminar este testimonio?")) {
      deleteTestimonio(id);
      setTestimonios(getTestimonios());
    }
  };

  // === Render ===
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-[#6E4F37] mb-6">
        Testimonios
      </h2>

      {/* === Formulario Crear / Editar === */}
      <AnimatePresence>
        {modo !== "lista" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg shadow bg-[#FBF7F2]"
          >
            <h3 className="text-lg font-medium mb-3 text-[#8B6A4B]">
              {modo === "crear" ? "Agregar Testimonio" : "Editar Testimonio"}
            </h3>

            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            <textarea
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              placeholder="Texto del testimonio"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            <input
              type="text"
              value={form.video}
              onChange={(e) => setForm({ ...form, video: e.target.value })}
              placeholder="URL del video (opcional)"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {/* Vista previa del video */}
            {validarVideoURL(form.video) && (
              <div className="my-3">
                <iframe
                  src={form.video}
                  className="rounded-lg"
                  width="100%"
                  height="250"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGuardar}
                className="bg-[#C7A27A] text-white px-4 py-2 rounded hover:bg-[#B08968] transition"
              >
                Guardar
              </button>
              <button
                onClick={() => setModo("lista")}
                className="border border-[#C7A27A] text-[#6E4F37] px-4 py-2 rounded hover:bg-[#F3E9E0] transition"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Listado === */}
      {modo === "lista" && (
        <div className="space-y-4">
          <button
            onClick={() => setModo("crear")}
            className="mb-4 bg-[#8B6A4B] text-white px-4 py-2 rounded hover:bg-[#6E4F37] transition"
          >
            + Agregar Testimonio
          </button>

          {testimonios.length === 0 ? (
            <p className="text-[#6E4F37]">No hay testimonios registrados.</p>
          ) : (
            testimonios.map((t) => (
              <motion.div
                key={t.id}
                layout
                className="p-4 bg-white rounded-lg shadow-sm border border-[#E5D8C8]"
              >
                <h3 className="text-lg font-semibold text-[#6E4F37]">
                  {t.nombre}
                </h3>
                <p className="text-[#6E5A49] mb-3">{t.texto}</p>

                {/* Video embebido */}
                {t.video && validarVideoURL(t.video) && (
                  <iframe
                    src={t.video}
                    width="100%"
                    height="200"
                    className="rounded-md mb-3"
                    allowFullScreen
                  ></iframe>
                )}

                {/* === BOTONES === */}
                <div className="flex items-center justify-between mt-3">
                  {/* === BOTÓN SWITCH === */}
                  <div
                    onClick={() => {
                      if (t.activo) desactivarTestimonio(t.id);
                      else activarTestimonio(t.id);
                      setTestimonios(getTestimonios());
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm text-[#6E4F37]">
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                    <motion.div
                      className={`w-12 h-6 rounded-full p-[2px] ${
                        t.activo ? "bg-green-400" : "bg-gray-300"
                      }`}
                      layout
                      transition={{ duration: 0.25 }}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow"
                        animate={{
                          x: t.activo ? 24 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    </motion.div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(t)}
                      className="px-3 py-1 rounded bg-[#E5D8C8] text-[#6E4F37] hover:bg-[#C7A27A] transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleEliminar(t.id)}
                      className="px-3 py-1 rounded bg-red-200 text-red-700 hover:bg-red-300 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
