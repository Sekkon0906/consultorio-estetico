"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import FondoAnim from "@/components/FondoAnim";
import ComentariosClientes from "@/components/ComentariosClientes";

// ✅ Tipos de dominio (BD real)
import type { Testimonio } from "../types/domain";
// ✅ Servicio que habla con el backend
import { getTestimoniosApi } from "../services/testimoniosApi";

export default function TestimoniosPage() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [videoActivo, setVideoActivo] = useState<number | null>(null);

  // === Cargar testimonios desde la API ===
  useEffect(() => {
    let isMounted = true;

    const cargarTestimonios = async () => {
      try {
        const data = await getTestimoniosApi();
        if (!isMounted) return;
        setTestimonios(data);
      } catch (err) {
        console.error("Error al cargar testimonios desde la API:", err);
      }
    };

    cargarTestimonios();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "5rem 2rem",
        backgroundColor: "#FAF7F2",
      }}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <FondoAnim />
      </div>

      <div className="relative z-10 container position-relative">
        {/* Viñeta decorativa superior */}
        <div
          className="mx-auto mb-5 p-4 text-center rounded-3 shadow-sm backdrop-blur-sm"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            maxWidth: "800px",
            border: "1px solid #E9DED2",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            className="fw-bold mb-3"
            style={{
              color: "#4E3B2B",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Testimonios de Nuestros Pacientes
          </h2>

          <p
            className="lead mb-0"
            style={{
              color: "#6C584C",
              lineHeight: "1.6",
            }}
          >
            Experiencias reales de pacientes que confiaron en la Dra. Vanessa
            Medina para transformar su bienestar y su confianza.
          </p>
        </div>

        {/* Tarjetas dinámicas */}
        {testimonios.length === 0 ? (
          <p className="text-center text-muted">
            No hay testimonios disponibles por el momento.
          </p>
        ) : (
          <div className="row g-4 justify-content-center">
            {testimonios
              .filter((t) => t.activo)
              .sort(
                (a, b) =>
                  new Date(b.creadoEn).getTime() -
                  new Date(a.creadoEn).getTime()
              )
              .map((t, index) => (
                <div
                  key={t.id}
                  className="col-md-6 col-lg-4"
                  style={{
                    animation: `fadeInUp 0.8s ease ${index * 0.1}s both`,
                  }}
                >
                  <div
                    className="rounded-4 shadow-sm overflow-hidden"
                    style={{
                      backgroundColor: "#FFFDF9",
                      border: "1px solid #E9DED2",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-6px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)"
                      )
                    }
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "177%",
                        overflow: "hidden",
                        backgroundColor: "#000",
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      {videoActivo === t.id ? (
                        <iframe
                          src={`${t.video}?autoplay=1&modestbranding=1&rel=0`}
                          title={`Testimonio de ${t.nombre}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "12px 12px 0 0",
                            animation: "fadeZoomIn 0.6s ease forwards",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                            animation: "fadeZoomIn 0.6s ease forwards",
                          }}
                          onClick={() => setVideoActivo(t.id)}
                        >
                          <Image
                            src={t.thumb}
                            alt={t.nombre}
                            fill
                            sizes="100vw"
                            style={{
                              objectFit: "cover",
                              borderRadius: "12px 12px 0 0",
                              filter: "brightness(0.9)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              backgroundColor: "rgba(0, 0, 0, 0.6)",
                              borderRadius: "50%",
                              width: "70px",
                              height: "70px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <i
                              className="fas fa-play"
                              style={{ color: "#FFF", fontSize: "1.5rem" }}
                            ></i>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 text-center">
                      <h5
                        className="fw-bold mb-2"
                        style={{
                          color: "#4E3B2B",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        {t.nombre}
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{
                          color: "#6C584C",
                          fontSize: "0.95rem",
                          lineHeight: "1.5",
                        }}
                      >
                        “{t.texto}”
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Comentarios de Google */}
        <div className="mt-5">
          <ComentariosClientes />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeZoomIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
