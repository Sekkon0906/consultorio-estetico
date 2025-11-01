"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Secciones
// === SECCIONES ===
// === SECCIONES ===
import CitasAgendadas from "./citas/citasAgendadas";
import ProcedimientosList from "./procedimientos/procedimientosList";
import TestimoniosList from "./testimonios/testimoniosList";
import Ingresos from "./ingresos/ingresos";



export default function AdministrarPage() {
  const params = useSearchParams();
  const section = params.get("section") || "inicio";
  const [selected, setSelected] = useState(section);

  useEffect(() => {
    setSelected(section);
  }, [section]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
      >
        {selected === "inicio" && (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-[#8B6A4B] mb-4">
              Bienvenido al Panel Administrativo
            </h1>
            <p className="text-[#6E5A49]">
              Usa la barra lateral para administrar citas, procedimientos,
              testimonios e ingresos.
            </p>
          </div>
        )}
        {selected === "citas" && <CitasAgendadas />}
        {selected === "procedimientos" && <ProcedimientosList />}
        {selected === "testimonios" && <TestimoniosList />}
        {selected === "ingresos" && <Ingresos />}
      </motion.div>
    </AnimatePresence>
  );
}
