"use client";

import { useState } from "react";
import { addTestimonio, updateTestimonio, Testimonio } from "../../utils/localDB";

interface Props {
  testimonio?: Testimonio;
  onGuardar?: () => void;
}

export default function TestimoniosForm({ testimonio, onGuardar }: Props) {
  const [nombre, setNombre] = useState(testimonio?.nombre || "");
  const [texto, setTexto] = useState(testimonio?.texto || "");
  const [video, setVideo] = useState(testimonio?.video || "");

  const handleSave = () => {
    if (!nombre.trim() || !texto.trim()) {
      alert("Por favor, completa el nombre y el texto del testimonio.");
      return;
    }

    if (testimonio) {
      // Editar existente
      updateTestimonio(testimonio.id, { nombre, texto, video });
      alert("✅ Testimonio actualizado correctamente");
    } else {
      // Crear nuevo
      addTestimonio({
        nombre,
        texto,
        video,
        activo: true,
        thumb: "",
        destacado: false,
      });
      alert("✅ Testimonio creado correctamente");
    }

    setNombre("");
    setTexto("");
    setVideo("");
    onGuardar?.();
  };

  return (
    <div className="p-6 bg-[--surface] rounded-xl shadow-md border border-[--border]">
      <h2 className="text-lg font-semibold mb-4 text-[--main] text-center">
        {testimonio ? "Editar Testimonio" : "Crear Testimonio"}
      </h2>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full mb-3 p-2 border rounded-md border-[--border] focus:outline-none focus:ring-2 focus:ring-[--main]"
      />

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Texto del testimonio"
        className="w-full mb-3 p-2 border rounded-md border-[--border] focus:outline-none focus:ring-2 focus:ring-[--main] min-h-[100px]"
      />

      <input
        type="text"
        value={video}
        onChange={(e) => setVideo(e.target.value)}
        placeholder="URL del video (opcional)"
        className="w-full mb-4 p-2 border rounded-md border-[--border] focus:outline-none focus:ring-2 focus:ring-[--main]"
      />

      <button
        onClick={handleSave}
        className="w-full py-2 rounded-md bg-[--main] text-white font-semibold hover:bg-[--mainHover] transition-all"
      >
        Guardar
      </button>
    </div>
  );
}
