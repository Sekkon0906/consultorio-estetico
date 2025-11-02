"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCharlas } from "../utils/localDB";

export default function FormacionContinua() {
  const [charlas, setCharlas] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [charlaSeleccionada, setCharlaSeleccionada] = useState<number | null>(
    null
  );
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const seccionRef = useRef<HTMLDivElement | null>(null);

  // === Cargar charlas desde localDB ===
  useEffect(() => {
    setCharlas(getCharlas());
  }, []);

  // === Scroll control entre charlas ===
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (cooldown || showModal || charlas.length === 0) return;
      const section = seccionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const visible =
        rect.top <= window.innerHeight * 0.5 &&
        rect.bottom >= window.innerHeight * 0.5;

      if (visible) {
        e.preventDefault();
        setCooldown(true);
        setActiveIndex((prev) =>
          e.deltaY > 0
            ? (prev + 1) % charlas.length
            : prev === 0
            ? charlas.length - 1
            : prev - 1
        );
        setTimeout(() => setCooldown(false), 900);
      }
    };
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [cooldown, showModal, charlas]);

  // === Carrusel automático del modal ===
  useEffect(() => {
    if (!showModal || charlaSeleccionada === null) return;
    setProgress(0);
    const duracion = 5000;
    const step = 50;
    const inc = (step / duracion) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + inc >= 100) {
          setGaleriaIndex(
            (prev) =>
              (prev + 1) %
              (charlas[charlaSeleccionada]?.galeria?.length || 1)
          );
          return 0;
        }
        return p + inc;
      });
    }, step);
    return () => clearInterval(timer);
  }, [showModal, charlaSeleccionada, charlas]);

  const siguiente = () =>
    charlaSeleccionada !== null &&
    setGaleriaIndex(
      (p) =>
        (p + 1) %
        (charlas[charlaSeleccionada]?.galeria?.length || 1)
    );

  const anterior = () =>
    charlaSeleccionada !== null &&
    setGaleriaIndex((p) =>
      p === 0
        ? (charlas[charlaSeleccionada]?.galeria?.length || 1) - 1
        : p - 1
    );

  if (charlas.length === 0)
    return (
      <section className="flex items-center justify-center min-h-screen bg-[#FBF8F4]">
        <p className="text-[#4E3B2B] text-lg">
          Cargando formación continua...
        </p>
      </section>
    );

  const charla = charlas[activeIndex];
  const bordeLateral =
    activeIndex % 2 === 0
      ? "linear-gradient(180deg,#c7a27a 0%,#b08968 100%)"
      : "linear-gradient(180deg,#b08968 0%,#c7a27a 100%)";

  return (
    <>
      <section
        ref={seccionRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background: "linear-gradient(180deg,#F7EFE7 0%,#FBF8F4 100%)",
        }}
      >
        <h3
          className="text-3xl font-bold mb-8 text-center"
          style={{
            color: "#4E3B2B",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Formación Continua
        </h3>

        {/* ===== TARJETA VINETA ===== */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl rounded-3xl shadow-xl p-6 md:p-8 gap-8 relative overflow-hidden"
          style={{
            background:
              activeIndex % 2 === 0
                ? "linear-gradient(180deg,#FDF9F4 0%,#F1E9E0 100%)"
                : "linear-gradient(180deg,#F8F5F0 0%,#F3E9DF 100%)",
          }}
        >
          {/* Franja dorada decorativa */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: activeIndex % 2 === 0 ? 0 : "auto",
              right: activeIndex % 2 === 0 ? "auto" : 0,
              width: "10px",
              background: bordeLateral,
              borderTopLeftRadius: activeIndex % 2 === 0 ? "1.5rem" : "0",
              borderBottomLeftRadius: activeIndex % 2 === 0 ? "1.5rem" : "0",
              borderTopRightRadius: activeIndex % 2 === 0 ? "0" : "1.5rem",
              borderBottomRightRadius: activeIndex % 2 === 0 ? "0" : "1.5rem",
            }}
          />

          <div className="flex-shrink-0 rounded-3xl overflow-hidden shadow-md z-10">
            <Image
              src={charla.imagen}
              alt={charla.titulo}
              width={400}
              height={300}
              className="object-cover w-[350px] h-[280px]"
            />
          </div>

          <div className="text-center md:text-left z-10">
            <h4
              className="text-2xl font-semibold mb-2"
              style={{ color: "#7C5B3E" }}
            >
              {charla.titulo}
            </h4>
            <p
              className="text-[#9B7D5F] mb-4 leading-relaxed"
              style={{ fontSize: "1rem" }}
            >
              {charla.descripcion}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setShowModal(true);
                setCharlaSeleccionada(activeIndex);
                setGaleriaIndex(0);
              }}
              className="px-6 py-2 font-semibold text-white rounded-full shadow-md transition-all"
              style={{
                backgroundColor: "#B08968",
              }}
            >
              Saber más
            </motion.button>
          </div>
        </motion.div>

        <p
          className="mt-8 text-sm text-[#6E5A49] italic text-center"
          style={{ maxWidth: "600px" }}
        >
          Desplázate con la rueda del ratón sin prisa para conocer las
          experiencias formativas.
        </p>

        <div className="flex justify-center mt-4">
          {charlas.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: activeIndex === i ? 1.3 : 1,
                opacity: activeIndex === i ? 1 : 0.4,
                backgroundColor:
                  activeIndex === i ? "#B08968" : "#D9C3B0",
              }}
              transition={{ duration: 0.4 }}
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                margin: "0 6px",
                cursor: "pointer",
              }}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* ===== MODAL DETALLE ===== */}
      <AnimatePresence>
        {showModal && charlaSeleccionada !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/50 flex justify-center items-center z-[999]"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#FFFDF9] rounded-3xl shadow-2xl p-8 relative w-[90%] max-w-[820px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h4
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: "#8C6D4F",
                    fontFamily: "'Playfair Display'",
                  }}
                >
                  {charlas[charlaSeleccionada].titulo}
                </h4>
                <p className="text-[#6C584C] text-base leading-relaxed max-w-[700px] mx-auto">
                  {charlas[charlaSeleccionada].detalle ||
                    charlas[charlaSeleccionada].descripcion}
                </p>
              </div>

              {/* Imagen o video */}
              <div className="relative flex justify-center mb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={galeriaIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full flex justify-center"
                  >
                    {(() => {
                      const media =
                        charlas[charlaSeleccionada].galeria?.[galeriaIndex] ||
                        charlas[charlaSeleccionada].imagen;

                      if (media.includes("youtube")) {
                        const embed = media.replace("watch?v=", "embed/");
                        return (
                          <iframe
                            src={embed}
                            title="Video charla"
                            className="w-[90%] rounded-3xl shadow-md aspect-video"
                            allowFullScreen
                          />
                        );
                      } else if (media.endsWith(".mp4")) {
                        return (
                          <video
                            src={media}
                            controls
                            className="w-[90%] max-h-[380px] object-cover rounded-3xl border border-[#E8DAC7]"
                          />
                        );
                      } else {
                        return (
                          <Image
                            src={media}
                            alt="Imagen charla"
                            width={700}
                            height={400}
                            className="rounded-3xl shadow-lg object-cover border border-[#E9DED2]"
                            style={{
                              maxHeight: "380px",
                              width: "90%",
                            }}
                          />
                        );
                      }
                    })()}
                  </motion.div>
                </AnimatePresence>

                {/* Contador */}
                <div className="absolute top-3 right-5 bg-[#B08968]/90 text-white px-3 py-1 rounded-full text-sm shadow">
                  {galeriaIndex + 1} /{" "}
                  {charlas[charlaSeleccionada]?.galeria?.length || 1}
                </div>

                {/* Barra progreso */}
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                  className="absolute bottom-[-12px] left-[5%] h-[5px] rounded-full bg-[#B08968]"
                  style={{ width: `${progress}%`, maxWidth: "90%" }}
                />
              </div>

              {/* Navegación */}
              <div className="flex justify-between mt-3 mb-6 px-10">
                <button
                  onClick={anterior}
                  className="bg-[#EDE2D7] text-[#4E3B2B] rounded-full w-10 h-10 shadow-sm hover:bg-[#D8C4AA]"
                >
                  ‹
                </button>
                <button
                  onClick={siguiente}
                  className="bg-[#EDE2D7] text-[#4E3B2B] rounded-full w-10 h-10 shadow-sm hover:bg-[#D8C4AA]"
                >
                  ›
                </button>
              </div>

              {/* Cerrar */}
              <div className="text-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-white rounded-full font-semibold hover:opacity-90 transition"
                  style={{ backgroundColor: "#B08968" }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
