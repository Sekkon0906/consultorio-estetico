"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PALETTE } from "./palette";
import Step1DatosPersonales from "./step1DatosPersonales";
import Step2DatosMedicos from "./step2DatosMedicos";
import Step3Exito from "./step3exito";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    confirm: "",
    edad: "",
    genero: "",
    antecedentes: [],
    alergias: [],
    medicamentos: [],
    antecedentesDescripcion: "",
    alergiasDescripcion: "",
    medicamentosDescripcion: "",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const slide = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section
      className="py-5"
      style={{
        background: `linear-gradient(180deg,#FAF9F7 0%,#F1E9E0 100%)`,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card border-0 shadow-lg rounded-4"
              style={{ backgroundColor: PALETTE.surface, overflow: "hidden" }}
            >
              <div className="card-body p-4 p-md-8 text-center position-relative">
                {step > 1 && step < 3 && (
                  <p
                    onClick={prevStep}
                    style={{
                      position: "absolute",
                      left: "1.2rem",
                      top: "1.4rem",
                      color: PALETTE.text,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    ← Volver atrás
                  </p>
                )}

                {step < 3 && (
                  <div className="d-flex align-items-center justify-content-center mb-3 mt-1">
                    <div className="d-flex align-items-center">
                      <div className={`circle ${step >= 1 ? "filled" : ""}`}>1</div>
                      <div className={`line ${step === 2 ? "active" : ""}`}></div>
                      <div className={`circle ${step >= 2 ? "filled" : ""}`}>2</div>
                      <div className="line"></div>
                      <div className="circle">✓</div>
                    </div>
                  </div>
                )}

                <h1
                  className="fw-bold mb-2"
                  style={{
                    color: PALETTE.text,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {step === 1
                    ? "Crear cuenta"
                    : step === 2
                    ? "Información médica"
                    : "Registro exitoso"}
                </h1>

                <p
                  className="text-muted mb-4"
                  style={{ color: PALETTE.muted, fontSize: "0.95rem" }}
                >
                  {step === 1
                    ? "Regístrate para agendar tus citas de forma más rápida."
                    : step === 2
                    ? "Completa tu información médica básica."
                    : "Cuenta creada correctamente."}
                </p>

                {err && (
                  <div
                    className="alert alert-danger text-center"
                    style={{
                      backgroundColor: "#FCEAEA",
                      color: "#8C2B2B",
                      border: "1px solid #E3B4A0",
                    }}
                  >
                    {err}
                  </div>
                )}

                <div style={{ position: "relative", minHeight: 500 }}>
                  <AnimatePresence initial={false} mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        custom={1}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45 }}
                      >
                        <Step1DatosPersonales
                          formData={formData}
                          setFormData={setFormData}
                          nextStep={nextStep}
                          setErr={setErr}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        custom={2}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45 }}
                      >
                        <Step2DatosMedicos
                          formData={formData}
                          setFormData={setFormData}
                          nextStep={nextStep}
                          prevStep={prevStep}
                          setErr={setErr}
                        />
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        custom={3}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45 }}
                      >
                        <Step3Exito formData={formData} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid ${PALETTE.main};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: ${PALETTE.main};
          transition: all 0.28s ease;
        }
        .circle.filled {
          background-color: ${PALETTE.main};
          color: white;
        }
        .line {
          width: 56px;
          height: 4px;
          background-color: #e6d9cf;
          margin: 0 10px;
          transition: background-color 0.28s ease;
        }
        .line.active {
          background-color: ${PALETTE.main};
        }
      `}</style>
    </section>
  );
}
