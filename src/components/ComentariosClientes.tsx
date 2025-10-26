"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

export default function ComentariosClientes() {
  const [comentarios, setComentarios] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error("Error de conexión con el servidor");
        const data = await res.json();

        // Validar estructura de la respuesta
        if (data?.result?.reviews?.length) {
          setComentarios(data.result.reviews);
        } else {
          console.warn("Sin reseñas o formato inesperado:", data);
          setError("No se pudieron cargar las reseñas de Google.");
        }
      } catch (err) {
        console.error("Error al obtener reseñas:", err);
        setError("No se pudieron conectar con el servicio de reseñas.");
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<FaStar key={i} color="#C0A080" />);
      else if (rating >= i - 0.5)
        stars.push(<FaStarHalfAlt key={i} color="#C0A080" />);
      else stars.push(<FaRegStar key={i} color="#C0A080" />);
    }
    return stars;
  };

  return (
    <section
      className="relative z-10 py-16 px-6 text-center transition-opacity duration-700 ease-in-out"
      style={{
        backgroundColor: "#FAF7F2",
        color: "#4E3B2B",
        borderTop: "1px solid #E9DED2",
        borderBottom: "1px solid #E9DED2",
      }}
    >
      <h2
        className="text-3xl font-semibold mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Comentarios de Anteriores Clientes
      </h2>

      <p className="text-sm italic text-[#6C584C] mb-8">
        Basado en opiniones verificadas en Google
      </p>

      {/* Estado de carga */}
      {loading && (
        <p className="text-[#6C584C] italic animate-pulse">
          Cargando reseñas...
        </p>
      )}

      {/* Estado de error o sin reseñas */}
      {!loading && error && (
        <div className="mt-4">
          <p className="text-[#6C584C] italic">{error}</p>
          <p className="text-[#8B7A6E] text-sm mt-2">
            Verifica tu conexión o inténtalo más tarde.
          </p>
        </div>
      )}

      {/* Reseñas reales */}
      {!loading && !error && comentarios.length > 0 && (
        <div className="flex gap-6 overflow-x-auto px-4 py-4 scrollbar-thin scrollbar-thumb-[#C0A080]/60 scrollbar-track-transparent">
          {comentarios.map((r, index) => (
            <div
              key={index}
              className="min-w-[280px] max-w-[320px] bg-[#FFFDF9] border border-[#E9DED2] rounded-xl shadow-sm flex flex-col items-center justify-between p-4 transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={r.profile_photo_url}
                alt={r.author_name}
                width={64}
                height={64}
                className="rounded-full mb-3"
                sizes="64px"
              />
              <h4 className="font-semibold text-[#4E3B2B] mb-1">
                {r.author_name}
              </h4>
              <div className="flex justify-center mb-2">
                {renderStars(r.rating)}
              </div>
              <p
                className="text-[#6C584C] text-sm italic mb-2"
                style={{ lineHeight: "1.4" }}
              >
                “{r.text.length > 120 ? r.text.slice(0, 120) + "..." : r.text}”
              </p>
              <span className="text-xs text-[#8B7A6E]">
                {r.relative_time_description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Si todo carga pero viene vacío */}
      {!loading && !error && comentarios.length === 0 && (
        <p className="text-[#6C584C] italic">
          No hay reseñas disponibles por el momento.
        </p>
      )}

      {/* Estilo del scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(192, 160, 128, 0.6);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </section>
  );
}
