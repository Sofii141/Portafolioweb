document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('main-header');
    const mainContainer = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.fullscreen-section');

    // --- LÓGICA NAVBAR Y SCROLLSPY ---
    mainContainer.addEventListener('scroll', () => {
        if (mainContainer.scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    mainContainer.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (mainContainer.scrollTop >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    const slider = document.querySelector('#inicio .slider');
    const nextBtn = document.querySelector('#inicio .next');
    const prevBtn = document.querySelector('#inicio .prev');
    const overlay = document.querySelector('#inicio .transition-overlay');

    let isAnimating = false;
    const animationDuration = 1000; 
    const fadeOutDuration = 300; // Duración del desvanecimiento del texto

    const performTransition = (direction) => {
        if (isAnimating) return;
        isAnimating = true;

        const items = document.querySelectorAll('#inicio .item');
        const activeItem = items[0];
        const activePerson = activeItem.dataset.person;
        
        // 1. Desvanecemos el contenido actual
        activeItem.classList.add('fade-out');

        setTimeout(() => {
            // 2. Ocultamos la vista previa
            slider.classList.add('hiding-preview');

            // 3. Decidimos el color del gradiente y lo activamos
            const gradientClass = (activePerson === 'sofia') ? 'blue' : 'purple';
            overlay.className = `transition-overlay ${gradientClass} active`;
            
            // 4. Esperamos a que la animación del overlay termine para cambiar el slide
            setTimeout(() => {
                activeItem.classList.remove('fade-out'); // Limpiamos la clase para el futuro

                if (direction === 'next') {
                    slider.appendChild(activeItem);
                } else { // 'prev'
                    const lastItem = items[items.length - 1];
                    slider.prepend(lastItem);
                }

                // 5. Mostramos la nueva vista previa
                slider.classList.remove('hiding-preview');

                // 6. Reseteamos todo para la siguiente animación
                overlay.className = 'transition-overlay';
                isAnimating = false;
            }, animationDuration - fadeOutDuration);
        }, fadeOutDuration);
    };

    nextBtn.addEventListener('click', () => performTransition('next'));
    prevBtn.addEventListener('click', () => performTransition('prev'));
});

/* --- LÓGICA PARA EL CARRUSEL DE PASATIEMPOS --- */
const hobbiesSection = document.querySelector("#pasatiempos");
const track = hobbiesSection.querySelector(".carousel-track");

// Solo ejecutar este código si la sección de pasatiempos existe
if (track) {
    const cards = Array.from(track.children);
    const nextButton = hobbiesSection.querySelector(".carousel-button.next");
    const prevButton = hobbiesSection.querySelector(".carousel-button.prev");
    const container = hobbiesSection.querySelector(".carousel-container");
    const indicators = hobbiesSection.querySelectorAll(".indicator");
    let currentIndex = 0;
    
    // Función Debounce para optimizar el redimensionamiento
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Inicializar y actualizar el carrusel
    function initializeCarousel() {
        const cardWidth = cards[0].offsetWidth;
        const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;
        const initialOffset = container.offsetWidth / 2 - cardWidth / 2;
        track.style.transform = `translateX(${initialOffset}px)`;
        updateCarousel();
    }

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove("is-active", "is-prev", "is-next");
            if (index === currentIndex) card.classList.add("is-active");
            else if (index === currentIndex - 1) card.classList.add("is-prev");
            else if (index === currentIndex + 1) card.classList.add("is-next");
        });
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === currentIndex);
        });
    }

    // Mover a una carta específica
    function moveToSlide(targetIndex) {
        if (targetIndex < 0 || targetIndex >= cards.length) return;
        const cardWidth = cards[0].offsetWidth;
        const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;
        const amountToMove = targetIndex * (cardWidth + cardMargin);
        const containerCenter = container.offsetWidth / 2;
        const cardCenter = cardWidth / 2;
        const targetTranslateX = containerCenter - cardCenter - amountToMove;
        track.style.transform = `translateX(${targetTranslateX - 25}px)`;
        currentIndex = targetIndex;
        updateCarousel();
    }

    // Event Listeners para botones e indicadores
    nextButton.addEventListener("click", () => {
        if (currentIndex + 1 < cards.length) moveToSlide(currentIndex + 1);
    });
    prevButton.addEventListener("click", () => {
        if (currentIndex - 1 >= 0) moveToSlide(currentIndex - 1);
    });
    indicators.forEach((indicator, index) => {
        indicator.addEventListener("click", () => moveToSlide(index));
    });

    // Navegación con teclado
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            if (currentIndex < cards.length - 1) moveToSlide(currentIndex + 1);
        } else if (e.key === "ArrowLeft") {
            if (currentIndex > 0) moveToSlide(currentIndex - 1);
        }
    });

    // Redimensionamiento de ventana
    window.addEventListener("resize", debounce(() => {
        initializeCarousel();
        moveToSlide(currentIndex);
    }, 250));

    // Inicialización final
    // Esperamos un momento para asegurar que todo esté cargado
    setTimeout(() => {
        initializeCarousel();
        moveToSlide(2); // Empieza en la carta del medio
    }, 100);
}