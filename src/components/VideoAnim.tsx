"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function VideoAnim() {
  const [videoActivo, setVideoActivo] = useState(false);
  const [startCount, setStartCount] = useState(false);
  const countersRef = useRef<HTMLDivElement | null>(null);

  /** Detectar visibilidad de la sección */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartCount(true);
          observer.disconnect(); // Solo una vez
        }
      },
      { threshold: 0.3 }
    );

    if (countersRef.current) observer.observe(countersRef.current);
    return () => observer.disconnect();
  }, []);

  /** Componente contador animado */
  const Counter = ({
    value,
    label,
    emoji,
    suffix = "+",
    position = "left",
    duration = 1500, // duración de animación
  }: {
    value: number;
    label: string;
    emoji: string;
    suffix?: string;
    position?: "left" | "right";
    duration?: number;
  }) => {
    const [count, setCount] = useState(0);

    // Silenciamos la regla solo para este efecto
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (!startCount) return;
      let start: number | null = null;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setCount(Math.floor(progress * value));
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }, [startCount, value, duration]);

    return (
      <div
        className="shared-float d-flex flex-column align-items-center justify-content-center text-center gap-1"
        style={{ minHeight: "100px" }}
      >
        <div
          className={`d-flex align-items-center justify-content-center gap-3 ${
            position === "right" ? "flex-row-reverse" : ""
          }`}
        >
          <span
            className="emoji-shared"
            style={{ fontSize: "2rem", lineHeight: 1 }}
          >
            {emoji}
          </span>
          <div
            className="fw-bold"
            style={{
              fontSize: "2.4rem",
              color: "#4E3B2B",
            }}
          >
            {value === 4.9 ? count.toFixed(1) : count}
            {suffix}
          </div>
        </div>
        <small style={{ color: "#6C584C", fontWeight: 500 }}>{label}</small>
      </div>
    );
  };

  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(180deg, #FAF9F7 0%, #FFFFFF 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="halo-bg"></div>
      <div className="particles"></div>

      <div className="container-fluid text-center mb-5 fade-in">
        <h2
          className="fw-bold shimmer"
          style={{
            color: "#4E3B2B",
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.7rem",
          }}
        >
          ¿Por qué realizar consultas y procedimientos en este consultorio?
        </h2>
        <p
          style={{
            color: "#6C584C",
            fontSize: "1.15rem",
            marginTop: "0.5rem",
          }}
        >
          Calidad, experiencia y resultados que hablan por sí solos.
        </p>
      </div>

      <div className="container-fluid px-5">
        <div className="row align-items-stretch justify-content-between g-5">
          {/* IZQUIERDA */}
          <div className="col-lg-3 glass-col d-flex flex-column justify-content-center align-items-center text-center shared-float">
            <h3
              className="fw-bold mb-4 shimmer"
              style={{
                color: "#4E3B2B",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Cosas a tener en cuenta
            </h3>
            <ul
              className="list-unstyled d-flex flex-column justify-content-center align-items-center gap-4 w-100"
              style={{ fontSize: "1.15rem", color: "#6C584C" }}
            >
              {[
                { emoji: "💧", text: "Uso de tecnología Hydrafacial" },
                { emoji: "💎", text: "Productos de última generación" },
                { emoji: "🌸", text: "Procedimientos indoloros" },
                { emoji: "👩🏻‍⚕️", text: "Atención cálida y personalizada" },
              ].map((item, i) => (
                <li
                  key={i}
                  className="d-flex align-items-center justify-content-center gap-3 shared-float"
                  style={{
                    minHeight: "60px",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="emoji-shared"
                    style={{ fontSize: "2.3rem", lineHeight: 1 }}
                  >
                    {item.emoji}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* VIDEO CENTRAL */}
          <div className="col-lg-6 text-center fade-up d-flex align-items-center justify-content-center">
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "48%",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 14px 35px rgba(176,137,104,0.3)",
                cursor: "pointer",
                border: "5px solid #E9DED2",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => setVideoActivo(true)}
            >
              {videoActivo ? (
                <iframe
                  src="https://www.youtube.com/embed/pBkwUM0IpTE?autoplay=1&modestbranding=1&rel=0"
                  title="Por qué nosotros - Dra. Vanessa Medina"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "18px",
                    animation: "fadeZoomIn 0.6s ease forwards",
                  }}
                />
              ) : (
                <>
                  <Image
                    src="/imagenes/preview_video.jpg"
                    alt="Video portada"
                    fill
                    style={{
                      objectFit: "cover",
                      filter: "brightness(0.85)",
                      borderRadius: "18px",
                    }}
                  />
                  <div className="play-button">
                    <i className="fas fa-play"></i>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* DERECHA */}
          <div
            className="col-lg-3 glass-col d-flex flex-column justify-content-center align-items-center text-center shared-float"
            ref={countersRef}
          >
            <h3
              className="fw-bold mb-4 shimmer"
              style={{
                color: "#4E3B2B",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              La experiencia habla
            </h3>
            <div className="d-flex flex-column justify-content-center align-items-center gap-4 w-100">
              <Counter
                value={680}
                label="Pacientes satisfechos"
                emoji="✌🏻"
                suffix="+"
                position="right"
              />
              <Counter
                value={15}
                label="Tratamientos especializados"
                emoji="💉"
                suffix="+"
                position="right"
              />
              <Counter
                value={4}
                label="Años de experiencia"
                emoji="⏳"
                suffix="+"
                position="right"
              />
              <Counter
                value={4.8}
                label="Calificación promedio"
                emoji="⭐"
                suffix="/5"
                position="right"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sharedFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-4px);
          }
          50% {
            transform: translateY(-8px);
          }
          75% {
            transform: translateY(-4px);
          }
        }
        .shared-float {
          animation: sharedFloat 4.5s ease-in-out infinite;
        }

        @keyframes sharedGlow {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(255, 210, 160, 0);
          }
          50% {
            text-shadow: 0 0 14px rgba(255, 210, 160, 0.8);
          }
        }
        .emoji-shared {
          animation: sharedGlow 3.5s ease-in-out infinite;
        }

        .glass-col {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(8px);
          border-radius: 18px;
          padding: 2.5rem;
          box-shadow: 0 6px 18px rgba(176, 137, 104, 0.18);
          min-height: 100%;
        }

        .halo-bg {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 80%;
          background: radial-gradient(
            circle,
            rgba(255, 230, 210, 0.35) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          filter: blur(80px);
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(
            rgba(255, 230, 200, 0.4) 1px,
            transparent 1px
          );
          background-size: 80px 80px;
          animation: moveParticles 20s linear infinite;
          opacity: 0.35;
        }
        @keyframes moveParticles {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 100px 200px;
          }
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 2rem;
          transition: all 0.3s ease;
        }
        .play-button:hover {
          background: rgba(0, 0, 0, 0.75);
          transform: translate(-50%, -50%) scale(1.08);
        }
      `}</style>
    </section>
  );
}
