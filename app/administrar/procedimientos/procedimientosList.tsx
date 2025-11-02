"use client";

import { useEffect, useState } from "react";
import {
  getProcedimientos,
  addProcedimiento,
  updateProcedimiento,
  deleteProcedimiento,
  Procedimiento,
  CategoriaProcedimiento,
  MediaItem,
} from "../../utils/localDB";
import { motion, AnimatePresence } from "framer-motion";
import ModalGaleriaItem from "./modalGaleriaItem";

export default function ProcedimientosList() {
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [modo, setModo] = useState<"lista" | "crear" | "editar">("lista");
  const [actual, setActual] = useState<Procedimiento | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    desc: "",
    precio: "",
    imagen: "",
    categoria: "Facial" as CategoriaProcedimiento,
    duracionMin: "",
    destacado: false,
    galeria: [] as MediaItem[],
  });

  useEffect(() => {
    setProcedimientos(getProcedimientos());
  }, []);

  // === Guardar ===
  const handleGuardar = () => {
    if (!form.nombre.trim() || !form.desc.trim()) {
      alert("Por favor completa el nombre y la descripción.");
      return;
    }

    const data: Omit<Procedimiento, "id"> = {
      nombre: form.nombre,
      desc: form.desc,
      precio: Number(form.precio) || 0,
      imagen: form.imagen,
      categoria: form.categoria,
      duracionMin: Number(form.duracionMin) || undefined,
      destacado: form.destacado,
      galeria: form.galeria,
    };

    if (modo === "crear") addProcedimiento(data);
    else if (modo === "editar" && actual) updateProcedimiento(actual.id, data);

    setForm({
      nombre: "",
      desc: "",
      precio: "",
      imagen: "",
      categoria: "Facial",
      duracionMin: "",
      destacado: false,
      galeria: [],
    });
    setModo("lista");
    setProcedimientos(getProcedimientos());
  };

  // === Editar ===
  const handleEditar = (p: Procedimiento) => {
    setActual(p);
    setForm({
      nombre: p.nombre,
      desc: p.desc,
      precio: p.precio.toString(),
      imagen: p.imagen,
      categoria: p.categoria,
      duracionMin: p.duracionMin?.toString() || "",
      destacado: p.destacado || false,
      galeria: p.galeria || [],
    });
    setModo("editar");
  };

  // === Eliminar procedimiento ===
  const handleEliminar = (id: number) => {
    if (confirm("¿Deseas eliminar este procedimiento?")) {
      deleteProcedimiento(id);
      setProcedimientos(getProcedimientos());
    }
  };

  // === Manejo de imágenes ===
  const handleImagenPrincipal = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setForm({ ...form, imagen: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleEliminarMedia = (id: string) => {
    setForm({ ...form, galeria: form.galeria.filter((m) => m.id !== id) });
  };

  // === Guardar medio desde modal ===
  const handleSaveMedia = (item: MediaItem) => {
    setForm({ ...form, galeria: [...form.galeria, item] });
    setMostrarModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-[#6E4F37] mb-6">
        Procedimientos
      </h2>

      <AnimatePresence>
        {modo !== "lista" && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-lg bg-[#FBF7F2] shadow-md mb-6"
          >
            <h3 className="text-lg font-medium mb-4 text-[#8B6A4B]">
              {modo === "crear" ? "Agregar Procedimiento" : "Editar Procedimiento"}
            </h3>

            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del procedimiento"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Descripción"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="Precio"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            <select
              value={form.categoria}
              onChange={(e) =>
                setForm({ ...form, categoria: e.target.value as CategoriaProcedimiento })
              }
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3 bg-white"
            >
              <option value="Facial">Facial</option>
              <option value="Corporal">Corporal</option>
              <option value="Capilar">Capilar</option>
            </select>

            {/* Imagen principal */}
            <div
              className="border-2 border-dashed border-[#C7A27A] rounded-md p-4 text-center mb-3 cursor-pointer"
              onClick={() =>
                document.getElementById("uploadPrincipal")?.click()
              }
            >
              {form.imagen ? (
                <img
                  src={form.imagen}
                  alt="Vista previa"
                  className="mx-auto w-40 h-40 object-cover rounded"
                />
              ) : (
                <p className="text-[#6E4F37] opacity-80">
                  Presiona para subir una imagen principal
                </p>
              )}
              <input
                id="uploadPrincipal"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImagenPrincipal(e.target.files[0])
                }
              />
            </div>

            {/* Procedimiento en demanda */}
            <div className="mb-3 d-flex align-items-center gap-3">
              <label className="fw-semibold" style={{ color: "#4E3B2B" }}>
                Procedimiento en demanda:
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, destacado: !form.destacado })}
                className={`px-3 py-1 rounded-md font-medium ${
                  form.destacado
                    ? "bg-[#8B6A4B] text-white"
                    : "bg-[#E5D8C8] text-[#6E4F37]"
                }`}
              >
                {form.destacado ? "Activo" : "Inactivo"}
              </button>
            </div>

            {/* Galería */}
            <div className="mb-4">
              <h5 className="text-[#4E3B2B] font-semibold mb-2">
                Galería multimedia del procedimiento
              </h5>
              <div className="flex flex-wrap gap-3">
                {form.galeria.map((m) => (
                  <div
                    key={m.id}
                    className="relative rounded-md overflow-hidden border border-[#E5D8C8] shadow-sm"
                    style={{ width: "140px", height: "110px" }}
                  >
                    {m.tipo === "imagen" ? (
                      <img
                        src={m.url}
                        alt={m.titulo}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <iframe
                        src={m.url}
                        title={m.titulo}
                        className="w-full h-full"
                      />
                    )}
                    <button
                      onClick={() => handleEliminarMedia(m.id)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(true)}
                  className="bg-[#B08968] text-white px-3 py-1 rounded hover:bg-[#9b7450] transition"
                >
                  + Añadir
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleGuardar}
                className="bg-[#C7A27A] text-white px-4 py-2 rounded hover:bg-[#B08968]"
              >
                Guardar
              </button>
              <button
                onClick={() => setModo("lista")}
                className="border border-[#C7A27A] text-[#6E4F37] px-4 py-2 rounded hover:bg-[#F3E9E0]"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === LISTA === */}
      {modo === "lista" && (
        <div>
          <button
            onClick={() => setModo("crear")}
            className="mb-4 bg-[#8B6A4B] text-white px-4 py-2 rounded hover:bg-[#6E4F37]"
          >
            + Agregar Procedimiento
          </button>

          {procedimientos.length === 0 ? (
            <p className="text-[#6E4F37]">No hay procedimientos registrados.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {procedimientos.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-white border border-[#E5D8C8] rounded-lg shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[#6E4F37]">
                    {p.nombre}
                  </h3>
                  <p className="text-[#6E5A49] mb-2">{p.desc}</p>
                  <p className="text-sm text-[#8B6A4B] font-medium mb-2">
                    ${p.precio}
                  </p>
                  {p.imagen && (
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(p)}
                      className="px-3 py-1 rounded bg-[#E5D8C8] text-[#6E4F37] hover:bg-[#C7A27A]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="px-3 py-1 rounded bg-red-200 text-red-700 hover:bg-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de galería */}
      {mostrarModal && (
        <ModalGaleriaItem
          show={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSave={handleSaveMedia}
          modo="crear"
        />
      )}
    </div>
  );
}
