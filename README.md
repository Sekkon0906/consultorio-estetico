📘 README.md — CONSULTORIO ESTÉTICO
Plataforma web para gestión de procedimientos, citas, clientes y contenido
🏥 Consultorio Estético – Plataforma Web Completa

Este proyecto es un sistema web moderno diseñado para la administración integral de un consultorio estético: agenda de citas, gestión de procedimientos, testimonios, clientes y contenido visual.

Incluye:

💆 Catálogo completo de procedimientos con imágenes y descripciones

📅 Sistema de agendamiento con calendario, confirmación y pagos simulados

🛠️ Panel administrativo para gestionar todo el contenido

🖼️ Galerías multimedia para procedimientos, testimonios y charlas

🧭 Sitio público informativo del consultorio

⚙️ Arquitectura modular basada en Next.js App Router

El objetivo del proyecto es proveer una interfaz profesional, escalable y administrable, lista para producción.

🏗️ Arquitectura General

El sistema está construido sobre una arquitectura dividida en:

🎨 Frontend – Next.js + TypeScript

UI moderna, responsive y basada en TailwindCSS

Rutas del App Router

Tarjetas, formularios, galerías, modales

Páginas públicas y páginas protegidas (admin)

Manejo de imágenes en public/ y media externa

Flujo de agendamiento completo (form → calendario → pago → confirmación)

🛠️ Panel Administrativo

Incluye secciones:

Procedimientos

Testimonios

Clientes

Charlas

Citas agendadas

Con funcionalidades:

CRUD completo

Formularios dinámicos

Manejo de galerías

Edición en tiempo real

Listados con paginación y tarjetas visuales

📸 Sistema Multimedia

Subida de imágenes

Galerías por procedimiento

Videos y fotografías para testimonios

Previsualización y administración visual

📂 Estructura del Proyecto
consultorio-estetico-main/
│
├── app/
│   ├── administrar/
│   │   ├── procedimientos/
│   │   │   ├── procedimientosList.tsx
│   │   │   ├── procedimientosForm.tsx
│   │   │   └── helpers.ts
│   │   ├── citas/
│   │   ├── testimonios/
│   │   ├── charlas/
│   │   ├── clientes/
│   │   ├── AdministrarPageInner.tsx
│   │   ├── adminLayoutInner.tsx
│   │   └── ...
│   │
│   ├── agendar/
│   │   ├── agendarForm.tsx
│   │   ├── agendarCalendar.tsx
│   │   ├── agendarPago.tsx
│   │   ├── agendarConfirmacion.tsx
│   │   └── page.tsx
│   │
│   ├── consultorio/
│   ├── components/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
│
├── public/
│   └── imágenes, íconos y recursos estáticos
│
├── .env.example
├── .gitignore
├── package.json
└── README.md

⚙️ Instalación
1️⃣ Clonar el repositorio
git clone https://github.com/tu-repo/consultorio-estetico.git
cd consultorio-estetico

2️⃣ Instalar dependencias
npm install

3️⃣ Configurar variables de entorno

Crea un archivo .env.local basado en .env.example.

Ejemplo:

NEXT_PUBLIC_API_URL=https://tu-backend.com/api
ADMIN_SECRET=clave_admin

▶️ Ejecución del Proyecto
Ejecución en desarrollo
npm run dev


Disponible en:

👉 http://localhost:3000

Compilar para producción
npm run build
npm start

💆 Flujo del Usuario (Frontend Público)
🔹 1. Explora procedimientos

Con tarjetas, descripciones e imágenes.

🔹 2. Selecciona un procedimiento y agenda

Formulario + calendario dinámico.

🔹 3. Confirmación y pago simulado

Pantalla visual de resumen.

🔹 4. Registro final

Vista de éxito + resumen de cita.

🛠️ Panel Administrativo

Incluye herramientas para:

✔️ Procedimientos

Crear

Editar

Eliminar

Añadir galería

Definir precio y duración

✔️ Testimonios

Videos

Fotos

Descripciones

✔️ Citas

Listado

Editor

Confirmación manual

✔️ Clientes

Base de datos interna

✔️ Charlas / contenido

Gestión de material educativo

🛠️ Solución de Problemas Comunes
❌ Las imágenes no cargan

➡️ Verifica rutas en /public
➡️ No uses rutas absolutas del sistema operativo

❌ Falla el agendamiento

➡️ Revisar formato de fechas
➡️ Validar estado del calendario

❌ Next.js no genera build

➡️ Variable de entorno faltante
➡️ Archivos .env.local mal configurados

👨‍💻 Tecnologías utilizadas
Tecnología	Rol
Next.js	Framework principal
React + TS	Interfaz
TailwindCSS	Estilos
Node + API externa	Backend esperado
Media Components	Galerías y previews
App Router	Navegación moderna
📜 Licencia

MIT — Libre para uso académico o comercial.

🧿 Créditos

Proyecto diseñado y organizado por:
Mi amo, Señor Stark
