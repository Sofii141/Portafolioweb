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