import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import Image from "next/image";
import NavbarClient from "@/components/NavbarClient";

export const metadata: Metadata = {
  title: "Clínica Estética Dra. Julieth Medina",
  description:
    "Especialista en Medicina Estética, Nutrición y Antiedad en Ibagué",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          backgroundColor: "#F6F4EF",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* BARRA SUPERIOR */}
        <div
          style={{
            backgroundColor: "#E8E1D4",
            color: "#4E3B2B",
            fontSize: "0.9rem",
            padding: "6px 0",
            borderBottom: "1px solid #d9c3b0",
          }}
        >
          <div
            className="container-fluid d-flex align-items-center justify-content-between"
            style={{
              padding: "0 70px",
              position: "relative",
            }}
          >
            {/* IZQUIERDA: Teléfono */}
            <div
              className="d-flex align-items-center"
              style={{ position: "absolute", left: "70px" }}
            >
              <i className="fas fa-phone me-2"></i>
              <span>315 5445748</span>
            </div>

            {/* CENTRO: Dirección */}
            <div
              className="d-flex align-items-center justify-content-center w-100"
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              <i className="fas fa-map-marker-alt me-2"></i>
              <span>
                Carrera 5ta #11-24. Edificio Torre Empresarial. Consultorio 502. Ibagué – Tolima.
              </span>
            </div>

            {/* DERECHA: Redes sociales */}
            <div
              className="d-flex align-items-center"
              style={{ position: "absolute", right: "70px" }}
            >
              <a
                href="https://www.facebook.com/profile.php?id=61556167276406"
                target="_blank"
                className="text-dark me-3"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/dravanessamedinao28/"
                target="_blank"
                className="text-dark me-3"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://api.whatsapp.com/message/SEJTQDVCRWGSP1?autoload=1&app_absent=0"
                target="_blank"
                className="text-dark"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        {/* NAVBAR INTERACTIVA */}
        <NavbarClient />

        {/* CONTENIDO PRINCIPAL */}
        <main>{children}</main>

{/* FOOTER */}
<footer
  className="text-white pt-5 pb-3 mt-4"
  style={{
    backgroundColor: "#6C584C",
  }}
>
  <div className="container">
    <div className="row text-center text-md-start g-4">
      <div className="col-md-4">
        <h5
          className="fw-bold mb-3"
          style={{ color: "#E9DED2", fontFamily: "'Montserrat', sans-serif" }}
        >
          Clínica Estética Dra. Juliet Medina
        </h5>
        <p style={{ color: "#FAF9F7" }}>
          Esp. Medicina Estética & Salud Integral | Inyectora <strong>Elite</strong>.
        </p>
        <p style={{ color: "#FAF9F7" }}>Magíster en Gerencia Hospitalaria.</p>
      </div>

      <div className="col-md-4">
        <h5
          className="fw-bold mb-3"
          style={{ color: "#E9DED2", fontFamily: "'Montserrat', sans-serif" }}
        >
          Contacto
        </h5>
        <p style={{ color: "#FAF9F7" }}>
          <i
            className="fas fa-map-marker-alt me-2"
            style={{ color: "#B08968" }}
          ></i>
          Carrera 5ta #11-24. Edificio Torre Empresarial. Consultorio 502. Ibagué – Tolima.
        </p>
        <p style={{ color: "#FAF9F7" }}>
          <i className="fas fa-phone me-2" style={{ color: "#B08968" }}></i> 315 5445748
        </p>
      </div>

      <div className="col-md-4">
        <h5
          className="fw-bold mb-3"
          style={{ color: "#E9DED2", fontFamily: "'Montserrat', sans-serif" }}
        >
          Horario
        </h5>
        <p style={{ color: "#FAF9F7" }}>
          Lunes a Viernes: <br />
          8:00 AM - 12:00 PM / 2:00 PM - 6:00 PM
        </p>
        <p style={{ color: "#FAF9F7" }}>Sábados: 9:00 AM - 1:00 PM</p>
      </div>
    </div>

    <hr style={{ borderColor: "#B08968", opacity: 0.7 }} />

    <div className="text-center mt-3">
      <p style={{ color: "#E9DED2", fontSize: "0.9rem" }}>
        © {new Date().getFullYear()} Clínica Estética Dra. Juliet Medina. Todos
        los derechos reservados.
      </p>
    </div>
  </div>
</footer>

      </body>
    </html>
  );
}
