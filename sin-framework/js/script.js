/**
 * =================================================================
 * Script Principal de Interacción (script.js)
 * -----------------------------------------------------------------
 * Este script maneja toda la interactividad global del portafolio.
 * Se encarga de la lógica de la barra de navegación, el "scrollspy"
 * para resaltar enlaces activos, las animaciones de entrada de
 * elementos, y la lógica de los componentes interactivos como el
 * slider de inicio y el carrusel de pasatiempos.
 * =================================================================
 * @module script
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * -----------------------------------------------------------------
     * 1. INICIALIZACIÓN Y REFERENCIAS GLOBALES AL DOM
     * -----------------------------------------------------------------
     * Se cachean todas las referencias a elementos del DOM que se
     * utilizarán a lo largo del script para un rendimiento óptimo.
     */

    const header = document.getElementById('main-header');
    const mainContainer = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.fullscreen-section');
    const body = document.body;
    const inicioSection = document.querySelector('#inicio');

    /**
     * -----------------------------------------------------------------
     * 2. LÓGICA DE INTERACCIÓN GENERAL Y SCROLL
     * -----------------------------------------------------------------
     */

    /**
     * Comprueba la posición del scroll dentro de `<main>` para determinar
     * si se debe mostrar el fondo de nebulosa. Se activa una vez que la
     * sección de inicio ha sido desplazada fuera de la vista.
     * @returns {void}
     */
    const checkNebulaVisibility = () => {
        // La nebulosa se hace visible si el scroll ha superado la altura de la sección de inicio.
        // Se resta 50px para que la transición comience un poco antes.
        if (mainContainer.scrollTop > inicioSection.offsetHeight - 50) {
            body.classList.add('nebula-visible');
        } else {
            body.classList.remove('nebula-visible');
        }
    };

    /**
     * Gestiona múltiples tareas que dependen del evento de scroll en `<main>`:
     * - Aplica un estilo visual a la barra de navegación.
     * - Actualiza el enlace activo en la navegación (Scrollspy).
     * - Controla la visibilidad de la nebulosa de fondo.
     * @returns {void}
     */
    const handleMainScroll = () => {
        // Lógica para la barra de navegación
        if (mainContainer.scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Lógica de Scrollspy
        let currentSectionId = '';
        sections.forEach(section => {
            // Se resta 150px para activar el enlace un poco antes de que la sección llegue al borde superior.
            const sectionTop = section.offsetTop - 150;
            if (mainContainer.scrollTop >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
        
        // Lógica de visibilidad de la nebulosa
        checkNebulaVisibility();
    };

    mainContainer.addEventListener('scroll', handleMainScroll);

    /**
     * -----------------------------------------------------------------
     * 3. LÓGICA DEL SLIDER DE LA SECCIÓN DE INICIO
     * -----------------------------------------------------------------
     */
    
    // Se inicializa solo si el slider existe en la página.
    const slider = document.querySelector('#inicio .slider');
    if (slider) {
        const nextBtn = document.querySelector('#inicio .next');
        const prevBtn = document.querySelector('#inicio .prev');
        const overlay = document.querySelector('#inicio .transition-overlay');

        let isAnimating = false;
        const animationDuration = 1000;
        const fadeOutDuration = 300;

        /**
         * Realiza la transición animada entre dos slides.
         * @param {'next'|'prev'} direction - La dirección del desplazamiento.
         */
        const performTransition = (direction) => {
            if (isAnimating) return;
            isAnimating = true;

            const items = document.querySelectorAll('#inicio .item');
            const activeItem = items[0];
            const activePerson = activeItem.dataset.person;

            activeItem.classList.add('fade-out');

            setTimeout(() => {
                slider.classList.add('hiding-preview');
                const gradientClass = (activePerson === 'sofia') ? 'blue' : 'purple';
                overlay.className = `transition-overlay ${gradientClass} active`;

                setTimeout(() => {
                    activeItem.classList.remove('fade-out');
                    if (direction === 'next') {
                        slider.appendChild(activeItem); // Mueve el primer ítem al final.
                    } else {
                        const lastItem = items[items.length - 1];
                        slider.prepend(lastItem); // Mueve el último ítem al principio.
                    }
                    slider.classList.remove('hiding-preview');
                    overlay.className = 'transition-overlay';
                    isAnimating = false;
                }, animationDuration - fadeOutDuration);
            }, fadeOutDuration);
        };

        nextBtn.addEventListener('click', () => performTransition('next'));
        prevBtn.addEventListener('click', () => performTransition('prev'));
    }

    /**
     * -----------------------------------------------------------------
     * 4. ANIMACIONES DE ENTRADA AL HACER SCROLL (INTERSECTION OBSERVER)
     * -----------------------------------------------------------------
     */

    const animatedElements = document.querySelectorAll('.study-card, .carousel-container, .project-card, .form-column, .list-column');
    
    const observerOptions = {
        root: mainContainer, // Las observaciones se basan en el scroll de <main>.
        rootMargin: '0px',
        threshold: 0.25 // La animación se dispara cuando el 25% del elemento es visible.
    };

    /**
     * Callback que se ejecuta cuando un elemento observado entra en la vista.
     * @param {IntersectionObserverEntry[]} entries - Lista de entradas observadas.
     * @param {IntersectionObserver} observer - La instancia del observador.
     */
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Se deja de observar para mejorar el rendimiento.
            }
        });
    };

    const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => animationObserver.observe(el));

    /**
     * -----------------------------------------------------------------
     * 5. LÓGICA DEL CARRUSEL 3D DE LA SECCIÓN DE PASATIEMPOS
     * -----------------------------------------------------------------
     */

    const hobbiesSection = document.querySelector("#pasatiempos");
    const track = hobbiesSection ? hobbiesSection.querySelector(".carousel-track") : null;

    if (track) {
        // Se cachean todos los elementos del carrusel.
        const cards = Array.from(track.children);
        const nextButton = hobbiesSection.querySelector(".carousel-button.next");
        const prevButton = hobbiesSection.querySelector(".carousel-button.prev");
        const container = hobbiesSection.querySelector(".carousel-container");
        const indicators = hobbiesSection.querySelectorAll(".indicator");
        let currentIndex = 0;

        /**
         * Función de utilidad para retrasar la ejecución de una función (debounce).
         * Útil para eventos que se disparan con frecuencia, como 'resize'.
         * @param {Function} func - La función a ejecutar.
         * @param {number} wait - El tiempo de espera en milisegundos.
         */
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        /**
         * Calcula y aplica la posición inicial del carrusel para centrar la primera tarjeta.
         */
        const initializeCarousel = () => {
            const cardWidth = cards[0].offsetWidth;
            const containerCenter = container.offsetWidth / 2;
            const cardCenter = cardWidth / 2;
            const initialOffset = containerCenter - cardCenter;
            track.style.transform = `translateX(${initialOffset}px)`;
            moveToSlide(currentIndex);
        };
        
        /**
         * Actualiza las clases CSS de las tarjetas e indicadores según el índice actual.
         */
        const updateCarousel = () => {
            cards.forEach((card, index) => {
                card.classList.remove("is-active", "is-prev", "is-next");
                if (index === currentIndex) card.classList.add("is-active");
                else if (index === currentIndex - 1) card.classList.add("is-prev");
                else if (index === currentIndex + 1) card.classList.add("is-next");
            });
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle("active", index === currentIndex);
            });
        };

        /**
         * Mueve el carrusel a un slide específico.
         * @param {number} targetIndex - El índice del slide al que se quiere mover.
         */
        const moveToSlide = (targetIndex) => {
            if (targetIndex < 0 || targetIndex >= cards.length) return;
            const cardWidth = cards[0].offsetWidth;
            const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;
            const amountToMove = targetIndex * (cardWidth + cardMargin);
            const containerCenter = container.offsetWidth / 2;
            const cardCenter = cardWidth / 2;
            const targetTranslateX = containerCenter - cardCenter - amountToMove;
            track.style.transform = `translateX(${targetTranslateX}px)`;
            currentIndex = targetIndex;
            updateCarousel();
        };

        nextButton.addEventListener("click", () => {
            if (currentIndex + 1 < cards.length) moveToSlide(currentIndex + 1);
        });
        prevButton.addEventListener("click", () => {
            if (currentIndex - 1 >= 0) moveToSlide(currentIndex - 1);
        });
        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => moveToSlide(index));
        });
        
        window.addEventListener("resize", debounce(initializeCarousel, 250));

        // Inicialización diferida para asegurar que todos los elementos se hayan renderizado.
        setTimeout(() => {
            initializeCarousel();
            moveToSlide(2); // Inicia en la tarjeta del medio.
        }, 100);
    }

    /**
     * -----------------------------------------------------------------
     * 6. LÓGICA DE INTERACCIÓN 3D DE LAS TARJETAS DE PROYECTOS
     * -----------------------------------------------------------------
     */
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        // Efecto de resplandor que sigue al cursor.
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
    
    /**
     * -----------------------------------------------------------------
     * 7. EJECUCIÓN INICIAL
     * -----------------------------------------------------------------
     */

    // Se realiza una comprobación inicial al cargar la página.
    checkNebulaVisibility();
});