"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaArrowLeft, FaPlay } from "react-icons/fa";

/* =========================================================
   1) Tipo y BD temporal EN EL MISMO ARCHIVO
   ========================================================= */
interface Procedimiento {
  id: number;
  categoria: "faciales" | "corporales" | "capilares";
  title: string;
  descripcionCorta: string;
  descripcionLarga: string;
  precio: string;
  imagenPrincipal: string;
  galeria?: string[];
  video?: string;
}

const procedimientos: Procedimiento[] = [
  {
    id: 1,
    categoria: "faciales",
    title: "Limpieza Facial Básica",
    descripcionCorta:
      "Elimina impurezas superficiales y aporta frescura y vitalidad a la piel.",
    descripcionLarga:
      "La limpieza facial básica incluye exfoliación, extracción suave y mascarilla hidratante. Ideal para mantener la piel saludable y libre de impurezas. Se recomienda realizar cada 3 o 4 semanas para una renovación constante de la piel.",
    precio: "$180.000",
    imagenPrincipal: "/imagenes/procedimientos/P_LimpiezaBasica.jpg",
    galeria: [
      "/imagenes/procedimientos/P_LimpiezaBasica_2.jpg",
      "/imagenes/procedimientos/P_LimpiezaBasica_3.jpg",
    ],
  },
  {
    id: 2,
    categoria: "faciales",
    title: "Hydrafacial Elite",
    descripcionCorta:
      "Tecnología Vortex-Fusion que limpia, exfolia e hidrata profundamente.",
    descripcionLarga:
      "Hydrafacial Elite es un procedimiento no invasivo que combina succión, exfoliación y sueros antioxidantes. Mejora la textura, la luminosidad y reduce el tamaño de los poros. Resultados visibles desde la primera sesión.",
    precio: "$350.000 – $450.000",
    imagenPrincipal: "/imagenes/procedimientos/P_Hydrafacial.jpg",
    galeria: [
      "/imagenes/procedimientos/P_Hydrafacial_2.jpg",
      "/imagenes/procedimientos/P_Hydrafacial_3.jpg",
    ],
    video: "https://www.youtube-nocookie.com/embed/2sooGeas5VU",
  },
  {
    id: 3,
    categoria: "faciales",
    title: "Peeling Químico",
    descripcionCorta:
      "Renueva la piel, reduce manchas y mejora textura mediante exfoliación controlada.",
    descripcionLarga:
      "El peeling químico estimula la regeneración celular y promueve la producción de colágeno. Ideal para tratar manchas, cicatrices leves, líneas de expresión y mejorar el tono general de la piel.",
    precio: "$450.000",
    imagenPrincipal: "/imagenes/procedimientos/P_PeelingQuimico.jpg",
  },
  {
    id: 4,
    categoria: "faciales",
    title: "Ácido Hialurónico Facial",
    descripcionCorta:
      "Rellenos dérmicos para perfilar el rostro y restaurar volumen.",
    descripcionLarga:
      "Los rellenos con ácido hialurónico permiten corregir surcos, perfilar pómulos o mentón y devolver volumen de forma natural. Producto biocompatible, seguro y reabsorbible.",
    precio: "$1.100.000 – $1.500.000",
    imagenPrincipal: "/imagenes/procedimientos/P_AcidoHialuronico.jpg",
  },
  {
    id: 5,
    categoria: "faciales",
    title: "Toxina Botulínica (Bótox)",
    descripcionCorta:
      "Suaviza arrugas de expresión y previene nuevas líneas.",
    descripcionLarga:
      "La aplicación de toxina botulínica permite relajar los músculos de expresión del rostro. Su efecto es temporal (4-6 meses) y proporciona una apariencia natural, sin rigidez.",
    precio: "$1.100.000 – $1.300.000",
    imagenPrincipal: "/imagenes/procedimientos/P_Botox.jpg",
  },
  {
    id: 6,
    categoria: "faciales",
    title: "Plasma Rico en Plaquetas Facial",
    descripcionCorta:
      "Regenera, hidrata y mejora la luminosidad de la piel.",
    descripcionLarga:
      "El PRP facial utiliza los factores de crecimiento del propio paciente para regenerar la piel. Mejora textura, firmeza y reduce líneas finas. Técnica biológica y segura.",
    precio: "$450.000 – $1.100.000",
    imagenPrincipal: "/imagenes/procedimientos/P_PlasmaFacial.jpg",
  },
  {
    id: 7,
    categoria: "corporales",
    title: "Sueroterapia",
    descripcionCorta:
      "Vitaminas y antioxidantes intravenosos que revitalizan el organismo.",
    descripcionLarga:
      "La sueroterapia administra cócteles de vitaminas, minerales y antioxidantes directamente al torrente sanguíneo. Mejora la energía, el sistema inmune y combate la fatiga crónica.",
    precio: "$250.000 – $800.000",
    imagenPrincipal: "/imagenes/procedimientos/P_Sueroterapia.jpg",
  },
  {
    id: 8,
    categoria: "corporales",
    title: "Enzimas Lipolíticas",
    descripcionCorta: "Reduce grasa localizada y flacidez sin cirugía.",
    descripcionLarga:
      "Las enzimas lipolíticas son un tratamiento médico que ayuda a eliminar grasa localizada y mejorar la firmeza de la piel. Se aplican mediante microinyecciones localizadas.",
    precio: "Según valoración médica",
    imagenPrincipal: "/imagenes/procedimientos/P_EnzimasLipoliticas.jpg",
  },
  {
    id: 9,
    categoria: "corporales",
    title: "Tratamiento de Estrías",
    descripcionCorta:
      "Estimula colágeno y mejora textura y color en estrías.",
    descripcionLarga:
      "Las estrías se tratan combinando técnicas regenerativas como PRP, radiofrecuencia y peelings. Mejora la apariencia, color y elasticidad de la piel afectada.",
    precio: "$400.000 – $700.000",
    imagenPrincipal: "/imagenes/procedimientos/P_TratamientoEstrias.jpg",
  },
  {
    id: 10,
    categoria: "corporales",
    title: "Hiperhidrosis Axilar / Palmar",
    descripcionCorta:
      "Reduce sudoración excesiva con aplicación de toxina botulínica.",
    descripcionLarga:
      "El tratamiento de hiperhidrosis con toxina botulínica reduce la producción de sudor en axilas, palmas o plantas. Efecto duradero de 6 a 8 meses.",
    precio: "$1.300.000 por zona",
    imagenPrincipal: "/imagenes/procedimientos/P_Hiperhidrosis.jpg",
  },
  {
    id: 11,
    categoria: "capilares",
    title: "Hydrafacial Capilar (Keravive)",
    descripcionCorta:
      "Purifica y nutre el cuero cabelludo, estimulando el crecimiento.",
    descripcionLarga:
      "El tratamiento Keravive limpia y estimula el cuero cabelludo, eliminando impurezas y mejorando la oxigenación del folículo. Ideal para fortalecer el cabello y reducir la caída.",
    precio: "$700.000 (por sesión)",
    imagenPrincipal: "/imagenes/procedimientos/P_HydrafacialCapilar.jpg",
  },
  {
    id: 12,
    categoria: "capilares",
    title: "Mesocapilar",
    descripcionCorta:
      "Inyección de vitaminas y nutrientes para fortalecer el folículo capilar.",
    descripcionLarga:
      "El tratamiento mesocapilar mejora la nutrición de los folículos, estimulando el crecimiento del cabello mediante microinyecciones de vitaminas, minerales y aminoácidos.",
    precio: "$250.000 – $350.000",
    imagenPrincipal: "/imagenes/procedimientos/P_Mesocapilar.jpg",
  },
  {
    id: 13,
    categoria: "capilares",
    title: "Plasma Rico en Plaquetas Capilar",
    descripcionCorta:
      "Bioestimulación capilar con factores de crecimiento.",
    descripcionLarga:
      "El PRP capilar estimula los folículos inactivos mediante la infiltración de plasma rico en plaquetas, promoviendo el crecimiento de nuevo cabello y mejorando su densidad.",
    precio: "$450.000 – $1.100.000",
    imagenPrincipal: "/imagenes/procedimientos/P_PlasmaCapilar.jpg",
  },
];

/* =========================================================
   2) Página de detalle
   ========================================================= */
export default function ProcedimientoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const procedimiento = procedimientos.find((p) => p.id === id);

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
          {/* Imagen principal */}
          <div className="relative w-full h-[500px] overflow-hidden">
            <Image
              src={procedimiento.imagenPrincipal}
              alt={procedimiento.title}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00000055] to-transparent" />
            <h1
              className="absolute bottom-6 left-6 text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {procedimiento.title}
            </h1>
          </div>

          {/* Contenido */}
          <div className="p-8">
            <p className="text-[#6C584C] leading-relaxed mb-6 text-[1.05rem]">
              {procedimiento.descripcionLarga}
            </p>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-lg font-semibold text-[#B08968]">
                Precio estándar: {procedimiento.precio}
              </p>
              <small className="text-[#6C584C]/70">
                *El valor puede variar según valoración médica.*
              </small>
            </div>

            {/* Galería */}
            {procedimiento.galeria && procedimiento.galeria.length > 0 && (
              <div className="mb-8">
                <h3
                  className="text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Galería
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {procedimiento.galeria.map((img, i) => (
                    <motion.div
                      key={img}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.08 }}
                      className="relative rounded-2xl overflow-hidden shadow-md"
                    >
                      <Image
                        src={img}
                        alt={`Imagen ${i + 1} de ${procedimiento.title}`}
                        width={400}
                        height={300}
                        className="object-cover w-full h-56 hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {procedimiento.video && (
              <div className="mb-8">
                <h3
                  className="text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Video informativo
                </h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md relative">
                  <iframe
                    src={procedimiento.video}
                    title={`Video ${procedimiento.title}`}
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FaPlay className="text-white text-5xl opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
<div className="flex flex-wrap gap-4 mt-8">
  <Link
    href="/agendar"
    className="flex items-center gap-2 bg-[#B08968] text-white px-6 py-3 rounded-full font-medium hover:bg-[#9A7458] transition-all shadow-sm hover:shadow-md no-underline"
    style={{ textDecoration: "none" }}
  >
    <FaCalendarCheck /> Agendar cita
  </Link>
  <Link
    href="/procedimientos"
    className="flex items-center gap-2 border border-[#B08968] text-[#4E3B2B] px-6 py-3 rounded-full font-medium bg-[#FAF9F7] hover:bg-[#B08968] hover:text-white transition-all shadow-sm hover:shadow-md no-underline"
    style={{ color: "#4E3B2B", textDecoration: "none" }}
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
