"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import TarjetaCita from "../../agendar/tarjetaCita";
import { getCitasByUser, Cita, User } from "../../utils/localDB";
import Link from "next/link";
import FondoAnim from "@/components/FondoAnim";

type FiltroTipo = "todas" | "valoracion" | "implementacion";
type FiltroAutor = "todas" | "usuario" | "doctora";

export default function CitasAgendadasPage() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todas");
  const [filtroAutor, setFiltroAutor] = useState<FiltroAutor>("todas");

  // ===== Cargar usuario y citas =====
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUsuario(parsed);
        const misCitas = getCitasByUser(parsed.id);
        setCitas(misCitas);
      } catch {
        console.warn("Error leyendo usuario de localStorage");
      }
    }
  }, []);

  // ===== Filtrar y ordenar =====
  const citasFiltradas = useMemo(() => {
    let filtradas = [...citas];

    if (filtroTipo !== "todas") {
      filtradas = filtradas.filter((c) => c.tipoCita === filtroTipo);
    }

    if (filtroAutor !== "todas") {
      filtradas = filtradas.filter((c) => c.creadaPor === filtroAutor);
    }

    filtradas.sort(
      (a, b) =>
        new Date(b.fechaCreacion).getTime() -
        new Date(a.fechaCreacion).getTime()
    );

    return filtradas;
  }, [citas, filtroTipo, filtroAutor]);

  // ======= Paleta =======
  const PALETTE = {
    bg: "#FAF9F7",
    text: "#4E3B2B",
    muted: "#6C584C",
    accent: "#B08968",
    border: "#E9DED2",
  };

  // ======= Si no hay usuario =======
  if (!usuario) {
    return (
      <main
        className="relative flex flex-col items-center justify-center min-h-screen text-center"
        style={{ backgroundColor: PALETTE.bg, color: PALETTE.text }}
      >
        <div className="absolute inset-0 -z-10">
          <FondoAnim />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-[#E9DED2] rounded-3xl shadow-lg p-10 max-w-md backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-3">
            Debes iniciar sesión para ver tus citas
          </h2>
          <p className="text-[#6C584C] mb-6">
            Una vez ingreses, podrás ver tus citas agendadas, realizar pagos o
            descargar comprobantes.
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-[#B08968] text-white rounded-full hover:bg-[#9A7458] transition-all"
          >
            Ir a iniciar sesión
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen py-10 px-6"
      style={{ backgroundColor: PALETTE.bg }}
    >
      {/* Fondo decorativo animado */}
      <div className="absolute inset-0 -z-10">
        <FondoAnim />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 10% 20%, #E6CCB255, transparent 50%)",
              "radial-gradient(circle at 80% 80%, #B0896855, transparent 50%)",
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl font-bold mb-3"
            style={{
              color: PALETTE.text,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Mis citas agendadas
          </h1>
          <p
            className="text-lg"
            style={{ color: PALETTE.muted, maxWidth: 600, margin: "0 auto" }}
          >
            Aquí puedes consultar tus citas, realizar pagos o revisar tu
            historial.
          </p>
        </motion.div>

        {/* Filtros */}
        {citas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm border border-[#E9DED2] rounded-3xl shadow-md p-5 mb-10 flex flex-wrap justify-between items-center gap-4"
          >
            <div className="flex flex-wrap items-center gap-3 text-[#4E3B2B]">
              <label className="font-semibold">Filtrar por tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) =>
                  setFiltroTipo(
                    e.target.value as FiltroTipo
                  )
                }
                className="border border-[#E9DED2] rounded-full px-4 py-1.5 bg-[#FAF9F7] text-[#4E3B2B] shadow-sm hover:shadow transition-all"
              >
                <option value="todas">Todas</option>
                <option value="valoracion">Valoración</option>
                <option value="implementacion">Implementación</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[#4E3B2B]">
              <label className="font-semibold">Creada por:</label>
              <select
                value={filtroAutor}
                onChange={(e) =>
                  setFiltroAutor(
                    e.target.value as FiltroAutor
                  )
                }
                className="border border-[#E9DED2] rounded-full px-4 py-1.5 bg-[#FAF9F7] text-[#4E3B2B] shadow-sm hover:shadow transition-all"
              >
                <option value="todas">Todas</option>
                <option value="usuario">Usuario</option>
                <option value="doctora">Doctora</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Contenido */}
        {citasFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/85 backdrop-blur-sm border border-[#E9DED2] rounded-3xl shadow-lg p-10 text-center text-[#6C584C]"
          >
            <p className="text-lg mb-5">
              {citas.length === 0
                ? "No tienes citas agendadas todavía."
                : "No hay citas que coincidan con los filtros seleccionados."}
            </p>
            <Link
              href="/agendar"
              className="inline-block px-6 py-3 bg-[#B08968] text-white rounded-full hover:bg-[#9A7458] transition-all"
            >
              Agendar una cita
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-8 sm:grid-cols-1 md:grid-cols-2"
          >
            {citasFiltradas.map((cita, i) => (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-3xl"
                    style={{
                      background:
                        "radial-gradient(circle at 40% 40%, #E9DED255, transparent 70%)",
                    }}
                    animate={{
                      opacity: [0.8, 0.4, 0.8],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <TarjetaCita cita={cita} modo="lista" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        select {
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
