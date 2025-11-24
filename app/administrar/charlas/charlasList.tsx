"use client";

import { useState, useEffect } from "react";
import {
  getCharlasAPI,
  addCharlaAPI,
  updateCharlaAPI,
  deleteCharlaAPI,
} from "../../utils/apiCharlas";
import { motion, AnimatePresence } from "framer-motion";

// === INTERFAZ CHARLA ===
export interface Charla {
  id: number;
  titulo: string;
  descripcion: string;
  detalle: string;
  imagen: string;
  fecha: string;
}

export default function CharlasList() {
  const [charlas, setCharlas] = useState<Charla[]>([]);
  const [editando, setEditando] = useState<Charla | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Omit<Charla, "id">>({
    titulo: "",
    descripcion: "",
    detalle: "",
    imagen: "",
    fecha: "",
  });

  // ==== CARGAR CHARLAS ====
  useEffect(() => {
    cargarCharlas();
  }, []);

  const cargarCharlas = async () => {
    try {
      const data = await getCharlasAPI();
      setCharlas(data);
    } catch (err) {
      console.error("Error cargando charlas", err);
      setCharlas([]);
    }
  };

  // ==== RESET FORM ====
  const resetForm = () => {
    setFormVisible(false);
    setEditando(null);
    setFormData({
      titulo: "",
      descripcion: "",
      detalle: "",
      imagen: "",
      fecha: "",
    });
  };

  // ==== CREAR / EDITAR ====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateCharlaAPI(editando.id, formData);
      } else {
        await addCharlaAPI(formData);
      }
      await cargarCharlas();
      resetForm();
    } catch (error) {
      console.error("Error al guardar charla", error);
    }
  };

  // ==== ELIMINAR ====
  const handleDelete = async (id: number) => {
    if (confirm("¿Seguro que deseas eliminar esta charla?")) {
      await deleteCharlaAPI(id);
      await cargarCharlas();
    }
  };

  // ==== EDITAR ====
  const handleEdit = (charla: Charla) => {
    setEditando(charla);
    setFormVisible(true);
    const { id, ...rest } = charla;
    setFormData(rest);
  };

  // ==== SUBIR IMAGEN ====
  const handleImagenUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, imagen: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10">
      <h2
        className="text-3xl font-bold text-[#8B6A4B]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Formación Continua
      </h2>

      {/* === LISTADO DE CHARLAS === */}
      {!formVisible && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {charlas.map((charla) => (
                <motion.div
                  key={charla.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#FFFDF9] border border-[#E9DED2] rounded-3xl shadow-sm overflow-hidden flex flex-col"
                >
                  <img
                    src={charla.imagen}
                    alt={charla.titulo}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-lg font-semibold text-[#4E3B2B]">
                      {charla.titulo}
                    </h4>
                    <p className="text-[#6C584C] text-sm mb-2">
                      {charla.descripcion}
                    </p>
                    {charla.fecha && (
                      <p className="text-xs text-[#8B6A4B] mb-2">
                        📅{" "}
                        {new Date(charla.fecha).toLocaleDateString("es-CO")}
                      </p>
                    )}
                    <div className="mt-auto flex justify-between pt-2">
                      <button
                        onClick={() => handleEdit(charla)}
                        className="text-sm text-[#8B6A4B] font-medium hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(charla.id)}
                        className="text-sm text-red-600 font-medium hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setFormVisible(true)}
              className="bg-[#8B6A4B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#75573F]"
            >
              + Crear Charla
            </button>
          </div>
        </>
      )}

      {/* === FORMULARIO DE CREACIÓN / EDICIÓN === */}
      {formVisible && (
        <motion.form
          onSubmit={handleSubmit}
          layout
          className="bg-[#FFFDF9] border border-[#E9DED2] p-6 rounded-3xl shadow-sm space-y-4"
        >
          <h3 className="text-xl font-semibold text-[#4E3B2B]">
            {editando ? "Editar charla" : "Nueva charla"}
          </h3>

          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full border border-[#D8C4AA] rounded-lg px-4 py-2"
            required
          />

          <textarea
            placeholder="Descripción breve"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full border border-[#D8C4AA] rounded-lg px-4 py-2"
            rows={2}
            required
          />

          <textarea
            placeholder="Detalle"
            value={formData.detalle}
            onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
            className="w-full border border-[#D8C4AA] rounded-lg px-4 py-2"
            rows={3}
          />

          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full border border-[#D8C4AA] rounded-lg px-4 py-2"
          />

          {/* === SUBIR IMAGEN === */}
          <div className="pt-4 border-t border-[#E5D8C8]">
            <h4 className="text-lg font-medium text-[#8B6A4B] mb-2">
              Imagen principal
            </h4>
            {formData.imagen && (
              <img
                src={formData.imagen}
                alt="preview"
                className="w-56 h-36 object-cover rounded-lg mb-3 border border-[#E5D8C8]"
              />
            )}
            <label className="cursor-pointer inline-block bg-[#C7A27A] hover:bg-[#B08968] text-white px-5 py-2 rounded-full font-medium">
              Subir imagen
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleImagenUpload(e.target.files[0])
                }
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#8B6A4B] text-white px-6 py-2 rounded-full font-medium hover:bg-[#75573F]"
            >
              {editando ? "Guardar cambios" : "Crear charla"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-[#8B6A4B] text-[#8B6A4B] px-6 py-2 rounded-full font-medium hover:bg-[#F3E9DD]"
            >
              Cancelar
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
