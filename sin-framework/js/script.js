document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN Y REFERENCIAS GLOBALES ---
    const header = document.getElementById('main-header');
    const mainContainer = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.fullscreen-section');

    // --- 2. LÓGICA DE NAVBAR Y SCROLLSPY ---
    // Agrega un fondo a la barra de navegación al hacer scroll.
    mainContainer.addEventListener('scroll', () => {
        if (mainContainer.scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Resalta el enlace activo en la barra de navegación según la sección visible.
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

    // --- 3. LÓGICA DE LA SECCIÓN DE INICIO (SLIDER) ---
    const slider = document.querySelector('#inicio .slider');
    if (slider) {
        const nextBtn = document.querySelector('#inicio .next');
        const prevBtn = document.querySelector('#inicio .prev');
        const overlay = document.querySelector('#inicio .transition-overlay');

        let isAnimating = false;
        const animationDuration = 1000;
        const fadeOutDuration = 300;

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
                        slider.appendChild(activeItem);
                    } else {
                        const lastItem = items[items.length - 1];
                        slider.prepend(lastItem);
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

    // --- 4. LÓGICA GENERAL DE ANIMACIONES AL HACER SCROLL ---
    // Este observador se encarga de animar CUALQUIER elemento con la clase adecuada.
    const animatedElements = document.querySelectorAll('.study-card, .carousel-container, .project-card, .form-column, .list-column');
    
    const observerOptions = {
        root: mainContainer, // Observamos el scroll dentro del <main>
        rootMargin: '0px',
        threshold: 0.25 // La animación se dispara cuando el 25% del elemento es visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Dejamos de observarlo para mejorar rendimiento
            }
        });
    };

    const animationObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // --- 5. LÓGICA DE LA SECCIÓN DE PASATIEMPOS (CARRUSEL) ---
    const hobbiesSection = document.querySelector("#pasatiempos");
    const track = hobbiesSection ? hobbiesSection.querySelector(".carousel-track") : null;

    if (track) {
        const cards = Array.from(track.children);
        const nextButton = hobbiesSection.querySelector(".carousel-button.next");
        const prevButton = hobbiesSection.querySelector(".carousel-button.prev");
        const container = hobbiesSection.querySelector(".carousel-container");
        const indicators = hobbiesSection.querySelectorAll(".indicator");
        let currentIndex = 0;

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

        const initializeCarousel = () => {
            const cardWidth = cards[0].offsetWidth;
            const containerCenter = container.offsetWidth / 2;
            const cardCenter = cardWidth / 2;
            const initialOffset = containerCenter - cardCenter;
            track.style.transform = `translateX(${initialOffset}px)`;
            moveToSlide(currentIndex);
        };
        
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

        const moveToSlide = (targetIndex) => {
            if (targetIndex < 0 || targetIndex >= cards.length) return;
            const cardWidth = cards[0].offsetWidth;
            const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) + parseInt(window.getComputedStyle(cards[0]).marginLeft);
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

        // Inicialización del carrusel
        setTimeout(() => {
            initializeCarousel();
            moveToSlide(2); // Inicia en la tarjeta del medio
        }, 100);
    }

     // --- 6. LÓGICA DE TARJETAS DE PROYECTO INTERACTIVAS ---
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Para el efecto de resplandor
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);

            // Para el efecto de inclinación 3D
            const rotateX = (rect.height / 2 - y) / 20; // Ajusta el divisor para más/menos inclinación
            const rotateY = (x - rect.width / 2) / 20;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            // Resetea la inclinación al salir
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1) translateY(0)';
        });
    });
});