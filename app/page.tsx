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
      {/* ===== HERO ===== */}
<section className="hero">
  {/* Lado izquierdo: carrusel de imágenes */}
  <div className="hero-left">
    {imagenes.map((img, index) => (
      <Image
        key={index}
        src={img}
        alt={`Imagen ${index + 1}`}
        fill
        priority={index === 0}
        className={`hero-slide ${index === imagenActual ? "is-active" : ""}`}
      />
    ))}
  </div>

  {/* Lado derecho: texto + CTA */}
  <div className="hero-right">
    <div className="hero-content container">
      <h1 className="hero-title">
        ¡La innovadora y exclusiva tecnología de Hydrafacial está en el
        consultorio de la Dra. Vanessa Medina!
      </h1>

      {/* Texto escritorio */}
      <p className="hero-desc-long">
        <strong>¿Qué es HydraFacial?</strong> Es una tecnología estética de
        última generación que combina limpieza profunda, exfoliación, extracción
        de impurezas e hidratación avanzada en un solo procedimiento. Su sistema
        patentado utiliza un aplicador con succión controlada y sueros
        enriquecidos que renuevan la piel desde la primera sesión, sin
        necesidad de tiempo de recuperación.
        <br /><br />
        <strong>¿Para qué sirve?</strong> Revitaliza la piel, trata poros
        dilatados, líneas de expresión, manchas y deshidratación, devolviendo
        su luminosidad natural.
        <br /><br />
        <strong>Un tratamiento exclusivo en el Tolima.</strong> El consultorio
        de la Dra. Vanessa Medina es el único en la región con tecnología
        original HydraFacial®, certificada internacionalmente.
      </p>

      {/* Texto móvil */}
      <p className="hero-desc-short">
        <strong>HydraFacial:</strong> tecnología que limpia, exfolia e hidrata
        profundamente la piel con resultados visibles desde la primera sesión.
      </p>

      <div className="hero-cta">
        <Link href="/agendar" className="btn btn-accent">
          <i className="fas fa-calendar-check me-2"></i> Agendar Cita
        </Link>
        <a
          href="https://www.instagram.com/hydrafacialcolombia/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-accent"
        >
          <i className="fab fa-instagram me-2"></i> Conocer más de HydraFacial
        </a>
      </div>

      {/* Botón leer más solo móvil */}
      <button
        className="hero-readmore d-lg-none"
        onClick={() =>
          document.querySelector(".hero-desc-short")?.classList.toggle("open")
        }
      >
        Leer más
      </button>
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
