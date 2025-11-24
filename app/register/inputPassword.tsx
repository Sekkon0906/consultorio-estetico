"use client";

import React from "react";

interface Props {
  label: string;
  value: string;
  setValue: (v: string) => void;
  show: boolean;
  setShow: (b: boolean) => void;
  error?: string; // 👈 ahora solo string o undefined
  palette: { main: string; text: string; surface: string; border: string };
}

export default function InputPassword({
  label,
  value,
  setValue,
  show,
  setShow,
  error,
  palette,
}: Props) {
  return (
    <div className="mb-3 text-start">
      <label
        className="form-label fw-semibold"
        style={{ color: palette.text }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`form-control rounded-3 shadow-sm ${error ? "is-invalid" : ""}`}
          placeholder={
            label === "Contraseña"
              ? "Mínimo 8 caracteres"
              : "Repite tu contraseña"
          }
          autoComplete="new-password"
          style={{
            paddingRight: "44px",
            borderColor: palette.border,
            backgroundColor: palette.surface,
          }}
        />

        {/* 👁 ícono para mostrar/ocultar */}
        <div
          role="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {show ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18" stroke={palette.main} strokeWidth="1.6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s2.5-6 11-6 11 6 11 6-2.5 6-11 6S1 12 1 12z"
                stroke={palette.main}
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="3" stroke={palette.main} strokeWidth="1.6" />
            </svg>
          )}
        </div>
      </div>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
