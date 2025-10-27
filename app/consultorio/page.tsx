"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  "/consultorio/recepcion.jpg",
  "/consultorio/sala1.jpg",
  "/consultorio/sala2.jpg",
  "/consultorio/equipos.jpg",
  "/consultorio/detalle.jpg",
];

export default function ConsultorioPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#2B2B2B] overflow-hidden">
      {/* HERO */}
      <section className="relative w-full h-[90vh]">
        <Image
          src="/consultorio/hero.jpg"
          alt="Consultorio principal"
          fill
          className="object-cover brightness-90"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white px-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-semibold mb-4"
          >
            Nuestro Consultorio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-lg md:text-xl max-w-3xl"
          >
            Un espacio diseñado para tu bienestar, donde la estética y la
            tecnología se encuentran para ofrecerte la mejor experiencia.
          </motion.p>
        </div>
      </section>

      {/* DESCRIPCIÓN */}
      <section className="max-w-6xl mx-auto py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-semibold text-[#B08968] mb-8"
        >
          Elegancia, confort y tecnología
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg leading-relaxed text-[#2B2B2B]/80 max-w-3xl mx-auto"
        >
          Nuestro consultorio está equipado con tecnología avanzada y un
          ambiente diseñado para la relajación y el bienestar. Cada detalle
          refleja nuestro compromiso con la excelencia, desde la iluminación
          cálida hasta la privacidad y el confort de cada sala.
        </motion.p>
      </section>

      {/* GALERÍA ANIMADA */}
      <section className="px-4 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {images.map((src, i) => (
            <motion.div
              key={i}
              className="relative overflow-hidden rounded-2xl shadow-lg group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <Image
                src={src}
                alt={`Foto ${i + 1} del consultorio`}
                width={600}
                height={400}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
