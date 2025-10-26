"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Galeria3D from "@/components/Galeria3D";
import dynamic from "next/dynamic";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const VideoAnim = dynamic(() => import("@/components/VideoAnim"), { ssr: false });

export default function HomePage() {
  const imagenes = [
    "/imagenes/carrucel/carrucel_home/carrucel_home1.jpg",
    "/imagenes/carrucel/carrucel_home/carrucel_home2.jpg",
    "/imagenes/carrucel/carrucel_home/carrucel_home3.jpg",
    "/imagenes/carrucel/carrucel_home/carrucel_home4.jpg",
    "/imagenes/carrucel/carrucel_home/carrucel_home5.jpg",
    "/imagenes/carrucel/carrucel_home/carrucel_home6.jpg",
  ];

  const [imagenActual, setImagenActual] = useState(0);
  const [mostrarTextoCompleto, setMostrarTextoCompleto] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActual((prev) => (prev + 1) % imagenes.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const ubicacionConsultorio = { lat: 4.438889, lng: -75.199722 };
  const memoizedVideo = useMemo(() => <VideoAnim />, []);

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
        {/* Carrusel izquierdo */}
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

        {/* Texto derecho */}
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
              ¡La innovadora y exclusiva tecnología de Hydrafacial está en el
              consultorio de la Dra. Vanessa Medina!
            </h1>

            {/* Texto visible en pantallas grandes */}
            <p
              className="lead mb-4 d-none d-lg-block"
              style={{
                color: "#6C584C",
                fontSize: "1.05rem",
                lineHeight: "1.7",
                textAlign: "justify",
              }}
            >
              <strong>Que es HydraFacial? Es innovación en cuidado facial.</strong> HydraFacial es una
              tecnología estética de última generación que combina limpieza profunda,
              exfoliación, extracción de impurezas e hidratación avanzada en un solo
              procedimiento. Su sistema patentado utiliza un aplicador con succión
              controlada y sueros enriquecidos que renuevan la piel desde la primera sesión,
              sin necesidad de tiempo de recuperación. Es un tratamiento médico-estético
              seguro, eficaz y con resultados visibles al instante.
              <br />
              <br />
              <strong>¿Para qué sirve?</strong> Este procedimiento está diseñado para revitalizar la piel y tratar múltiples necesidades al mismo tiempo: poros dilatados, textura irregular, líneas de expresión, manchas, acné y deshidratación. Gracias a su tecnología de vórtice, elimina células muertas e impurezas mientras infunde potentes antioxidantes, péptidos y ácido hialurónico, devolviendo al rostro su luminosidad natural.
              <br />
              <br />
              <strong>Un tratamiento exclusivo en el Tolima.</strong> El consultorio de la
              Dra. Vanessa Medina es el único en el Tolima que cuenta con la tecnología
              original HydraFacial®, certificada internacionalmente. Esta exclusividad
              garantiza que cada paciente experimente el auténtico procedimiento avalado
              por la marca, con equipos originales y protocolos clínicos de precisión.
              Disfrutar de un HydraFacial en Ibagué es ahora posible gracias a la Dra.
              Vanessa, quien ha traído a la región un servicio estético de estándar
              internacional que antes solo se encontraba en grandes capitales.
            </p>

            {/* Texto corto + Leer más (solo móvil) */}
            <p
              className="lead mb-4 d-lg-none"
              style={{
                color: "#6C584C",
                fontSize: "1.05rem",
                lineHeight: "1.7",
                textAlign: "justify",
                overflow: "hidden",
              }}
            >
              {!mostrarTextoCompleto ? (
                <>
                  <strong>HydraFacial:</strong> la tecnología que transforma el
                  cuidado facial, combinando limpieza, exfoliación e hidratación
                  profunda en un solo procedimiento. Resultados visibles desde la
                  primera sesión, con piel más luminosa y saludable.
                </>
              ) : (
                <>
                  <strong>HydraFacial: innovación en cuidado facial.</strong> HydraFacial
                  es una tecnología estética de última generación que combina limpieza
                  profunda, exfoliación, extracción de impurezas e hidratación avanzada
                  en un solo procedimiento. Su sistema patentado utiliza un aplicador
                  con succión controlada y sueros enriquecidos que renuevan la piel desde
                  la primera sesión, sin necesidad de tiempo de recuperación.
                  <br />
                  <br />
                  <strong>¿Para qué sirve?</strong> Revitaliza la piel, trata poros
                  dilatados, líneas finas, manchas y deshidratación, devolviendo su
                  luminosidad natural. <br />
                  <br />
                  <strong>Un tratamiento exclusivo en el Tolima.</strong> El consultorio
                  de la Dra. Vanessa Medina es el único en la región con tecnología
                  original HydraFacial®, certificada internacionalmente.
                </>
              )}
            </p>

            {/* Botón Leer más solo móvil */}
            <div className="mt-3 d-lg-none text-center">
              <button
                onClick={() => setMostrarTextoCompleto(!mostrarTextoCompleto)}
                className="btn btn-sm fw-semibold"
                style={{
                  backgroundColor: "transparent",
                  color: "#A1724F",
                  border: "none",
                  textDecoration: "underline",
                }}
              >
                {mostrarTextoCompleto ? "Mostrar menos" : "Leer más"}
              </button>
            </div>

            {/* BOTONES */}
            <div className="d-flex flex-wrap gap-3 mt-3">
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
                  transition: "all 0.35s ease, transform 0.2s ease",
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
                <i className="fas fa-calendar-check me-2"></i> Agendar Cita
              </Link>

              <a
                href="https://www.instagram.com/hydrafacialcolombia/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg fw-semibold d-inline-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#B08968",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "0.9rem 2.5rem",
                  boxShadow: "0 4px 12px rgba(176, 137, 104, 0.25)",
                  fontSize: "1.05rem",
                  transition: "all 0.35s ease, transform 0.2s ease",
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
                <i className="fab fa-instagram me-2"></i> Conocer más de HydraFacial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO CENTRAL */}
      {memoizedVideo}

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
          <h2
            className="fw-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#4E3B2B",
            }}
          >
            Tratamientos más demandados
          </h2>
          <p className="lead" style={{ color: "#6C584C" }}>
            Explora de forma interactiva algunos de nuestros procedimientos más
            aclamados
          </p>
        </div>
        <Galeria3D />
      </section>

      {/* UBICACIÓN */}
      <section
        className="py-5 text-center"
        style={{
          backgroundColor: "#E9DED2",
          color: "#4E3B2B",
        }}
      >
        <h2
          className="fw-bold mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Nuestra ubicación
        </h2>
        <p className="mb-4" style={{ color: "#6C584C" }}>
          Encuéntranos en el corazón de Ibagué, dentro de la Torre Empresarial.
        </p>

        <div
          style={{
            width: "90%",
            maxWidth: "900px",
            height: "450px",
            margin: "0 auto",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={ubicacionConsultorio}
              zoom={17}
            >
              <Marker position={ubicacionConsultorio} label="🏥" />
              <InfoWindow position={ubicacionConsultorio}>
                <div style={{ color: "#4E3B2B" }}>
                  <strong>Consultorio Dra. Vanessa Medina</strong>
                  <br />
                  Carrera 5ta #11-24, Torre Empresarial, Consultorio 502
                  <br />
                  Ibagué – Tolima
                </div>
              </InfoWindow>
            </GoogleMap>
          ) : (
            <p>Cargando mapa...</p>
          )}
        </div>

        <a
          href="https://www.google.com/maps?q=Carrera+5ta+%2311-24,+Torre+Empresarial,+Consultorio+502,+Ibagué,+Tolima"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-lg fw-semibold mt-4"
          style={{
            backgroundColor: "#B08968",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "0.8rem 2rem",
            boxShadow: "0 4px 12px rgba(176, 137, 104, 0.25)",
            transition: "all 0.3s ease",
          }}
        >
          <i className="fas fa-map-marker-alt me-2"></i> Ver en Google Maps
        </a>
      </section>
    </>
  );
}
