import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import NavbarClient from "@/components/NavbarClient";
import Footer from "@/components/Footer"; // ✅ usa alias limpio

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
                Carrera 5ta #11-24. Edificio Torre Empresarial. Consultorio 502.
                Ibagué – Tolima.
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
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/dravanessamedinao28/"
                target="_blank"
                className="text-dark me-3"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://api.whatsapp.com/message/SEJTQDVCRWGSP1?autoload=1&app_absent=0"
                target="_blank"
                className="text-dark"
                rel="noopener noreferrer"
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
        <Footer />
      </body>
    </html>
  );
}
