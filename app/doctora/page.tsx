"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

export default function DoctoraPage() {
  // ===== HERO - Carrusel principal =====
  const imagenes = [
   "/imagenes/carrucel/carrucel_dr/carrucel_dr1.jpg",
    "/imagenes/carrucel/carrucel_dr/carrucel_dr2.jpg",
    "/imagenes/carrucel/carrucel_dr/carrucel_dr3.jpg",
    "/imagenes/carrucel/carrucel_dr/carrucel_dr4.jpg",
    "/imagenes/carrucel/carrucel_dr/carrucel_dr5.jpg",
  ];
  const [imagenActual, setImagenActual] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setImagenActual((p) => (p + 1) % imagenes.length), 5000);
    return () => clearInterval(int);
  }, []);

  // ===== FORMACIÓN CONTINUA =====
  const [activeIndex, setActiveIndex] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [parallax, setParallax] = useState(0);
  const seccionRef = useRef<HTMLDivElement | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [charlaSeleccionada, setCharlaSeleccionada] = useState<number | null>(null);
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const charlas = [
    {
      titulo: "Simposio Internacional de Medicina Estética 2024",
      descripcion:
        "Exploré innovaciones en rejuvenecimiento facial no invasivo y la importancia del equilibrio entre salud, técnica y naturalidad.",
      imagen: "/imagenes/charla1.jpg",
      galeria: ["/imagenes/charla1_1.jpg", "/imagenes/charla1_2.jpg", "/imagenes/charla1_3.jpg"],
      detalle:
        "Durante este simposio profundicé en técnicas avanzadas de bioestimulación con péptidos, hilos tensores de nueva generación y abordajes personalizados para cada biotipo cutáneo.",
    },
    {
      titulo: "Workshop de Hidratación Avanzada",
      descripcion:
        "Profundicé en nuevos protocolos de ácido hialurónico inteligente para mantener resultados naturales y duraderos.",
      imagen: "/imagenes/charla2.jpg",
      galeria: ["/imagenes/charla2_1.jpg", "/imagenes/charla2_2.jpg", "/imagenes/charla2_3.jpg"],
      detalle:
        "Analizamos combinaciones de técnicas de hidratación profunda, bioremodeladores y plasma rico en plaquetas para potenciar la luminosidad y firmeza de la piel.",
    },
    {
      titulo: "Congreso Latinoamericano de Medicina Regenerativa",
      descripcion:
        "Integré conceptos de terapias regenerativas, priorizando la salud integral como base de la estética facial moderna.",
      imagen: "/imagenes/charla3.jpg",
      galeria: ["/imagenes/charla3_1.jpg", "/imagenes/charla3_2.jpg", "/imagenes/charla3_3.jpg"],
      detalle:
        "Participé en ponencias sobre células madre y exosomas, entendiendo su papel en la medicina estética preventiva y regenerativa.",
    },
  ];

  // Scroll bloqueado dentro de la sección
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      const section = seccionRef.current;
      if (!section || cooldown || showModal) return;
      const rect = section.getBoundingClientRect();
      const visible = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
      if (visible) {
        e.preventDefault();
        setCooldown(true);
        setParallax((p) => p + (e.deltaY > 0 ? 1 : -1));
        setActiveIndex((prev) => (e.deltaY > 0 ? (prev + 1) % charlas.length : prev === 0 ? charlas.length - 1 : prev - 1));
        setTimeout(() => setCooldown(false), 1000);
      }
    };
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [cooldown, showModal]);

  // Bloquear scroll global con modal
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  // Carrusel dentro del modal (5s)
  useEffect(() => {
    if (!showModal || charlaSeleccionada === null) return;
    setProgress(0);
    const duracion = 5000;
    const step = 50;
    const inc = (step / duracion) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + inc >= 100) {
          setGaleriaIndex((prev) => (prev + 1) % charlas[charlaSeleccionada].galeria.length);
          return 0;
        }
        return p + inc;
      });
    }, step);
    return () => clearInterval(timer);
  }, [showModal, charlaSeleccionada]);

  const siguiente = () => {
    if (charlaSeleccionada === null) return;
    setGaleriaIndex((p) => (p + 1) % charlas[charlaSeleccionada].galeria.length);
    setProgress(0);
  };
  const anterior = () => {
    if (charlaSeleccionada === null) return;
    setGaleriaIndex((p) => (p === 0 ? charlas[charlaSeleccionada].galeria.length - 1 : p - 1));
    setProgress(0);
  };

  // =============================
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="d-flex flex-column flex-md-row align-items-stretch" style={{ height: "100vh", overflow: "hidden" }}>
        {/* IZQUIERDA */}
        <div style={{ flex: "1 1 50%", background: "linear-gradient(135deg,#FAF9F7 0%,#E9DED2 100%)", padding: "4rem" }}>
          <h1 className="fw-bold display-5 mb-4" style={{ color: "#4E3B2B", fontFamily: "'Playfair Display',serif" }}>
            ¿Quien es la doctora Julieth Vanessa Medina?
          </h1>
          <p className="lead mb-4" style={{ color: "#6C584C" }}>
  Julieth Vanessa Medina es una médica colombiana apasionada por el bienestar y la belleza natural. Desde mis primeros años trabajando
  en hospitales, descubrí que mi verdadera vocación estaba en la medicina estética, donde podía unir ciencia, arte y empatía para 
  resaltar la mejor versión de cada persona.
</p>

<p className="lead mb-4" style={{ color: "#6C584C" }}>
  Con el tiempo, decidí abrir mi propio consultorio, un espacio diseñado para ofrecer confianza, resultados naturales y 
  tratamientos con tecnología de última generación. Hoy, mi mayor satisfacción es ver cómo cada paciente se siente más seguro 
  y feliz al reflejar en su rostro la armonía que siempre ha tenido por dentro.
</p>

<p className="lead" style={{ color: "#6C584C" }}>
  “La autenticidad, sofisticación y elegancia son la nueva era de la Medicina estética. Invertir en ti debe tratarse de
  resaltar lo que te hace único/a generando una belleza real y sin excesos.” — <b>Julieth Medina</b>.
</p>
<div className="d-flex flex-wrap gap-3 mt-4">
    <Link
      href="/agendar"
      className="btn btn-lg fw-semibold d-inline-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#B08968",
        color: "white",
        border: "none",
        borderRadius: "50px",
        padding: "0.9rem 2.5rem",
        transition: "all 0.3s ease, transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#A1724F";
        e.currentTarget.style.transform = "scale(1.07)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "#B08968";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <i className="fas fa-calendar-check me-2" /> Agendar Cita
    </Link>

    <a
      href="https://www.instagram.com/dravanessamedinao28/"
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-lg fw-semibold d-inline-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#B08968",
        color: "white",
        border: "none",
        borderRadius: "50px",
        padding: "0.9rem 2.5rem",
        transition: "all 0.3s ease, transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#A1724F";
        e.currentTarget.style.transform = "scale(1.07)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "#B08968";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <i className="fab fa-instagram me-2" /> Conocer más sobre la doctora
    </a>
  </div>
</div>

        {/* DERECHA */}
        <div style={{ flex: "1 1 50%", position: "relative", overflow: "hidden" }}>
          {imagenes.map((img, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === imagenActual ? 1 : 0,
                transform: i === imagenActual ? "scale(1)" : "scale(1.05)",
                transition: "opacity 2s ease, transform 5s ease",
              }}
            >
              <Image src={img} alt={`Img${i}`} fill style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== INSPIRACIONES ===== */}
      <section style={{ background: "linear-gradient(180deg,#FAF9F7 0%,#F1E9E0 100%)", padding: "5rem 2rem" }}>
        <div className="container text-center">
          <h3 className="fw-bold mb-5" style={{ color: "#4E3B2B", fontFamily: "'Playfair Display',serif" }}>
            Inspiraciones y Creencias
          </h3>
          <div className="row justify-content-center align-items-center g-5">
            <div className="col-md-5">
              <motion.div initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                <Image
                  src="/imagenes/inspiracion_dr.jpg"
                  alt="Inspiración"
                  width={500}
                  height={500}
                  className="rounded-4 shadow-lg"
                />
              </motion.div>
            </div>
            <div className="col-md-6 text-start">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                <h4 className="fw-semibold mb-4" style={{ color: "#8C6D4F", fontFamily: "'Poppins',sans-serif" }}>
                  <TypeAnimation
                    sequence={[
                      "La medicina estética no solo transforma rostros, sino también la forma en que las personas se ven a sí mismas.",
                      4000,
                      "Cada tratamiento es una oportunidad para resaltar la esencia de quien somos.",
                      4000,
                      "Mi mayor inspiración es ver a mis pacientes sonreír con confianza y bienestar.",
                      4000,
                    ]}
                    wrapper="span"
                    speed={55}
                    repeat={Infinity}
                  />
                </h4>
                <p className="lead" style={{ color: "#4E3B2B", fontSize: "1.05rem", lineHeight: "1.7" }}>
                  Mi inspiración surge del equilibrio entre ciencia y arte. Creo que cada paciente tiene una historia y un propósito,
                  y mi trabajo consiste en resaltar su esencia sin perder su autenticidad. Me inspiran colegas como la doctora{" "}
                  <b>Diana Forero</b>, cuya pasión por la medicina estética resuena profundamente conmigo.
                </p>
                <motion.a
                  href="https://www.instagram.com/draforero/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="btn fw-semibold mt-4 px-4 py-2"
                  style={{
                    backgroundColor: "#B08968",
                    color: "white",
                    borderRadius: "50px",
                    textDecoration: "none",
                  }}
                >
                  Conoce más sobre la Dra. Forero
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
                  {/* ===== MISIÓN Y VISIÓN ===== */}
<section
  style={{
    background: "linear-gradient(180deg,#FAF9F7 0%,#F5EDE3 100%)",
    padding: "5rem 2rem",
  }}
>
  <div className="container text-center">
    <motion.h3
      className="fw-bold mb-5"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      style={{
        color: "#4E3B2B",
        fontFamily: "'Playfair Display', serif",
      }}
    >
      Misión y Visión
    </motion.h3>

    <div className="row justify-content-center g-4">
      {/* Misión */}
      <div className="col-12 col-md-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="p-4 rounded-4 shadow-sm h-100"
          style={{
            backgroundColor: "#FFFDF9",
            border: "1px solid #E9DED2",
          }}
        >
          <h4
            className="fw-bold mb-3"
            style={{
              color: "#8C6D4F",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nuestra Misión
          </h4>
          <p
            style={{
              color: "#4E3B2B",
              fontSize: "1.05rem",
              lineHeight: "1.7",
            }}
          >
            Brindar atención médica estética integral centrada en el bienestar,
            la armonía y la confianza del paciente, utilizando tecnología avanzada
            y un enfoque humano para lograr resultados naturales y duraderos.
          </p>
        </motion.div>
      </div>

      {/* Visión */}
      <div className="col-12 col-md-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="p-4 rounded-4 shadow-sm h-100"
          style={{
            backgroundColor: "#FFFDF9",
            border: "1px solid #E9DED2",
          }}
        >
          <h4
            className="fw-bold mb-3"
            style={{
              color: "#8C6D4F",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nuestra Visión
          </h4>
          <p
            style={{
              color: "#4E3B2B",
              fontSize: "1.05rem",
              lineHeight: "1.7",
            }}
          >
            Ser un referente nacional e internacional en medicina estética ética,
            innovadora y responsable, inspirando a más profesionales y pacientes
            a adoptar una visión saludable y consciente de la belleza.
          </p>
        </motion.div>
      </div>
    </div>
  </div>
</section>

      {/* ===== FILOSOFÍA ===== */}
      <section style={{ background: "linear-gradient(180deg,#F8F5F0 0%,#FAF9F7 100%)", padding: "5rem 2rem" }}>
        <div className="container text-center">
          <h3 className="fw-bold mb-5" style={{ color: "#4E3B2B", fontFamily: "'Playfair Display',serif" }}>
            Filosofía y Valores de la Práctica
          </h3>
          <div className="row justify-content-center g-4">
            {[
              { icon: "fa-heart", title: "Cuidado Personalizado", text: "Cada paciente es único. Ofrecemos planes adaptados a sus necesidades estéticas y emocionales." },
              { icon: "fa-hand-holding-medical", title: "Seguridad ante todo", text: "Procedimientos con protocolos médicos certificados y materiales aprobados." },
              { icon: "fa-leaf", title: "Naturalidad y Armonía", text: "Buscamos resaltar tu belleza natural sin perder autenticidad." },
              { icon: "fa-user-md", title: "Ciencia y Arte", text: "La medicina estética combina precisión médica con sensibilidad artística." },
            ].map((v, i) => (
              <div key={i} className="col-md-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-4 shadow-sm h-100"
                  style={{ background: "#fff", border: "1px solid #E9DED2" }}
                >
                  <div style={{ fontSize: "2rem", color: "#B08968" }}>
                    <i className={`fas ${v.icon}`} />
                  </div>
                  <h5 className="fw-bold mt-3 mb-2" style={{ color: "#4E3B2B" }}>
                    {v.title}
                  </h5>
                  <p className="text-muted" style={{ fontSize: ".95rem" }}>
                    {v.text}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORMACIÓN CONTINUA ===== */}
      <section
        ref={seccionRef}
        style={{
          background: `linear-gradient(180deg,#F1E9E0 ${50 + parallax * 2}%,#FAF9F7 100%)`,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 1s ease",
          position: "relative",
        }}
      >
        <div className="container text-center">
          <h3 className="fw-bold mb-5" style={{ color: "#4E3B2B", fontFamily: "'Playfair Display',serif" }}>
            Formación Continua
          </h3>

          <div style={{ position: "relative", height: "500px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.8 }}
                className="d-flex flex-column flex-md-row align-items-center justify-content-center"
                style={{ position: "absolute", inset: 0 }}
              >
                <Image src={charlas[activeIndex].imagen} alt={charlas[activeIndex].titulo} width={420} height={280} className="rounded-4 shadow-lg" />
                <div className="ms-md-4 text-md-start text-center">
                  <h4 style={{ color: "#8C6D4F" }}>{charlas[activeIndex].titulo}</h4>
                  <p>{charlas[activeIndex].descripcion}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setShowModal(true);
                      setCharlaSeleccionada(activeIndex);
                      setGaleriaIndex(0);
                    }}
                    className="btn mt-3 px-4 py-2 fw-semibold"
                    style={{ backgroundColor: "#B08968", color: "white", borderRadius: "50px", border: "none" }}
                  >
                    Quiero saber más
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* mensaje */}
          <p className="mt-4" style={{ color: "#6C584C", fontSize: "1rem" }}>
            Desplázate con la rueda del ratón sin prisa para conocer las experiencias formativas.
          </p>

          {/* puntos */}
          <div className="d-flex justify-content-center mt-3">
            {charlas.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: activeIndex === i ? 1.3 : 1,
                  opacity: activeIndex === i ? 1 : 0.4,
                  backgroundColor: activeIndex === i ? "#B08968" : "#D9C3B0",
                }}
                transition={{ duration: 0.4 }}
                style={{ width: "14px", height: "14px", borderRadius: "50%", margin: "0 6px", cursor: "pointer" }}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      <AnimatePresence>
        {showModal && charlaSeleccionada !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-4 p-4 shadow-lg"
              style={{
                backgroundColor: "#FFFDF9",
                color: "#4E3B2B",
                maxWidth: "800px",
                width: "90%",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="fw-bold mb-3" style={{ color: "#8C6D4F", fontFamily: "'Playfair Display'" }}>
                {charlas[charlaSeleccionada].titulo}
              </h4>
              <p>{charlas[charlaSeleccionada].detalle}</p>

              <div className="text-center my-3 position-relative">
                <Image
                  src={charlas[charlaSeleccionada].galeria[galeriaIndex]}
                  alt="Imagen charla"
                  width={600}
                  height={350}
                  className="rounded-4 shadow-sm"
                  style={{ objectFit: "cover", border: "2px solid #E9DED2" }}
                />

                {/* barra */}
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                  style={{ height: "6px", backgroundColor: "#B08968", borderRadius: "3px", position: "absolute", bottom: "-12px", left: 0 }}
                />

                {/* botones */}
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ position: "absolute", top: "50%", width: "100%", padding: "0 1rem", transform: "translateY(-50%)" }}
                >
                  <button onClick={anterior} className="btn btn-light shadow-sm" style={{ borderRadius: "50%", width: "40px", height: "40px" }}>
                    ‹
                  </button>
                  <button onClick={siguiente} className="btn btn-light shadow-sm" style={{ borderRadius: "50%", width: "40px", height: "40px" }}>
                    ›
                  </button>
                </div>
              </div>

              <button onClick={() => setShowModal(false)} className="btn fw-semibold mt-3" style={{ backgroundColor: "#B08968", color: "white", borderRadius: "50px" }}>
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
