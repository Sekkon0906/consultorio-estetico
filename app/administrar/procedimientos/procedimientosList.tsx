"use client";

import { useEffect, useState } from "react";
import {
  getProcedimientos,
  addProcedimiento,
  updateProcedimiento,
  deleteProcedimiento,
  Procedimiento,
  CategoriaProcedimiento,
} from "../../utils/localDB";
import { motion, AnimatePresence } from "framer-motion";

export default function ProcedimientosList() {
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [modo, setModo] = useState<"lista" | "crear" | "editar">("lista");
  const [actual, setActual] = useState<Procedimiento | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    desc: "",
    precio: "",
    imagen: "",
    categoria: "Facial" as CategoriaProcedimiento,
    duracionMin: "",
    destacado: false,
    galeria: [] as string[],
  });

  useEffect(() => {
    setProcedimientos(getProcedimientos());
  }, []);

  // === Guardar nuevo o editar ===
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
      galeria: form.galeria.map((url) => ({
        id: crypto.randomUUID(),
        tipo: "imagen",
        url,
      })),
    };

    if (modo === "crear") {
      addProcedimiento(data);
    } else if (modo === "editar" && actual) {
      updateProcedimiento(actual.id, data);
    }

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

  // === Editar existente ===
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
      galeria: p.galeria?.map((m) => m.url) || [],
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

  // === Manejar galería ===
  const handleAgregarImagen = (url: string) => {
    if (url.trim() && !form.galeria.includes(url)) {
      setForm({ ...form, galeria: [...form.galeria, url] });
    }
  };

  const handleEliminarImagen = (url: string) => {
    setForm({ ...form, galeria: form.galeria.filter((img) => img !== url) });
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

            {/* Nombre */}
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del procedimiento"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {/* Descripción */}
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Descripción"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {/* Precio */}
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="Precio"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {/* Duración */}
            <input
              type="number"
              value={form.duracionMin}
              onChange={(e) => setForm({ ...form, duracionMin: e.target.value })}
              placeholder="Duración (minutos)"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {/* Categoría */}
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoria: e.target.value as CategoriaProcedimiento,
                })
              }
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3 bg-white"
            >
              <option value="Facial">Facial</option>
              <option value="Corporal">Corporal</option>
              <option value="Capilar">Capilar</option>
            </select>

            {/* Imagen principal */}
            <input
              type="text"
              value={form.imagen}
              onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              placeholder="URL de imagen principal"
              className="w-full p-2 border border-[#E5D8C8] rounded mb-3"
            />

            {form.imagen && (
              <img
                src={form.imagen}
                alt="Vista previa"
                className="w-40 rounded mb-3 border"
              />
            )}

            {/* Destacado */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-[#6E4F37] font-medium">Destacado:</label>
              <button
                onClick={() =>
                  setForm({ ...form, destacado: !form.destacado })
                }
                className={`px-3 py-1 rounded transition ${
                  form.destacado
                    ? "bg-[#8B6A4B] text-white"
                    : "bg-[#E5D8C8] text-[#6E4F37]"
                }`}
              >
                {form.destacado ? "Activo" : "Inactivo"}
              </button>
            </div>

            {/* Galería */}
            <div className="mb-3">
              <label className="text-sm text-[#6E4F37] font-medium">
                Galería de imágenes:
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.galeria.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Galería ${i}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleEliminarImagen(url)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Agregar URL de imagen"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAgregarImagen((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  className="flex-1 p-2 border border-[#E5D8C8] rounded"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
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

      {/* === LISTADO === */}
      {modo === "lista" && (
        <div>
          <button
            onClick={() => setModo("crear")}
            className="mb-4 bg-[#8B6A4B] text-white px-4 py-2 rounded hover:bg-[#6E4F37] transition"
          >
            + Agregar Procedimiento
          </button>

          {procedimientos.length === 0 ? (
            <p className="text-[#6E4F37]">No hay procedimientos registrados.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {procedimientos.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  className="p-4 bg-white border border-[#E5D8C8] rounded-lg shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[#6E4F37]">
                    {p.nombre}
                  </h3>
                  <p className="text-[#6E5A49] mb-2">{p.desc}</p>
                  <p className="text-sm text-[#8B6A4B] font-medium mb-2">
                    Precio: ${p.precio}
                  </p>
                  <p className="text-xs text-[#8B6A4B] mb-2">
                    {p.categoria} · {p.duracionMin ? `${p.duracionMin} min` : ""}
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
                      className="px-3 py-1 rounded bg-[#E5D8C8] text-[#6E4F37] hover:bg-[#C7A27A] transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="px-3 py-1 rounded bg-red-200 text-red-700 hover:bg-red-300 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
