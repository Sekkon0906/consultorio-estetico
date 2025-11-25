# 📘 README.md — CONSULTORIO ESTÉTICO  
### Plataforma web para gestión de procedimientos, citas, clientes y contenido

---

## 🏥 Consultorio Estético – Plataforma Web Completa

Este proyecto es un sistema web moderno diseñado para la administración integral de un consultorio estético: agenda de citas, gestión de procedimientos, testimonios, clientes y contenido visual.

Incluye:

- 💆 **Catálogo completo de procedimientos** con imágenes y descripciones  
- 📅 **Sistema de agendamiento** con calendario, confirmación y pagos simulados  
- 🛠️ **Panel administrativo** para gestionar todo el contenido  
- 🖼️ **Galerías multimedia** para procedimientos, testimonios y charlas  
- 🧭 **Sitio público informativo** del consultorio  
- ⚙️ **Arquitectura modular** basada en Next.js App Router

El objetivo del proyecto es proveer una interfaz profesional, escalable y administrable, lista para producción.

---

# 🏗️ Arquitectura General

El sistema está construido sobre una arquitectura dividida en:

---

## 🎨 **Frontend – Next.js + TypeScript**

- UI moderna, responsive y basada en TailwindCSS  
- Rutas del App Router  
- Tarjetas, formularios, galerías, modales  
- Páginas públicas y páginas protegidas (admin)  
- Manejo de imágenes en `public/` y media externa  
- Flujo de agendamiento completo (form → calendario → pago → confirmación)

---

## 🛠️ **Panel Administrativo**

Incluye secciones:

- Procedimientos  
- Testimonios  
- Clientes  
- Charlas  
- Citas agendadas  

Con funcionalidades:

- CRUD completo  
- Formularios dinámicos  
- Manejo de galerías  
- Edición en tiempo real  
- Listados con paginación y tarjetas visuales  

---

## 📸 **Sistema Multimedia**

- Subida de imágenes  
- Galerías por procedimiento  
- Videos y fotografías para testimonios  
- Previsualización y administración visual

---

# 📂 Estructura del Proyecto

