"use client";

import React, { useState } from "react";
import { Procedimiento, addProcedimiento, updateProcedimiento } from "../../utils/localDB";

interface Props {
  procedimiento?: Procedimiento;
  onGuardar?: () => void;
}

export default function ProcedimientosForm({ procedimiento, onGuardar }: Props) {
  const [nombre, setNombre] = useState(procedimiento?.nombre || "");
  const [desc, setDesc] = useState(procedimiento?.desc || "");
  const [precio, setPrecio] = useState(procedimiento?.precio?.toString() || "");
  const [categoria, setCategoria] = useState(procedimiento?.categoria || "Facial");

  const handleSave = () => {
    if (!nombre.trim()) return alert("El nombre del procedimiento es obligatorio");

    if (procedimiento) {
      updateProcedimiento(procedimiento.id, { nombre, desc, precio, categoria });
      alert("Procedimiento actualizado correctamente ✅");
    } else {
      addProcedimiento({ nombre, desc, precio, imagen: "", categoria });
      alert("Procedimiento creado correctamente ✅");
    }

    if (onGuardar) onGuardar();
    setNombre("");
    setDesc("");
    setPrecio("");
  };

  return (
    <div className="p-6 bg-[--surface] rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-[--main]">
        {procedimiento ? "Editar Procedimiento" : "Crear Procedimiento"}
      </h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre del procedimiento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[--main]"
        />

        <textarea
          placeholder="Descripción"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[--main]"
        />

        <input
          type="number"
          placeholder="Precio (ej: 150000)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[--main]"
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Procedimiento["categoria"])}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[--main]"
        >
          <option value="Facial">Facial</option>
          <option value="Corporal">Corporal</option>
          <option value="Capilar">Capilar</option>
        </select>

        <button
          onClick={handleSave}
          className="mt-3 bg-[--main] hover:bg-[--mainHover] text-white font-medium py-2 px-4 rounded-md transition-all"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
