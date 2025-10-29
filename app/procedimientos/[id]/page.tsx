"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaArrowLeft, FaPlay } from "react-icons/fa";
import { getProcedimientoById } from "../../utils/localDB";
import { formatPrecio } from "../../utils/format";

// =======================================================
// Formateador universal de precios y rangos
// Detecta todos los números y les aplica puntos de miles
// Ejemplo: "3000000 – 8000000" → "3.000.000 – 8.000.000"
// =======================================================
function formatPrecioUniversal(precio: string | number): string {
  // Si es numérico puro
  if (typeof precio === "number") {
    return precio.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  // Si es texto, busca todos los números
  return precio.replace(/\d{1,3}(?:\d{3})*(?:\.\d+)?/g, (match) => {
    const num = parseFloat(match.replace(/\./g, "").replace(/,/g, "."));
    if (isNaN(num)) return match;
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  });
}

// =======================================================
// 🩺 Página del procedimiento individual
// =======================================================
export default function ProcedimientoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const procedimiento = getProcedimientoById(id);

  // Si el procedimiento no existe
  if (!procedimiento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#4E3B2B]">
        <p className="text-2xl font-semibold mb-4">Procedimiento no encontrado</p>
        <button
          onClick={() => router.push("/procedimientos")}
          className="px-6 py-3 bg-[#B08968] text-white rounded-full hover:bg-[#9A7458] transition-all"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] py-10 px-6 sm:px-10 text-[#4E3B2B]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl overflow-hidden shadow-xl bg-white/90 backdrop-blur-md border border-[#E9DED2]"
        >
          {/* ===== Imagen principal ===== */}
          <div className="relative w-full h-[500px] overflow-hidden">
            <Image
              src={procedimiento.imagen}
              alt={procedimiento.nombre}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00000055] to-transparent" />
            <h1
              className="absolute bottom-6 left-6 text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {procedimiento.nombre}
            </h1>
          </div>

          {/* ===== Contenido principal ===== */}
          <div className="p-8">
            <p className="text-[#6C584C] leading-relaxed mb-6 text-[1.05rem]">
              {procedimiento.desc}
            </p>

            {/* ===== Precio con formato universal ===== */}
            <div className="mb-8">
              <p className="text-lg font-semibold text-[#B08968]">
                Precio estándar: {formatPrecioUniversal(procedimiento.precio)}
              </p>
              <small className="text-[#6C584C]/70">
                *El valor puede variar según valoración médica.*
              </small>
            </div>

            {/* ===== Galería multimedia (imágenes + videos) ===== */}
            {procedimiento.galeria && procedimiento.galeria.length > 0 && (
              <div className="mb-10">
                <h2
                  className="text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Galería multimedia
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {procedimiento.galeria.map((media, i) => (
                    <motion.div
                      key={media.id || i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="relative rounded-2xl overflow-hidden shadow-md bg-black/5"
                    >
                      {media.tipo === "imagen" ? (
                        <Image
                          src={media.url}
                          alt={`Imagen ${i + 1} de ${procedimiento.nombre}`}
                          width={400}
                          height={300}
                          className="object-cover w-full h-56 hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="aspect-video w-full">
                          <iframe
                            src={media.url}
                            title={`Video ${i + 1} de ${procedimiento.nombre}`}
                            allowFullScreen
                            className="w-full h-full border-0 rounded-2xl"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <FaPlay className="text-white text-4xl opacity-60" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Botones ===== */}
            <div className="flex flex-wrap gap-4 mt-8">
              {/* Agendar cita con procedimiento preseleccionado */}
              <Link
                href={`/agendar?proc=${encodeURIComponent(procedimiento.nombre)}`}
                className="flex items-center gap-2 bg-[#B08968] text-white px-6 py-3 rounded-full font-medium hover:bg-[#9A7458] transition-all shadow-sm hover:shadow-md no-underline"
              >
                <FaCalendarCheck /> Agendar cita
              </Link>

              {/* Volver */}
              <Link
                href="/procedimientos"
                className="flex items-center gap-2 border border-[#B08968] text-[#4E3B2B] px-6 py-3 rounded-full font-medium bg-[#FAF9F7] hover:bg-[#B08968] hover:text-white transition-all shadow-sm hover:shadow-md no-underline"
              >
                <FaArrowLeft /> Volver
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
