"use client";

import { useEffect, useState } from "react";
import { Cita, getCitaById, updateCita } from "../../utils/localDB"; 
import { PALETTE } from "../../agendar/page";

interface Props {
  id: number;
}

export default function CitasAgendadasEditor({ id }: Props) {
  const [cita, setCita] = useState<Cita | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const citaData = getCitaById(id);
    if (citaData) {
      setCita({ ...citaData });
    }
    setLoading(false);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!cita) return;
    const { name, value } = e.target;
    setCita({ ...cita, [name]: value });
  };

  const handleSave = () => {
    if (cita) {
      updateCita(cita.id, cita);
      alert("Cita actualizada correctamente");
    }
  };

  if (loading) return <div>Cargando cita...</div>;
  if (!cita) return <div>No se encontró la cita.</div>;

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 rounded-xl shadow-lg border border-[--border] bg-[--surface]">
      <h2
        className="text-2xl font-semibold mb-4 text-center"
        style={{ color: PALETTE.main }}
      >
        Editar Cita
      </h2>

      <form className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[--textSoft] mb-1">Procedimiento</label>
          <input
            name="procedimiento"
            value={cita.procedimiento}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--textSoft] mb-1">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={cita.fecha.slice(0, 10)}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--textSoft] mb-1">Hora</label>
          <input
            name="hora"
            value={cita.hora}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--textSoft] mb-1">Nota</label>
          <textarea
            name="nota"
            value={cita.nota || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-white"
          />
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[--main] text-white hover:bg-[--mainHover] transition"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
