"use client";

import { useMemo, useState } from "react";

type Form = {
  nombre: string;
  email: string;
  telefono: string;
  procedimiento: string;
  fecha: string;
  hora: string;
  notas: string;
  pago: "Efectivo" | "Tarjeta en clínica" | "Transferencia" | "Pago en línea" | "";
  anticipo: string;
};

const PROCEDIMIENTOS = [
  "Limpieza Facial",
  "Bótox",
  "Ácido Hialurónico en labios",
  "Ácido Hialurónico Facial",
  "Tratamiento para el Acné",
  "Tratamiento para Manchas",
];

const PRECIOS: Record<string, number> = {
  "Limpieza Facial": 120000,
  "Bótox": 600000,
  "Ácido Hialurónico en labios": 900000,
  "Ácido Hialurónico Facial": 1200000,
  "Tratamiento para el Acné": 250000,
  "Tratamiento para Manchas": 300000,
};

const WHATSAPP_NUM = "57 315 5445748";
const CLINIC_EMAIL = "dra.vanessamedinao@gmail.com";

const fmtCOP = (v: number) =>
  v.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

export default function AgendarPage() {
  const [f, setF] = useState<Form>({
    nombre: "",
    email: "",
    telefono: "",
    procedimiento: "",
    fecha: "",
    hora: "",
    notas: "",
    pago: "",
    anticipo: "",
  });
  const [touched, setTouched] = useState(false);

  const precio = useMemo(() => PRECIOS[f.procedimiento] ?? 0, [f.procedimiento]);
  const anticipoSugerido = useMemo(() => Math.round(precio * 0.2), [precio]);
  const anticipoNumber = useMemo(
    () => Number((f.anticipo || "0").replace(/[^\d]/g, "")),
    [f.anticipo]
  );

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Correo no válido";
    if (!/^[0-9\s()+-]{7,}$/.test(f.telefono)) e.telefono = "Teléfono no válido";
    if (!f.procedimiento) e.procedimiento = "Selecciona un procedimiento";
    if (!f.fecha) e.fecha = "Selecciona una fecha";
    if (!f.hora) e.hora = "Selecciona una hora";
    if (!f.pago) e.pago = "Selecciona un método de pago";
    if (f.pago !== "" && f.anticipo && isNaN(anticipoNumber))
      e.anticipo = "Valor no válido";
    return e;
  }, [f, anticipoNumber]);

  const formIsValid = Object.keys(errors).length === 0;

  const handleChange =
    (k: keyof Form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      let val = e.target.value;
      if (k === "anticipo") val = val.replace(/[^\d]/g, "");
      setF((s) => ({ ...s, [k]: val }));
    };

  const buildWhatsAppUrl = () => {
    const msg =
      `Hola, soy *${f.nombre}*.\n` +
      `Quiero agendar una cita para *${f.procedimiento}*.\n\n` +
      `📅 Fecha: ${f.fecha}\n` +
      `🕒 Hora: ${f.hora}\n` +
      `📧 Correo: ${f.email}\n` +
      `📞 Teléfono: ${f.telefono}\n` +
      (precio ? `💵 Precio estimado: ${fmtCOP(precio)}\n` : "") +
      (f.anticipo
        ? `🔖 Anticipo: ${fmtCOP(anticipoNumber)}\n`
        : `🔖 Anticipo sugerido: ${fmtCOP(anticipoSugerido)}\n`) +
      (f.pago ? `💳 Método de pago: ${f.pago}\n` : "") +
      (f.notas ? `📝 Notas: ${f.notas}\n` : "");
    return `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;
  };

  const buildMailto = () => {
    const subject = `Nueva cita: ${f.procedimiento} - ${f.nombre}`;
    const body =
      `Nombre: ${f.nombre}\n` +
      `Correo: ${f.email}\n` +
      `Teléfono: ${f.telefono}\n` +
      `Procedimiento: ${f.procedimiento}\n` +
      `Fecha: ${f.fecha}\n` +
      `Hora: ${f.hora}\n` +
      (precio ? `Precio estimado: ${fmtCOP(precio)}\n` : "") +
      (f.anticipo
        ? `Anticipo: ${fmtCOP(anticipoNumber)}\n`
        : `Anticipo sugerido: ${fmtCOP(anticipoSugerido)}\n`) +
      (f.pago ? `Método de pago: ${f.pago}\n` : "") +
      (f.notas ? `Notas: ${f.notas}\n` : "");
    return `mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formIsValid) return;
    window.open(buildWhatsAppUrl(), "_blank");
  };

  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(180deg, #FAF9F7 0%, #FFFFFF 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
              style={{ backgroundColor: "#FFFDF9" }}
            >
              <div className="row g-0">
                {/* Imagen lateral */}
                <div
                  className="col-md-5 d-none d-md-block"
                  style={{
                    backgroundImage: "url('/imagenes/doctora.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Formulario */}
                <div className="col-md-7 p-4 p-md-5">
                  <h1
                    className="fw-bold mb-1"
                    style={{
                      color: "#4E3B2B",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Agendar Cita
                  </h1>
                  <p className="text-muted mb-4" style={{ color: "#6C584C" }}>
                    Completa tus datos y elige fecha y hora. Te confirmaremos por
                    WhatsApp o correo electrónico.
                  </p>

                  <form onSubmit={onSubmit} noValidate>
                    <div className="row">
                      {/* Nombre */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre completo</label>
                        <input
                          type="text"
                          className={`form-control ${
                            touched && errors.nombre ? "is-invalid" : ""
                          }`}
                          value={f.nombre}
                          onChange={handleChange("nombre")}
                          placeholder="Tu nombre"
                        />
                        {touched && errors.nombre && (
                          <div className="invalid-feedback">
                            {errors.nombre}
                          </div>
                        )}
                      </div>

                      {/* Teléfono */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className={`form-control ${
                            touched && errors.telefono ? "is-invalid" : ""
                          }`}
                          value={f.telefono}
                          onChange={handleChange("telefono")}
                          placeholder="+57 313 821 0700"
                        />
                        {touched && errors.telefono && (
                          <div className="invalid-feedback">
                            {errors.telefono}
                          </div>
                        )}
                      </div>

                      {/* Correo */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                          type="email"
                          className={`form-control ${
                            touched && errors.email ? "is-invalid" : ""
                          }`}
                          value={f.email}
                          onChange={handleChange("email")}
                          placeholder="tucorreo@dominio.com"
                        />
                        {touched && errors.email && (
                          <div className="invalid-feedback">
                            {errors.email}
                          </div>
                        )}
                      </div>

                      {/* Procedimiento */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Procedimiento</label>
                        <select
                          className={`form-select ${
                            touched && errors.procedimiento ? "is-invalid" : ""
                          }`}
                          value={f.procedimiento}
                          onChange={handleChange("procedimiento")}
                        >
                          <option value="">Selecciona…</option>
                          {PROCEDIMIENTOS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {touched && errors.procedimiento && (
                          <div className="invalid-feedback">
                            {errors.procedimiento}
                          </div>
                        )}
                      </div>

                      {/* Fecha y hora */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fecha</label>
                        <input
                          type="date"
                          className={`form-control ${
                            touched && errors.fecha ? "is-invalid" : ""
                          }`}
                          value={f.fecha}
                          onChange={handleChange("fecha")}
                        />
                        {touched && errors.fecha && (
                          <div className="invalid-feedback">
                            {errors.fecha}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Hora</label>
                        <input
                          type="time"
                          className={`form-control ${
                            touched && errors.hora ? "is-invalid" : ""
                          }`}
                          value={f.hora}
                          onChange={handleChange("hora")}
                        />
                        {touched && errors.hora && (
                          <div className="invalid-feedback">{errors.hora}</div>
                        )}
                      </div>

                      {/* Método de pago */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Método de pago</label>
                        <select
                          className={`form-select ${
                            touched && errors.pago ? "is-invalid" : ""
                          }`}
                          value={f.pago}
                          onChange={handleChange("pago")}
                        >
                          <option value="">Selecciona…</option>
                          <option>Efectivo</option>
                          <option>Tarjeta en clínica</option>
                          <option>Transferencia</option>
                          <option>Pago en línea</option>
                        </select>
                        {touched && errors.pago && (
                          <div className="invalid-feedback">{errors.pago}</div>
                        )}
                      </div>

                      {/* Anticipo */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Anticipo (opcional)
                          {precio
                            ? ` — sugerido ${fmtCOP(anticipoSugerido)}`
                            : ""}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className={`form-control ${
                              touched && errors.anticipo ? "is-invalid" : ""
                            }`}
                            value={f.anticipo}
                            onChange={handleChange("anticipo")}
                            placeholder={
                              precio ? String(anticipoSugerido) : "0"
                            }
                          />
                        </div>
                        {touched && errors.anticipo && (
                          <div className="invalid-feedback">
                            {errors.anticipo}
                          </div>
                        )}
                      </div>

                      {/* Precio estimado */}
                      {precio > 0 && (
                        <div className="col-12 mb-2">
                          <div
                            className="alert border rounded-3 d-flex justify-content-between align-items-center"
                            style={{
                              backgroundColor: "#FAF9F7",
                              color: "#4E3B2B",
                              borderColor: "#E9DED2",
                            }}
                          >
                            <span>
                              <strong>Precio estimado:</strong> {fmtCOP(precio)}{" "}
                              • <strong>Anticipo:</strong>{" "}
                              {f.anticipo
                                ? fmtCOP(anticipoNumber)
                                : fmtCOP(anticipoSugerido)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Notas (opcional)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={f.notas}
                          onChange={handleChange("notas")}
                          placeholder="Alergias, preferencias de horario, EPS, etc."
                        />
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="d-flex flex-wrap gap-2">
                      

                     
                      

                      <button
                        type="submit"
                        className="btn btn-lg text-white"
                        style={{
                          backgroundColor: "#B08968",
                          borderColor: "#B08968",
                          borderRadius: "40px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#A1724F")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#B08968")
                        }
                      >
                        <i className="fab fa-whatsapp me-2"></i> Solicitar por
                        WhatsApp
                      </button>

                      <a
                        className="btn btn-outline-secondary btn-lg"
                        style={{
                          borderColor: "#B08968",
                          color: "#4E3B2B",
                          borderRadius: "40px",
                        }}
                        href={buildMailto()}
                        onClick={(e) =>
                          !formIsValid
                            ? (setTouched(true), e.preventDefault())
                            : undefined
                        }
                      >
                        <i className="fas fa-envelope me-2"></i> Enviar por correo
                      </a>
                    </div>
                  </form>

                  <div
                    className="mt-3 small"
                    style={{ color: "#6C584C", fontStyle: "italic" }}
                  >
                    *Los precios son estimados y pueden variar según valoración
                    médica.
                  </div>
                </div>
              </div>
            </div>

            {/* info de contacto */}
            <div className="text-center mt-4" style={{ color: "#6C584C" }}>
              <div>
                ¿Prefieres escribirnos directo?{" "}
                <a
                  href={`https://api.whatsapp.com/message/SEJTQDVCRWGSP1?autoload=1&app_absent=0${WHATSAPP_NUM}`}
                  target="_blank"
                  style={{ color: "#B08968", textDecoration: "none" }}
                >
                  WhatsApp
                </a>{" "}
                ·{" "}
                <a
                  href={`mailto:${CLINIC_EMAIL}`}
                  style={{ color: "#B08968", textDecoration: "none" }}
                >
                  {CLINIC_EMAIL}
                </a>{" "}
                ·{" "}
                <span>
                  <i className="fas fa-map-marker-alt me-1"></i> Carrera 5ta #11-24. Edificio Torre Empresarial. Consultorio 502. Ibagué – Tolima.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
