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
    thumb: "",
  });
  const [confirmEliminar, setConfirmEliminar] = useState<null | number>(null);
  const [fotoCargada, setFotoCargada] = useState(false);

  useEffect(() => {
    setTestimonios(getTestimonios());
  }, []);

  // === Cargar imagen de portada ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, thumb: reader.result as string }));
      setFotoCargada(true);
    };
    reader.readAsDataURL(file);
  };

  // === Guardar ===
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
        thumb: form.thumb,
        activo: true,
      });
    } else if (modo === "editar" && actual) {
      updateTestimonio(actual.id, {
        nombre: form.nombre,
        texto: form.texto,
        video: form.video,
        thumb: form.thumb,
      });
    }

    setForm({ nombre: "", texto: "", video: "", thumb: "" });
    setFotoCargada(false);
    setModo("lista");
    setTestimonios(getTestimonios());
  };

  const handleEditar = (t: Testimonio) => {
    setActual(t);
    setForm({
      nombre: t.nombre,
      texto: t.texto,
      video: t.video,
      thumb: t.thumb || "",
    });
    setModo("editar");
  };

  const confirmarEliminar = (id: number) => setConfirmEliminar(id);

  const handleEliminar = (id: number) => {
    deleteTestimonio(id);
    setTestimonios(getTestimonios());
    setConfirmEliminar(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[--main] mb-6">Testimonios</h2>

      {/* === Formulario Crear / Editar === */}
      <AnimatePresence>
        {modo !== "lista" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-6 rounded-xl shadow bg-[--surface] border border-[--border]"
          >
            <h3 className="text-lg font-medium mb-4 text-[--main]">
              {modo === "crear" ? "Agregar Testimonio" : "Editar Testimonio"}
            </h3>

            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full p-2 border border-[--border] rounded mb-3 focus:ring-2 focus:ring-[--main]"
            />

            <textarea
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              placeholder="Texto del testimonio"
              className="w-full p-2 border border-[--border] rounded mb-3 focus:ring-2 focus:ring-[--main] min-h-[100px]"
            />

            <input
              type="text"
              value={form.video}
              onChange={(e) => setForm({ ...form, video: e.target.value })}
              placeholder="URL del video (Opcional, si prefieres subir una imagen de portada, deja este campo vacío)"
              className="w-full p-2 border border-[--border] rounded mb-4 focus:ring-2 focus:ring-[--main]"
            />

            {/* === Subida de imagen con botón personalizado === */}
            <div className="mb-5">
              <label className="block mb-2 text-[--textSoft] font-medium">
                Imagen de portada (si no hay video)
              </label>
              <label
                htmlFor="thumbUpload"
                className="cursor-pointer inline-flex items-center justify-center bg-[#7a563a] hover:bg-[#5d3f29] text-white font-medium py-2 px-4 rounded-md shadow transition"
              >
                📸 Presiona para subir una foto
              </label>
              <input
                id="thumbUpload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fotoCargada && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✅ Foto cargada correctamente
                </p>
              )}
              {form.thumb && (
                <img
                  src={form.thumb}
                  alt="Miniatura"
                  className="rounded-md shadow-md mt-3 max-h-[240px] mx-auto"
                />
              )}
            </div>

            {/* === Vista previa del video === */}
            {validarVideoURL(form.video) && (
              <div className="my-3">
                <iframe
                  src={form.video}
                  className="rounded-lg w-full"
                  height="250"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleGuardar}
                className="bg-[#7a563a] text-white px-5 py-2 rounded hover:bg-[#5d3f29] transition"
              >
                Guardar
              </button>
              <button
                onClick={() => setModo("lista")}
                className="border border-[#7a563a] text-[#7a563a] px-5 py-2 rounded hover:bg-[#ebd9c6] transition"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Listado === */}
      {modo === "lista" && (
        <div className="space-y-6">
          <button
            onClick={() => setModo("crear")}
            className="mb-6 bg-[#7a563a] text-white px-5 py-2 rounded hover:bg-[#5d3f29] transition"
          >
            + Agregar Testimonio
          </button>

          {testimonios.length === 0 ? (
            <p className="text-[--textSoft]">No hay testimonios registrados.</p>
          ) : (
            testimonios.map((t) => (
              <motion.div
                key={t.id}
                layout
                className="p-6 bg-[--surface] rounded-xl shadow border border-[--border]"
              >
                <h3 className="text-lg font-semibold text-[--main] mb-1">
                  {t.nombre}
                </h3>
                <p className="text-[--textSoft] mb-4">{t.texto}</p>

                {t.thumb ? (
                  <img
                    src={t.thumb}
                    alt="Portada del video"
                    className="rounded-md mb-4 w-full max-h-[280px] object-cover"
                  />
                ) : (
                  t.video &&
                  validarVideoURL(t.video) && (
                    <iframe
                      src={t.video}
                      width="100%"
                      height="250"
                      className="rounded-md mb-4"
                      allowFullScreen
                    ></iframe>
                  )
                )}

                <div className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      if (t.activo) desactivarTestimonio(t.id);
                      else activarTestimonio(t.id);
                      setTestimonios(getTestimonios());
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm text-[--textSoft]">
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                    <motion.div
                      className={`w-12 h-6 rounded-full p-[2px] ${
                        t.activo ? "bg-green-500" : "bg-gray-300"
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
                      className="px-3 py-1 rounded bg-[#c5a689] text-white hover:bg-[#7a563a] transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => confirmarEliminar(t.id)}
                      className="px-3 py-1 rounded bg-[#e57373] text-white hover:bg-[#c62828] transition"
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

      {/* === Modal de confirmación === */}
      <AnimatePresence>
        {confirmEliminar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white border border-[--border] p-6 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              <h3 className="text-[--main] text-lg font-semibold mb-2">
                ¿Eliminar este testimonio?
              </h3>
              <p className="text-[--textSoft] mb-5">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleEliminar(confirmEliminar)}
                  className="bg-[#c62828] text-white px-5 py-2 rounded hover:bg-[#a4161a] transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setConfirmEliminar(null)}
                  className="border border-[--border] text-[--main] px-5 py-2 rounded hover:bg-[--border] transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
