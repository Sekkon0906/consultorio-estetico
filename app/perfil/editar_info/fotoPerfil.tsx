import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PALETTE } from "./palette";

interface Props {
  photo?: string;
  email?: string;
  canEdit: boolean;
  setPhoto: (value: string | undefined) => void;
}

export default function FotoPerfil({ photo, email, canEdit, setPhoto }: Props) {
  const [finalPhoto, setFinalPhoto] = useState<string | undefined>(photo);

  // Cargar la foto desde localStorage si existe
  useEffect(() => {
    const savedPhoto = email ? localStorage.getItem(`photo_${email}`) : null;
    if (savedPhoto) {
      setFinalPhoto(savedPhoto); // Usar la foto guardada en localStorage
    } else {
      setFinalPhoto(photo || "/default-avatar.png"); // Usar la foto predeterminada si no hay foto personalizada
    }
  }, [email, photo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFinalPhoto(base64); // Actualiza la foto en el estado
      if (email) localStorage.setItem(`photo_${email}`, base64); // Guarda la foto en localStorage
      setPhoto(base64); // Llama a la función setPhoto proporcionada para actualizar el estado global si es necesario
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      className="text-center mb-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="mx-auto mb-3"
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          overflow: "hidden",
          border: `4px solid ${PALETTE.main}`,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          backgroundColor: "#f8f9fa",
        }}
      >
        <img
          src={finalPhoto}
          alt="Foto de perfil"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {canEdit && (
        <>
          <label
            htmlFor="fileInput"
            className="btn btn-outline-secondary btn-sm"
            style={{
              borderColor: PALETTE.main,
              color: PALETTE.main,
            }}
          >
            Cambiar foto
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </>
      )}
    </motion.div>
  );
}
