# MediSupport+ 

MediSupport+ es una aplicación móvil moderna desarrollada con Ionic 8, Angular 17+ (Standalone Components) y Capacitor, diseñada para realizar diagnósticos y agendar citas médicas.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- [Android Studio](https://developer.android.com/studio) (para emular o compilar en Android)

## Instrucciones de Instalación

Sigue estos pasos para clonar el proyecto y configurarlo en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/LE566/MediSupport.git
   cd medi-support
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación en el navegador (Desarrollo):**
   ```bash
   ionic serve
   ```
   *Esto compilará el proyecto usando el builder moderno de Angular y abrirá tu navegador por defecto.*

## Ejecución en Emulador o Dispositivo Físico (Capacitor)

Para correr la aplicación de forma nativa en un dispositivo o emulador Android:

1. **Construir el proyecto para producción:**
   ```bash
   npm run build
   ```

2. **Sincronizar el proyecto web con la carpeta nativa:**
   ```bash
   npx cap sync
   ```

3. **Abrir el proyecto en Android Studio:**
   ```bash
   npx cap open android
   ```
   *Desde Android Studio podrás compilar el APK o ejecutar la aplicación directamente en un dispositivo conectado o emulador.*

## Tecnologías Principales

- **Angular 17+:** Componentes Standalone, nuevas directivas de control de flujo (`@if`, `@for`).
- **Ionic 8:** Componentes visuales responsivos e importación standalone.
- **Capacitor 8:** Plugins nativos (`@capacitor/camera`, `@capacitor/haptics`, etc).

---
> Proyecto Final
