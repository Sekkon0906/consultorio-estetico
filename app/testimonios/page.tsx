"use client";

import React, { useState } from "react";
import Image from "next/image";
import FondoAnim from "@/components/FondoAnim";

export default function TestimoniosPage() {
  const testimonios = [
    {
      id: 1,
      thumb: "/imagenes/testimonio1.jpg",
      video: "https://www.youtube-nocookie.com/embed/2sooGeas5VU",
      nombre: "Laura G.",
      texto: "Gracias a la Dra. Vanessa, mi piel volvió a verse luminosa y saludable.",
    },
    {
      id: 2,
      thumb: "/imagenes/testimonio2.jpg",
      video: "https://www.youtube-nocookie.com/embed/CS9WgY4eomo",
      nombre: "Camila R.",
      texto: "El tratamiento fue cómodo, seguro y con resultados increíbles.",
    },
    {
      id: 3,
      thumb: "/imagenes/testimonio3.jpg",
      video: "https://www.youtube-nocookie.com/embed/wTAMYOhU5D4",
      nombre: "Carolina P.",
      texto: "Resultados naturales, atención cálida y profesionalismo en cada detalle.",
    },
    {
      id: 4,
      thumb: "/imagenes/testimonio4.jpg",
      video: "https://www.youtube-nocookie.com/embed/hKTEMGxCEBA",
      nombre: "Valentina S.",
      texto: "Después del tratamiento de acné, mi rostro cambió por completo.",
    },
    {
      id: 5,
      thumb: "/imagenes/testimonio5.jpg",
      video: "https://www.youtube-nocookie.com/embed/9kaV_avyPJo",
      nombre: "Andrés E.",
      texto: "La Dra. Vanessa combina ciencia y arte. ¡Los resultados hablan por sí solos!",
    },
  ];

  const [videoActivo, setVideoActivo] = useState<number | null>(null);

  return (
    <main
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "5rem 2rem",
      }}
    >
      <FondoAnim />

      <div className="container position-relative">
        <h2
          className="fw-bold text-center mb-4"
          style={{
            color: "#4E3B2B",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Testimonios de Nuestros Pacientes
        </h2>

        <p
          className="lead text-center mb-5"
          style={{ color: "#6C584C", maxWidth: "700px", margin: "0 auto" }}
        >
          Experiencias reales de pacientes que confiaron en la Dra. Vanessa
          Medina para transformar su bienestar y su confianza.
        </p>

        <div className="row g-4 justify-content-center">
          {testimonios.map((t, index) => (
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
                  (e.currentTarget.style.transform = "translateY(0)")
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
