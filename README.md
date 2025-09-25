# Portafolio Personal [Sofi y Diego] - Versión Nativa

Este es un proyecto académico desarrollado para la asignatura **Ingeniería del Software 3** y **Laboratorio de Ingeniería del Software 3** de la **Universidad del Cauca**. El objetivo principal es la creación de una página web personal de tipo "Single Page Application" (SPA), aplicando conocimientos en desarrollo web front-end con tecnologías puras y nativas: HTML5, CSS3 y JavaScript (ES6+), sin el uso de frameworks.

## ✒️ Autores

-   **Ana Sofía Arango Yanza** - [anaarangowt@unicauca.edu.co](mailto:anaarangowt@unicauca.edu.co)
-   **Juan Diego Gómez Garcés** - [juangomezmu@unicauca.edu.co](mailto:juangomezmu@unicauca.edu.co)

---

## ✨ Vista Previa de la Aplicación

A continuación, se muestran las diferentes secciones que componen el portafolio.

### 1. Sección de Inicio
<img width="1599" height="734" alt="image" src="https://github.com/user-attachments/assets/098ee350-c5da-4d4c-9bc7-3250bc47e45f" />

<img width="1599" height="734" alt="image" src="https://github.com/user-attachments/assets/a2ebccbc-8c62-4a0c-ac70-4fdaf1b13b1c" />


### 2. Sección de Estudios
<img width="1599" height="736" alt="image" src="https://github.com/user-attachments/assets/59c4d628-6624-4bef-99d4-81196a19207a" />


### 3. Sección de Pasatiempos
<img width="1599" height="737" alt="image" src="https://github.com/user-attachments/assets/58085468-fdd8-4e41-be26-e31054c123ce" />


### 4. Sección de Proyectos
<img width="1599" height="734" alt="image" src="https://github.com/user-attachments/assets/6a999799-f31b-43a4-974d-c81b68fdf96f" />


### 5. Sección de Contacto
<img width="1599" height="733" alt="image" src="https://github.com/user-attachments/assets/e0307282-30b6-4143-8081-3a35bc194e26" />

### 6. Footer

<img width="1599" height="440" alt="image" src="https://github.com/user-attachments/assets/e4b88272-fd83-46c4-92ec-6f8be89815ef" />

---

## ✅ Cumplimiento de Requisitos del Proyecto

Este proyecto cumple con todos los puntos especificados en la guía de la asignatura para la **versión nativa (sin framework)**.

### Requisitos Generales
-   **5 Secciones Obligatorias**: Se implementaron las secciones `Inicio`, `Estudios`, `Pasatiempos`, `Proyectos` y `Contacto`.
-   **JavaScript Funcional**:
    -   **Validación de Formulario**: El formulario de contacto valida todos los campos en tiempo real (al perder el foco) y al intentar enviarlo.
    -   **Carrusel de Imágenes**: La sección de Pasatiempos cuenta con un carrusel 3D totalmente funcional, creado con lógica de JavaScript nativo.
-   **CSS Personalizado**: Todos los estilos de la página son personalizados.
-   **Personalización Clara**: El contenido, incluyendo fotos, textos y proyectos, es único y personal de los autores.

### Secciones Obligatorias
-   **Inicio**: Incluye nombre completo, fecha de nacimiento, foto personal y texto de expectativas profesionales para ambos autores.
-   **Estudios**: Muestra la trayectoria educativa de ambos en una tabla estructurada.
-   **Pasatiempos**: Presenta 7 pasatiempos en total (cumpliendo el mínimo de 3), cada uno con su imagen y descripción.
-   **Proyectos**: Lista 3 proyectos relevantes con su nombre, descripción, tecnologías y enlaces externos.
-   **Contacto**:
    -   **Controles de Formulario**: Utiliza `label`, `input` (text, email, tel), `select`, `textarea`, `checkbox`, `radio` y `button`.
    -   **Validaciones**: Se implementaron con JavaScript puro, mostrando mensajes de error claros y específicos.
    -   **Persistencia en Cliente (`localStorage`)**:
        -   Se utiliza el patrón **Repository** (`ContactRepository.js`) para aislar la lógica de interacción con `localStorage`.
        -   Se utiliza el patrón **Facade** (`ContactFacade.js`) para proveer una API simple y de alto nivel (`guardarContacto`, `listarContactos`, etc.) que es consumida por la interfaz.
        -   Los contactos se guardan como JSON bajo la clave `contactosSinFramework`.
        -   Se implementó la clase `Contacto.js` como modelo de dominio, que gestiona la creación de IDs y fechas.
    -   **Funcionalidad CRUD**:
        -   **Crear y Actualizar**: El formulario permite agregar nuevos contactos y editar los existentes. La fecha de actualización se modifica automáticamente.
        -   **Eliminar**: Se pueden eliminar contactos de forma individual o todos a la vez, con un modal de confirmación para prevenir acciones accidentales.
        -   **Listar**: Los contactos guardados se listan en tiempo real debajo del formulario.

### Especificaciones Técnicas (Versión Nativa)
-   **HTML Semántico**: Se utilizó una estructura HTML clara con etiquetas semánticas como `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, etc.
-   **CSS Puro**: No se utilizó ningún framework como Bootstrap o Tailwind.
-   **JavaScript Nativo**: Toda la lógica interactiva fue implementada con JavaScript puro (vanilla JS), sin librerías externas como jQuery.
-   **NO Responsive (Desktop First)**: Siguiendo la especificación, se utilizaron `media queries` pero  no es 100% responsive.
-   **Carrusel Manual**: La lógica del carrusel de pasatiempos se partio de una plantilla.

---

### Ítem de Investigación: `localStorage` vs. `IndexedDB`

Como parte de los requisitos, se investigó cuándo es apropiado usar `IndexedDB` en lugar de `localStorage`.

-   **`localStorage` (Utilizado en este proyecto)**: Es ideal para almacenar pequeñas cantidades de datos (hasta 5-10 MB) en formato clave-valor simple (solo strings). Es síncrono, lo que significa que puede bloquear el hilo principal si se manejan grandes volúmenes de datos, pero es muy fácil de usar. Es perfecto para guardar preferencias de usuario, tokens o, como en este caso, una lista de contactos simple.

-   **`IndexedDB`**: Es una base de datos de bajo nivel mucho más potente y asíncrona, diseñada para almacenar grandes volúmenes de datos estructurados en el cliente. Permite crear índices para realizar consultas complejas y de alto rendimiento sin bloquear la interfaz de usuario.
    -   **Se debería usar `IndexedDB` cuando**:
        1.  La aplicación necesita almacenar una **gran cantidad de datos** (más de 10 MB).
        2.  Se requiere **funcionalidad offline** compleja, como en un editor de documentos o un cliente de correo.
        3.  Los datos son complejos y se necesitan **consultas e índices** para buscarlos eficientemente (ej: "buscar todos los contactos de la ciudad X ordenados por fecha").
        4.  La aplicación maneja **archivos o blobs**, como imágenes o audios.

**Conclusión**: Para la funcionalidad de este proyecto, `localStorage` es la herramienta adecuada debido a la simplicidad y el bajo volumen de los datos a gestionar.

---

## 🛠️ Tecnologías Utilizadas

-   **HTML5**: Para la estructura y el contenido semántico de la web.
-   **CSS3**: Para el diseño, layout, animaciones y estilos visuales. Se utilizó una arquitectura de archivos modular (un CSS por cada sección).
-   **JavaScript (ES6+)**: Para toda la interactividad del sitio, incluyendo:
    -   Manipulación del DOM.
    -   Lógica de componentes (slider, carrusel, modal, notificaciones).
    -   Validación de formularios.
    -   Gestión de persistencia de datos con patrones de diseño.

---

## 📁 Estructura del Proyecto

El proyecto sigue la estructura de carpetas recomendada en la guía, promoviendo una organización modular y mantenible.

```plaintext
sin-framework/
├── index.html                # Archivo principal de la aplicación
├── README.md                 # Esta documentación
├── assets/
│   └── images/               # Imágenes, fondos y fotos personales
├── css/
│   ├── main.css              # Estilos globales y de navegación
│   ├── inicio.css            # Estilos para la sección Inicio
│   ├── estudios.css          # Estilos para la sección Estudios
│   ├── pasatiempos.css       # Estilos para la sección Pasatiempos
│   ├── proyectos.css         # Estilos para la sección Proyectos
│   ├── contacto.css          # Estilos para la sección Contacto
│   └── footer.css            # Estilos para el pie de página
└── js/
    ├── app.js             # Lógica global
    └── contact/              # Módulo de contacto con patrones de diseño
        ├── domain/
        │   └── Contacto.js   # Modelo (la estructura de un contacto)
        ├── repository/
        │   └── ContactRepository.js # Capa de datos (interactúa con localStorage)
        └── facade/
            └── ContactFacade.js # API simplificada para la UI
```
---
## 🚀 Instrucciones de Uso

Este proyecto no requiere de un servidor web ni de dependencias para funcionar.

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    ```
2.  **Navegar a la carpeta del proyecto**:
    ```bash
    cd tu-repositorio/sin-framework
    ```
3.  **Abrir el archivo `index.html`**:
    Simplemente haz doble clic en el archivo `index.html` o arrástralo a tu navegador web preferido (Chrome, Firefox, Edge).
    
