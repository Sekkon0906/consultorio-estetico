"use client";

import React from "react";

interface Props {
  label: string;
  type?: string;
  value: string;
  setValue: (v: string) => void;
  error?: string; // <- ahora solo string (o undefined)
  palette: {
    main: string;
    text: string;
    surface: string;
    border: string;
    muted?: string;
  };
  name?: string;
  placeholder?: string;
}

export default function Input({
  label,
  type = "text",
  value,
  setValue,
  error,
  palette,
  name,
  placeholder,
}: Props) {
  // placeholder por defecto según tipo
  const finalPlaceholder =
    placeholder ??
    (type === "email"
      ? "tucorreo@gmail.com"
      : type === "tel"
      ? "3001234567"
      : "");

  return (
    <div className="mb-3 text-start">
      <label
        className="form-label fw-semibold"
        style={{ color: palette.text }}
      >
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`form-control rounded-3 shadow-sm ${
          error ? "is-invalid" : ""
        }`}
        placeholder={finalPlaceholder}
        style={{
          borderColor: palette.border,
          backgroundColor: palette.surface,
        }}
        autoComplete={type === "password" ? "new-password" : "on"}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
