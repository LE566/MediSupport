# MediSupport

## Descripción
MediSupport es una aplicación móvil desarrollada con **Ionic 8**, **Angular (Standalone Components)** y **Capacitor**. Permite a pacientes y doctores gestionar citas médicas y utilizar un clasificador de de cáncer alimentado por Inteligencia Artificial (AI). La aplicación fue desarrollada con principios de diseño moderno y rendimiento nativo.

## Requisitos Previos
- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Ionic CLI](https://ionicframework.com/docs/cli) instalado globalmente (`npm install -g @ionic/cli`)
- [Android Studio](https://developer.android.com/studio) (para probar/compilar en Android)

## Instalación
Para instalar las dependencias del proyecto:
```bash
npm install
```

## Ejecución en Desarrollo (Navegador)
Para correr la aplicación en el entorno de desarrollo local:
```bash
ionic serve
```

## Compilación y Ejecución en Dispositivo Móvil
Para sincronizar los cambios web hacia Capacitor y prepararlos para Android:
```bash
npm run build
npx cap sync android
```
Para abrir el proyecto en Android Studio:
```bash
npx cap open android
```
O para ejecutarlo directamente en un dispositivo/emulador conectado:
```bash
npx cap run android
```

## Características Técnicas
- **Frontend**: Ionic 8 (Standalone Components), Angular 17+ (Signals para manipulación reactiva del DOM), HTML/SCSS moderno.
- **Móvil (Nativo)**: `@capacitor/camera` (para tomar fotos y procesar radiografías), `@capacitor/haptics`.
- **Backend / Datos**: Conexión a API externa y Cloudinary para almacenamiento y procesamiento de imágenes con Machine Learning.
