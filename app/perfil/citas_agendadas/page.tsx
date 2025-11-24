"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import TarjetaCita from "../../agendar/tarjetaCita";
import Link from "next/link";
import FondoAnim from "@/components/FondoAnim";

// ===== Tipos =====
type FiltroTipo = "todas" | "valoracion" | "implementacion";
type FiltroAutor = "todas" | "usuario" | "doctora";

interface Cita {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  procedimiento: string;
  fecha: string;
  hora: string;
  estado: string;
  metodoPago: string;
  tipoCita: string;
  creadaPor: string;
  fechaCreacion: string;
}

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  rol: string;
}

// ===== API =====
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function CitasAgendadasPage() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todas");
  const [filtroAutor, setFiltroAutor] = useState<FiltroAutor>("todas");

  // ===== Cargar usuario desde localStorage =====
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUsuario(parsed);
      } catch {
        console.warn("Error leyendo usuario de localStorage");
        setUsuario(null);
      }
    }
  }, []);

  // ===== Cargar citas desde la BD =====
  useEffect(() => {
    if (!usuario) return;

    const fetchCitas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/citas/usuario/${usuario.id}`);
        const data = await res.json();

        if (data?.ok && Array.isArray(data.citas)) {
          setCitas(data.citas);
        } else {
          setCitas([]);
        }
      } catch (err) {
        console.error("Error cargando citas:", err);
        setCitas([]);
      }
      setLoading(false);
    };

    fetchCitas();
  }, [usuario]);

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
          className="bg-white border border-[#E9DED2] rounded-3xl shadow-lg p-10 max-w-md"
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

  // ======= UI principal =======
  return (
    <main className="relative min-h-screen py-10 px-6" style={{ backgroundColor: PALETTE.bg }}>
      {/* Fondo */}
      <div className="absolute inset-0 -z-10">
        <FondoAnim />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
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
        </motion.div>

        {/* Mostrar loading */}
        {loading ? (
          <p className="text-center text-[#6C584C]">Cargando citas...</p>
        ) : citasFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-[#E9DED2] rounded-3xl shadow-lg p-10 text-center"
          >
            <p className="text-lg mb-5">
              {citas.length === 0
                ? "No tienes citas agendadas todavía."
                : "No hay citas con esos filtros."}
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
            className="grid gap-8 md:grid-cols-2"
          >
            {citasFiltradas.map((cita, i) => (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <TarjetaCita cita={cita} modo="lista" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
