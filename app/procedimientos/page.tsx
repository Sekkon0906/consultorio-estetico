"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Collapse } from "react-collapse";
import { motion } from "framer-motion";
import { Fade } from "react-awesome-reveal";
import {
  FaChevronDown,
  FaChevronUp,
  FaCalendarCheck,
  FaEye,
} from "react-icons/fa";

import FondoAnimado from "./FondoAnimado";
import SiluetasAnimadas from "./SiluetasAnimadas";

interface Procedimiento {
  id: number;
  title: string;
  img: string;
  desc: string;
  precio: string;
}

export default function ProcedimientosPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const procedimientos: Record<string, Procedimiento[]> = {
    "Explora los procedimientos faciales": [
      {
        id: 1,
        title: "Limpieza Facial Básica",
        img: "/imagenes/procedimientos/P_LimpiezaBasica.jpg",
        desc: "Elimina impurezas superficiales y aporta frescura y vitalidad a la piel.",
        precio: "$180.000",
      },
      {
        id: 2,
        title: "Hydrafacial Elite",
        img: "/imagenes/procedimientos/P_Hydrafacial.jpg",
        desc: "Tecnología Vortex-Fusion que limpia, exfolia e hidrata profundamente.",
        precio: "$350.000 – $450.000",
      },
      {
        id: 3,
        title: "Peeling Químico",
        img: "/imagenes/procedimientos/P_PeelingQuimico.jpg",
        desc: "Renueva la piel, reduce manchas y mejora textura mediante exfoliación controlada.",
        precio: "$450.000",
      },
      {
        id: 4,
        title: "Ácido Hialurónico Facial",
        img: "/imagenes/procedimientos/P_AcidoHialuronico.jpg",
        desc: "Rellenos dérmicos para perfilar el rostro y restaurar volumen.",
        precio: "$1.100.000 – $1.500.000",
      },
      {
        id: 5,
        title: "Toxina Botulínica (Bótox)",
        img: "/imagenes/procedimientos/P_Botox.jpg",
        desc: "Suaviza arrugas de expresión y previene nuevas líneas.",
        precio: "$1.100.000 – $1.300.000",
      },
      {
        id: 6,
        title: "Plasma Rico en Plaquetas Facial",
        img: "/imagenes/procedimientos/P_PlasmaFacial.jpg",
        desc: "Regenera, hidrata y mejora la luminosidad de la piel.",
        precio: "$450.000 – $1.100.000",
      },
    ],
    "Explora los procedimientos corporales": [
      {
        id: 7,
        title: "Sueroterapia",
        img: "/imagenes/procedimientos/P_Sueroterapia.jpg",
        desc: "Vitaminas y antioxidantes intravenosos que revitalizan el organismo.",
        precio: "$250.000 – $800.000",
      },
      {
        id: 8,
        title: "Enzimas Lipolíticas",
        img: "/imagenes/procedimientos/P_EnzimasLipoliticas.jpg",
        desc: "Reduce grasa localizada y flacidez sin cirugía.",
        precio: "Según valoración médica",
      },
      {
        id: 9,
        title: "Tratamiento de Estrías",
        img: "/imagenes/procedimientos/P_TratamientoEstrias.jpg",
        desc: "Estimula colágeno y mejora textura y color en estrías.",
        precio: "$400.000 – $700.000",
      },
      {
        id: 10,
        title: "Hiperhidrosis Axilar / Palmar",
        img: "/imagenes/procedimientos/P_Hiperhidrosis.jpg",
        desc: "Reduce sudoración excesiva con aplicación de toxina botulínica.",
        precio: "$1.300.000 por zona",
      },
    ],
    "Explora los procedimientos capilares": [
      {
        id: 11,
        title: "Hydrafacial Capilar (Keravive)",
        img: "/imagenes/procedimientos/P_HydrafacialCapilar.jpg",
        desc: "Purifica y nutre el cuero cabelludo, estimulando el crecimiento.",
        precio: "$700.000 (por sesión)",
      },
      {
        id: 12,
        title: "Mesocapilar",
        img: "/imagenes/procedimientos/P_Mesocapilar.jpg",
        desc: "Inyección de vitaminas y nutrientes para fortalecer el folículo capilar.",
        precio: "$250.000 – $350.000",
      },
      {
        id: 13,
        title: "Plasma Rico en Plaquetas Capilar",
        img: "/imagenes/procedimientos/P_PlasmaCapilar.jpg",
        desc: "Bioestimulación capilar con factores de crecimiento.",
        precio: "$450.000 – $1.100.000",
      },
    ],
  };

  const fadeCard = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <main className="relative min-h-screen py-10 px-4 sm:px-8 overflow-hidden transition-colors duration-700">
      {/* === Fondos animados === */}
      <div className="absolute inset-0 -z-20">
        <FondoAnimado tipo={openSection} />
      </div>

      <div className="absolute inset-0 -z-10 opacity-80">
        <SiluetasAnimadas tipo={openSection} />
      </div>

      {/* === Contenido principal === */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "#4E3B2B", fontFamily: "'Playfair Display', serif" }}
          >
            Procedimientos Médicos y Estéticos
          </h1>
          <p
            className="text-[#6C584C] max-w-3xl mx-auto text-lg"
            style={{ lineHeight: 1.6 }}
          >
            Descubre tratamientos faciales, corporales y capilares realizados
            con técnicas seguras y personalizadas.
          </p>
        </div>

        {/* Acordeón principal */}
        {Object.entries(procedimientos).map(([titulo, items]) => (
          <motion.div
            key={titulo}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 rounded-3xl shadow-md overflow-hidden border border-[#E9DED2] bg-white/80 backdrop-blur-md"
          >
            {/* Cabecera */}
            <button
              onClick={() => toggleSection(titulo)}
              className="w-full flex justify-between items-center px-6 py-5 bg-[#B08968] text-white text-lg font-semibold hover:bg-[#9A7458] transition-colors"
            >
              <span>{titulo}</span>
              {openSection === titulo ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* Contenido desplegable */}
            <Collapse isOpened={openSection === titulo}>
              <Fade cascade damping={0.1} triggerOnce>
                <div className="p-6 bg-[#FAF9F7]/70 backdrop-blur-md transition-all duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((p, i) => (
                      <motion.div
                        key={p.id}
                        variants={fadeCard}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={i}
                        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-md border border-[#E9DED2] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        {/* Imagen ocupa 60% */}
                        <div className="relative overflow-hidden rounded-t-3xl">
                          <Image
                            src={p.img}
                            alt={p.title}
                            width={900}
                            height={900}
                            className="w-full h-[60%] min-h-[20rem] object-cover transition-transform duration-700 hover:scale-110"
                            style={{
                              objectPosition: "center",
                            }}
                          />
                        </div>

                        {/* Contenido */}
                        <div className="p-6 flex flex-col justify-between h-[40%]">
                          <div>
                            <h3
                              className="text-xl font-semibold mb-2"
                              style={{
                                color: "#4E3B2B",
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              {p.title}
                            </h3>
                            <p className="text-[#6C584C] mb-3 leading-relaxed text-[0.95rem]">
                              {p.desc}
                            </p>
                            <p className="text-[#B08968] font-semibold">
                              Precio estándar: {p.precio}
                            </p>
                            <small className="text-[#6C584C]/70 block mb-4">
                              *El valor puede variar según valoración médica.*
                            </small>
                          </div>

                          {/* Botones */}
                          <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-[#E9DED2] pb-6">
                            <Link
                              href="/agendar"
                              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-sm transition-all duration-300"
                              style={{
                                backgroundColor: "#B08968",
                                color: "#FAF9F7",
                                fontSize: "0.95rem",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#9A7458";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#B08968";
                              }}
                            >
                              <FaCalendarCheck className="text-base" />
                              Agendar cita
                            </Link>

                            <Link
                              href={`/procedimientos/${p.id}`}
                              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border font-medium shadow-sm transition-all duration-300"
                              style={{
                                borderColor: "#B08968",
                                color: "#6C584C",
                                fontSize: "0.95rem",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#B08968";
                                e.currentTarget.style.color = "#FAF9F7";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#6C584C";
                              }}
                            >
                              <FaEye className="text-base" />
                              Ver más
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Fade>
            </Collapse>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
