"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Galeria3D() {
  const tratamientos = [
    {
      img: "/imagenes/procedimientos/limpiezaFacial2.jpg",
      title: "Limpieza Facial",
      desc: "Un tratamiento esencial para renovar la piel, eliminar impurezas y estimular la oxigenación. Deja el rostro limpio, fresco y visiblemente más luminoso desde la primera sesión.",
      id: 1,
    },
    {
      img: "/imagenes/procedimientos/P_botox2.jpg",
      title: "Bótox",
      desc: "Reduce líneas de expresión y arrugas dinámicas con resultados naturales y armoniosos. Este procedimiento devuelve frescura al rostro sin alterar su expresividad.",
      id: 2,
    },
    {
      img: "/imagenes/procedimientos/P_Acido_hialuronico.jpg",
      title: "Ácido Hialurónico en Labios",
      desc: "Restaura volumen, define contornos y mejora la hidratación de los labios, logrando una apariencia más joven y equilibrada con un acabado natural y sofisticado.",
      id: 3,
    },
    {
      img: "/imagenes/procedimientos/P_toxinaBotulinica.jpg",
      title: "Toxina Botulínica",
      desc: "Un tratamiento versátil que suaviza arrugas y líneas de expresión, ofreciendo un aspecto rejuvenecido y descansado. Ideal para prevenir signos tempranos de envejecimiento.",
      id: 4,
    },
    {
      img: "/imagenes/procedimientos/P_Tratamiento_Acne.jpg",
      title: "Tratamiento Antiacné",
      desc: "Combina técnicas avanzadas para limpiar, exfoliar y equilibrar la piel. Reduce brotes, mejora la textura y previene cicatrices, devolviendo al rostro una apariencia uniforme y saludable.",
      id: 5,
    },
    {
      img: "/imagenes/procedimientos/P_perfilamientoRostro.jpg",
      title: "Perfilamiento Facial",
      desc: "Define y armoniza los rasgos del rostro mediante técnicas personalizadas de relleno y contorno. Resalta la estructura facial, logrando proporciones equilibradas y naturales.",
      id: 6,
    },
  ];

  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const radius = 360;
  const angle = 360 / tratamientos.length;

  // 🔁 Rotación continua (sin saltos)
  useEffect(() => {
    if (isPaused || selected !== null) return;
    let frame: number;
    const animate = () => {
      setRotation((prev) => prev + 0.06);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, selected]);

  // 🪞 Parallax (suave)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMouseTilt({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 🧪 PRNG determinista (evita hydration mismatch)
  function mulberry32(seed: number) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 🌠 Partículas (posiciones/tamaños/duración deterministas con una semilla fija)
  const particleCount = 16;
  const particles = useMemo(() => {
    const rng = mulberry32(123456); // cambia la semilla si quieres otro patrón estable
    return Array.from({ length: particleCount }, (_, i) => {
      const theta = (i / particleCount) * 2 * Math.PI;
      // tamaños y duraciones fijos por PRNG
      const size = 10 + rng() * 25;
      const dur = 3 + rng() * 3;
      const color =
        i % 2 === 0 ? "rgba(176, 137, 104, 0.25)" : "rgba(150, 120, 90, 0.15)";
      return { theta, size, dur, color };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez: SSR y cliente coinciden

  const getDepthStyles = (i: number) => {
    const relativeAngle = ((rotation / angle + i) % tratamientos.length) * angle;
    const normalized = Math.cos((relativeAngle * Math.PI) / 180);
    const scale = 1 + normalized * 0.25;
    const brightness = 0.7 + normalized * 0.3;
    const zIndex = Math.round(normalized * 100);
    return { scale, brightness, zIndex };
  };

  return (
    <div
      className="position-relative d-flex justify-content-center align-items-center"
      style={{
        perspective: "1600px",
        width: "100%",
        height: selected ? "700px" : "600px",
        overflow: "hidden",
        transition: "height 0.4s ease",
        background: "radial-gradient(circle at center, #fffaf6 15%, #f4ece4 90%)",
      }}
    >
      {/* 🌈 HALO GIRATORIO + PARALLAX */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "550px",
          height: "550px",
          transform: `translate(-50%, -50%) rotateX(${mouseTilt.y * 0.3}deg) rotateY(${mouseTilt.x * 0.3}deg)`,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, rgba(255,200,150,0.25), rgba(255,150,200,0.15), rgba(255,240,200,0.25), rgba(255,200,150,0.25))",
          filter: "blur(40px)",
          animation: "haloSpin 25s linear infinite, hueShift 15s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* 🌠 PARTÍCULAS (sin random en render) */}
      <div
        style={{
          position: "absolute",
          width: "120%",
          height: "120%",
          top: "-10%",
          left: "-10%",
          zIndex: 0,
          transform: `rotate(${-(rotation * 0.5)}deg)`,
          transition: "transform 0.2s linear",
        }}
      >
        {particles.map((p, i) => {
          const x = 50 + 40 * Math.cos(p.theta);
          const y = 50 + 40 * Math.sin(p.theta);
          return (
            <div
              key={i}
              className="particle"
              style={{
                position: "absolute",
                top: `${y}%`,
                left: `${x}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                borderRadius: "50%",
                filter: "blur(2px)",
                animation: `pulse ${p.dur}s ease-in-out infinite`,
              }}
            />
          );
        })}
      </div>

      {/* BOTONES DE CONTROL – alejados del anillo */}
      {selected === null && (
        <>
          <button
            onClick={() => setRotation((prev) => prev - angle)}
            style={{
              position: "absolute",
              left: "calc(50% - 520px)", // más afuera aún
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid #D3C3B2",
              borderRadius: "50%",
              width: "45px",
              height: "45px",
              fontSize: "1.5rem",
              color: "#6C584C",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
            aria-label="Girar a la izquierda"
          >
            ‹
          </button>

          <button
            onClick={() => setRotation((prev) => prev + angle)}
            style={{
              position: "absolute",
              right: "calc(50% - 520px)", // simétrico
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid #D3C3B2",
              borderRadius: "50%",
              width: "45px",
              height: "45px",
              fontSize: "1.5rem",
              color: "#6C584C",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
            aria-label="Girar a la derecha"
          >
            ›
          </button>
        </>
      )}

      {/* RUEDA DE TRATAMIENTOS */}
      {selected === null && (
        <div
          style={{
            position: "relative",
            width: "280px",
            height: "230px",
            transformStyle: "preserve-3d",
            transform: `rotateX(${3 + mouseTilt.y * 0.2}deg) rotateY(${rotation + mouseTilt.x * 0.3}deg)`,
            transition: "transform 0.3s ease-out",
            zIndex: 2,
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {tratamientos.map((t, i) => {
            const { scale, brightness, zIndex } = getDepthStyles(i);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px) scale(${scale})`,
                  backfaceVisibility: "hidden",
                  textAlign: "center",
                  zIndex,
                  filter: `brightness(${brightness})`,
                }}
              >
                <div
                  className="card3d"
                  onClick={() => setSelected(t.id)}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "85%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "#FFFDF9",
                    boxShadow: "0 8px 25px rgba(176, 137, 104, 0.25)",
                    border: "1px solid #E9DED2",
                    cursor: "pointer",
                  }}
                >
                  <Image src={t.img} alt={t.title} fill style={{ objectFit: "cover" }} />

                  {/* 🔹 Viñeta con nombre + fade-in on hover */}
                  <div className="badgeTitle">
                    <p className="badgeText">{t.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PANEL DE DETALLE (se mantiene por si lo usas más adelante) */}
      {selected !== null && (
        <div
          className="shadow-lg rounded-4 p-5 position-relative"
          style={{
            backgroundColor: "#FAF9F7",
            width: "80%",
            maxWidth: "1000px",
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #E9DED2",
            boxShadow: "0 10px 40px rgba(176, 137, 104, 0.3)",
            transition: "all 0.4s ease",
            paddingTop: "4rem",
            zIndex: 3,
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: "absolute",
              top: "20px",
              left: "30px",
              background: "none",
              border: "none",
              color: "#4E3B2B",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "0.5px",
              transition: "color 0.3s ease",
            }}
          >
            ← Volver
          </button>

          <div
            style={{
              flex: "0 0 45%",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 5px 20px rgba(176, 137, 104, 0.25)",
              marginTop: "10px",
            }}
          >
            <Image
              src={tratamientos.find((t) => t.id === selected)?.img || ""}
              alt="Detalle"
              width={500}
              height={400}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>

          <div style={{ flex: "0 0 45%", color: "#4E3B2B" }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              {tratamientos.find((t) => t.id === selected)?.title}
            </h3>
            <p
              style={{
                color: "#6C584C",
                lineHeight: "1.6",
                fontSize: "1.05rem",
                marginBottom: "2rem",
              }}
            >
              {tratamientos.find((t) => t.id === selected)?.desc}
            </p>

            <Link
              href="/procedimientos"
              className="btn btn-lg fw-semibold"
              style={{
                backgroundColor: "#B08968",
                color: "#FFF",
                borderRadius: "30px",
                padding: "0.75rem 2rem",
                textDecoration: "none",
                transition: "background 0.3s ease",
              }}
            >
              Investigar más
            </Link>
          </div>
        </div>
      )}

      {/* 🎨 Estilos globales para animaciones y viñetas */}
      <style jsx global>{`
        /* Partículas */
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }

        /* Halo */
        @keyframes haloSpin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes hueShift {
          0% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(45deg);
          }
          100% {
            filter: hue-rotate(0deg);
          }
        }

        /* Viñeta con fade-in al hover */
        .card3d .badgeTitle {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.82);
          border-top: 1px solid rgba(200, 180, 160, 0.4);
          backdrop-filter: blur(6px);
          opacity: 0.0;
          transform: translateY(8px);
          transition: opacity 240ms ease, transform 240ms ease;
          padding: 0.5rem 0.75rem;
        }
        .card3d:hover .badgeTitle {
          opacity: 1;
          transform: translateY(0);
        }
        .badgeText {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #4e3b2b;
          font-family: "Playfair Display", serif;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        /* Accesibilidad hover en touch (cuando no hay hover real, mantenemos visible) */
        @media (hover: none) {
          .card3d .badgeTitle {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
