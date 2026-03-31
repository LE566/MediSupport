# MediSupport - AI Mammogram Classifier (Frontend)

Esta es la aplicación móvil desarrollada con Ionic y Angular que permite a pacientes y médicos subir imágenes de mamografías para ser evaluadas por un modelo de Inteligencia Artificial (EfficientNet). La aplicación incluye gestión de citas, subida de imágenes desde galería o cámara nativa, y un historial clínico con filtros de privacidad por usuario.

## Tecnologías Principales

* **Framework:** Ionic / Angular (Standalone components)
* **Capacitor:** Para integración nativa (Cámara)
* **Estilos:** SCSS
* **Integraciones:** Cloudinary (alojamiento de imágenes), API REST en Python Flask (IA y Base de datos)

---

##  Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

1.  [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
2.  **npm** (viene incluido al instalar Node.js).
3.  **Ionic CLI** instalado de forma global. Si no lo tienes, instálalo con:
    ```bash
    npm install -g @ionic/cli
    ```

---

## 🛠️ Instalación y Ejecución Rápida

Para levantar el proyecto en tu computadora, solo abre tu terminal en la carpeta del proyecto y ejecuta estos comandos uno por uno:

```bash

**1. Clonar el repositorio**
Descarga el código fuente a tu máquina local:
```bash
git clone https://github.com/LE566/MediSupport.git
cd MediSupport

# 2. Instalar todas las dependencias
npm install

# 3. Sincronizar los plugins nativos (Cámara, etc.)
npx cap sync

# 4. Levantar el servidor local de prueba
ionic serve
