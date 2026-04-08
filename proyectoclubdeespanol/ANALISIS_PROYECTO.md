# Análisis del Proyecto: Club Español Moscú

## Resumen del Proyecto
El proyecto web oficial del **Club Español Moscú**, una plataforma de intercambio cultural donde personas de habla hispana y rusos pueden encontrarse para practicar español.

## ¿Tiene un panel de administrador para insertar fotos?
**No, el proyecto no cuenta con un panel de administrador (Dashboard o Backoffice) en el código web para insertar fotos.**

Actualmente, el sistema está diseñado para que la gestión de imágenes se realice **directamente desde Supabase**. Las fotos deben subirse manualmente al *bucket* de Storage en Supabase llamado `gallery`. El componente `PhotoGrid.tsx` se encarga de leer estas imágenes directamente desde Supabase y mostrarlas en la galería. 

Si deseas subir fotos, debes acceder al panel de control web de **Supabase**, ir a la sección "*Storage*", abrir el *bucket* de la galería y subir las imágenes allí. Si deseas que los administradores suban fotos desde la página web, sería necesario desarrollar un panel de administración y conectarlo a la API de Supabase Storage.

---

## Arquitectura y Tecnologías
- **Framework de Frontend:** Next.js (versión 14+) utilizando el nuevo App Router (`app/`).
- **Estilos:** Tailwind CSS con enfoque *mobile-first* y tema oscuro por defecto.
- **Base de Datos y Backend:** Supabase (PostgreSQL + Supabase Storage).
- **Animaciones e Interacciones:** Framer Motion.
- **Iconos:** Lucide React.
- **Lenguaje:** TypeScript.

## Estructura de Páginas y Funcionalidades
1. **Página Principal (`/`):** 
   - Contiene un componente dinámico (`Hero.tsx`) bilingüe.
   - Muestra el próximo evento programado utilizando el componente `NextEvent.tsx`.
   - Tiene estado en vivo (Viernes activo, de 19:00 a 00:00 hora de Moscú).

2. **Página de Eventos (`/events`):**
   - Lista los eventos usando el componente `EventCard.tsx`.
   - Distingue entre eventos gratuitos ("Friday", en Casa Agave, con links a Yandex y Google Maps) y de pago ("Party", que incluye un botón conectado a un bot de pagos en Telegram).

3. **Galería (`/gallery`):**
   - Usa un formato de cuadrícula (Masonry-style) implementado en `PhotoGrid.tsx`.
   - Muestra fotos provenientes del Storage de Supabase.

## Esquema de Base de Datos
El proyecto tiene definidos los siguientes modelos de base de datos en Supabase:
- **`events`**: Para gestionar la publicación de los eventos (título, descripción, fecha, ubicación, precio, link de pago en Telegram y una imagen de portada).
- **`gallery`**: Para relacionar imágenes específicas con un evento mediante un campo `event_id` provisto de validaciones de URL.

## Diseño Visual
El estilo implementado es de tipo **Glassmorphism**, lo cual incluye bordes degradados, brillos flotantes y efectos de desenfoque (`backdrop-blur`). El sistema de colores abarca tonos oscuros de fondo (`#0A0A0F`), acentos dorados y rojos primarios.

## Estado actual
El código base cuenta con todo el frontend completamente ensamblado y configurado, así como las definiciones de base de datos listas para desplegarse mediante su archivo SQL. Solo requiere un proyecto activo en Supabase con los *buckets* creados y las variables de entorno configuradas (`.env.local`) para funcionar al 100%.
