"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Galeria3D from "@/components/Galeria3D";
import Counter from "@/components/Counter";

export default function HomePage() {
  // Carrusel home
  const imagenes = [
    "/imagenes/carrucel_home1.jpg",
    "/imagenes/carrucel_home2.jpg",
    "/imagenes/carrucel_home3.jpg",
    "/imagenes/carrucel_home4.jpg",
    "/imagenes/carrucel_home5.jpg",
  ];

  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActual((prev) => (prev + 1) % imagenes.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  // Procedimientos varios
  const tratamientos = [
    {
      img: "/imagenes/P_Tratamiento_Acne.jpg",
      title: "Tratamiento contra el Acné",
      desc: "Reduce brotes, limpia poros y mejora la textura de la piel para un cutis más uniforme y saludable.",
      id: 1,
    },
    {
      img: "/imagenes/P_perfilamientoRostro.jpg",
      title: "Perfilamiento Facial",
      desc: "Resalta tus rasgos con técnicas de armonización facial, definiendo contornos de forma natural y precisa.",
      id: 2,
    },
    {
      img: "/imagenes/P_Tratamiento_Manchas.jpg",
      title: "Tratamiento Antimanchas",
      desc: "Aclara y unifica el tono de la piel, reduciendo hiperpigmentaciones y devolviendo luminosidad al rostro.",
      id: 3,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section
        className="d-flex align-items-stretch"
        style={{
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Mitad izquierda: carrusel */}
        <div
          className="hero-left position-relative"
          style={{
            flex: "1 1 50%",
            height: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {imagenes.map((img, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                inset: 0,
                opacity: index === imagenActual ? 1 : 0,
                transform: index === imagenActual ? "scale(1)" : "scale(1.05)",
                transition: "opacity 2s ease-in-out, transform 5s ease",
              }}
            >
              <Image
                src={img}
                alt={`Imagen ${index + 1}`}
                fill
                priority={index === 0}
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          ))}
        </div>

        {/* Mitad derecha */}
        <div
          className="hero-right d-flex flex-column justify-content-center"
          style={{
            flex: "1 1 50%",
            background: "linear-gradient(135deg, #FAF9F7 0%, #E9DED2 100%)",
            padding: "4rem",
            color: "#4E3B2B",
          }}
        >
          <div className="container">
            <h1
              className="fw-bold display-5 mb-4"
              style={{
                color: "#4E3B2B",
                fontFamily: "'Playfair Display', serif",
                lineHeight: "1.2",
              }}
            >
              ¡La innovadora y exclusiva tecnología de Hydrafacial, está en el
              consultorio de la Dra. Vanessa Medina!
            </h1>

            <p
              className="lead mb-4"
              style={{
                color: "#6C584C",
                fontSize: "1.1rem",
                lineHeight: "1.6",
              }}
            >
              “El bienestar verdadero nace del equilibrio: cuerpo fuerte, mente
              serena y emociones en armonía. La salud y la estética se
              construyen cultivando hábitos que nos mantienen jóvenes,
              energéticos y en paz.”
            </p>

            <Link
              href="/agendar"
              className="btn btn-lg fw-semibold d-inline-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#B08968",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "0.9rem 2.5rem",
                boxShadow: "0 4px 12px rgba(176, 137, 104, 0.25)",
                fontSize: "1.05rem",
                transition:
                  "all 0.35s ease, transform 0.2s ease, box-shadow 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#A1724F";
                e.currentTarget.style.transform = "scale(1.07)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(161, 114, 79, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#B08968";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(176, 137, 104, 0.25)";
              }}
            >
              <i className="fas fa-calendar-check me-2"></i> Agendar Cita
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE LA DRA */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(180deg, #F8F5F0 0%, #FFFFFF 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div
                className="card border-0 shadow-lg overflow-hidden"
                style={{ backgroundColor: "#FAF9F7" }}
              >
                <div className="row g-0 align-items-center">
                  {/* Imagen y contadores */}
                  <div
                    className="col-lg-4 p-4 text-center"
                    style={{ backgroundColor: "#FFFDF9" }}
                  >
                    <Image
                      src="/imagenes/hydroface.jpg"
                      alt="Dra. Juliet Medina"
                      width={320}
                      height={320}
                      className="img-fluid rounded-4 object-fit-cover shadow-sm"
                      style={{ aspectRatio: "1/1" }}
                    />
                    <div className="d-flex justify-content-center gap-5 mt-4">
                      <Counter end={3000} label="Pacientes" suffix="+" duration={2500} />
                      <Counter end={15} label="Procedimientos" suffix="+" duration={2000} />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="col-lg-8 p-4 p-lg-5 text-center text-lg-start">
                    <div
                      className="d-flex align-items-center mb-4 justify-content-center justify-content-lg-start flex-wrap"
                      style={{ gap: "12px" }}
                    >
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#E9DED2",
                          color: "#4E3B2B",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.75rem",
                        }}
                      >
                        Medicina Estética • Antienvejecimiento
                      </span>

                      <Link
                        href="/vanessa-medina"
                        className="fw-bold"
                        style={{
                          color: "#4E3B2B",
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "2rem",
                          textDecoration: "none",
                          transition: "color 0.3s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#A1724F")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#4E3B2B")}
                      >
                        Dra. Juliet Medina
                      </Link>
                    </div>

                    <p
                      className="text-muted mb-4"
                      style={{ color: "#6C584C", fontSize: "1rem" }}
                    >
                      Médica especialista en Medicina Estética con más de 5 años
                      de experiencia. Tratamientos personalizados con enfoque en
                      resultados naturales y bienestar integral.
                    </p>

                    <div className="mt-4 text-center text-lg-start">
                      <Link
                        href="/doctora"
                        className="fw-semibold"
                        style={{
                          display: "inline-block",
                          padding: "0.85rem 2.2rem",
                          borderRadius: "40px",
                          border: "2px solid #B08968",
                          color: "#4E3B2B",
                          fontSize: "1.05rem",
                          backgroundColor: "transparent",
                          transition: "all 0.35s ease",
                          textDecoration: "none",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#B08968";
                          e.currentTarget.style.color = "#FFF";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#4E3B2B";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        Conocer más sobre la doctora
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA 3D */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#FAF9F7",
          borderTop: "1px solid #E8E1D4",
          borderBottom: "1px solid #E8E1D4",
          
        }}
      >
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#4E3B2B" }}>
            Tratamientos más demandados
          </h2>
          <p className="lead" style={{ color: "#6C584C" }}>
            Explora de forma interactiva algunos de nuestros procedimientos más
            aclamados
          </p>
        </div>
        <Galeria3D />
      </section>

      {/* PROCEDIMIENTOS VARIOS */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(180deg, #FAF9F7 0%, #F1E9E0 100%)",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              className="fw-bold"
              style={{
                color: "#4E3B2B",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Procedimientos Varios
            </h2>
            <p
              className="lead"
              style={{
                color: "#6C584C",
                fontSize: "1.1rem",
              }}
            >
              Descubre nuestros tratamientos más solicitados y efectivos
            </p>
          </div>

          <div className="row g-4">
            {tratamientos.map((p, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div
                  className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden"
                  style={{
                    backgroundColor: "#FFFDF9",
                    transition: "all 0.35s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(176, 137, 104, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(176, 137, 104, 0.15)";
                  }}
                >
                  <Image
                    src={p.img}
                    alt={p.title}
                    width={600}
                    height={400}
                    className="card-img-top"
                    style={{
                      objectFit: "cover",
                      height: "250px",
                      borderBottom: "3px solid #E9DED2",
                    }}
                  />
                  <div className="card-body p-4">
                    <h5
                      className="fw-bold mb-2"
                      style={{
                        color: "#4E3B2B",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {p.title}
                    </h5>
                    <p
                      className="text-muted mb-3"
                      style={{
                        color: "#6C584C",
                        lineHeight: "1.6",
                      }}
                    >
                      {p.desc}
                    </p>
                    <Link
                      href={`/procedimientos/`}
                      className="fw-semibold text-decoration-none"
                      style={{
                        color: "#B08968",
                        transition: "color 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#8C6D4F")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#B08968")
                      }
                    >
                      Ver más{" "}
                      <i
                        className="fas fa-arrow-right ms-1"
                        style={{ color: "#B08968" }}
                      ></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
