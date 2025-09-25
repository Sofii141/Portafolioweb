/**
 * =================================================================
 * Archivo de Aplicación Unificado (app.js)
 * -----------------------------------------------------------------
 * Este script combina toda la lógica de JavaScript del portafolio
 * para evitar errores de CORS al abrir el archivo index.html
 * directamente en el navegador (protocolo file://).
 *
 * Contiene:
 * 1. Modelos de Datos (Contacto)
 * 2. Lógica de Persistencia (ContactRepository)
 * 3. Fachada de Negocio (ContactFacade)
 * 4. Lógica de la sección de Contacto (antes contacto.js)
 * 5. Lógica de interacción global del sitio (antes script.js)
 * =================================================================
 */

// =================================================================
// 1. CLASE Contacto (Modelo)
// Representa la estructura de un contacto.
// =================================================================
class Contacto {
    /**
     * @param {object} data - Un objeto con los datos del contacto.
     */
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.nombre = data.nombre;
        this.email = data.email;
        this.telefono = data.telefono;
        this.motivo = data.motivo;
        this.mensaje = data.mensaje;
        this.aceptaTerminos = data.aceptaTerminos;
        this.preferenciaContacto = data.preferenciaContacto;
        const ahora = new Date().toISOString();
        this.fechaCreacion = data.fechaCreacion || ahora;
        this.fechaActualizacion = ahora;
    }
}

// =================================================================
// 2. CLASE ContactRepository (Persistencia)
// Gestiona la interacción con el localStorage.
// =================================================================
class ContactRepository {
    constructor() {
        this._storageKey = 'contactosSinFramework';
    }

    _readStorage() {
        const data = localStorage.getItem(this._storageKey);
        return data ? JSON.parse(data) : [];
    }

    _writeStorage(contacts) {
        localStorage.setItem(this._storageKey, JSON.stringify(contacts));
    }

    getAll() {
        return this._readStorage();
    }

    getById(id) {
        const contacts = this._readStorage();
        return contacts.find(contact => contact.id === id);
    }

    add(contact) {
        const contacts = this._readStorage();
        contacts.push(contact);
        this._writeStorage(contacts);
    }

    update(updatedContact) {
        let contacts = this._readStorage();
        contacts = contacts.map(contact =>
            contact.id === updatedContact.id ? updatedContact : contact
        );
        this._writeStorage(contacts);
    }

    remove(id) {
        let contacts = this._readStorage();
        contacts = contacts.filter(contact => contact.id !== id);
        this._writeStorage(contacts);
    }

    clear() {
        localStorage.removeItem(this._storageKey);
    }
}

// =================================================================
// 3. CLASE ContactFacade (Fachada)
// Proporciona una interfaz simple para la UI.
// =================================================================
class ContactFacade {
    constructor() {
        this._repository = new ContactRepository();
    }

    guardarContacto(formData) {
        if (formData.id) {
            const contactoExistente = this._repository.getById(formData.id);
            if (!contactoExistente) {
                console.error(`Error: No se encontró un contacto con el ID ${formData.id} para actualizar.`);
                return;
            }
            const datosActualizados = {
                ...formData,
                fechaCreacion: contactoExistente.fechaCreacion,
            };
            const contactoActualizado = new Contacto(datosActualizados);
            this._repository.update(contactoActualizado);
        } else {
            const nuevoContacto = new Contacto(formData);
            this._repository.add(nuevoContacto);
        }
    }

    listarContactos() {
        return this._repository.getAll();
    }

    eliminarContacto(id) {
        this._repository.remove(id);
    }

    borrarTodo() {
        this._repository.clear();
    }

    obtenerContactoParaEditar(id) {
        return this._repository.getById(id);
    }
}


// =================================================================
// 4. LÓGICA DE INTERACCIÓN GLOBAL (antes script.js)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN Y REFERENCIAS GLOBALES ---
    const header = document.getElementById('main-header');
    const mainContainer = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.fullscreen-section');
    const body = document.body;
    const inicioSection = document.querySelector('#inicio');

    // --- LÓGICA DE INTERACCIÓN GENERAL Y SCROLL ---
    const checkNebulaVisibility = () => {
        if (mainContainer.scrollTop > inicioSection.offsetHeight - 50) {
            body.classList.add('nebula-visible');
        } else {
            body.classList.remove('nebula-visible');
        }
    };

    const handleMainScroll = () => {
        if (mainContainer.scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let currentSectionId = '';
        sections.forEach(section => {
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
        
        checkNebulaVisibility();
    };

    mainContainer.addEventListener('scroll', handleMainScroll);

    // --- LÓGICA DEL SLIDER DE LA SECCIÓN DE INICIO ---
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

    // --- ANIMACIONES DE ENTRADA AL HACER SCROLL (INTERSECTION OBSERVER) ---
    const animatedElements = document.querySelectorAll('.study-card, .carousel-container, .project-card, .form-column, .list-column');
    
    const observerOptions = {
        root: mainContainer,
        rootMargin: '0px',
        threshold: 0.25
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => animationObserver.observe(el));

    // --- LÓGICA DEL CARRUSEL 3D DE LA SECCIÓN DE PASATIEMPOS ---
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

        setTimeout(() => {
            initializeCarousel();
            moveToSlide(2);
        }, 100);
    }

    // --- LÓGICA DE INTERACCIÓN 3D DE LAS TARJETAS DE PROYECTOS ---
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
    
    // --- EJECUCIÓN INICIAL ---
    checkNebulaVisibility();
});


// =================================================================
// 5. LÓGICA DE LA SECCIÓN DE CONTACTO (antes contacto.js)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN Y REFERENCIAS AL DOM ---
    const facade = new ContactFacade();
    const form = document.getElementById('contact-form');
    if (!form) return; // Si no estamos en una página con el formulario, no hacemos nada.
    
    const fieldsToValidate = form.querySelectorAll('input[required], select[required], textarea[required]');
    const contactList = document.getElementById('contact-list');
    const contactItemTemplate = document.getElementById('contact-item-template');
    const borrarTodoBtn = document.getElementById('borrar-todo-btn');
    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    let toastTimeout;

    // --- LÓGICA DE RENDERIZADO Y MANIPULACIÓN DEL DOM ---
    function renderContactList() {
        contactList.innerHTML = '';
        const contacts = facade.listarContactos();

        if (contacts.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No hay contactos guardados.';
            li.classList.add('empty-message');
            contactList.appendChild(li);
            return;
        }

        contacts.forEach(contact => {
            const clone = contactItemTemplate.content.cloneNode(true);
            const li = clone.querySelector('.contact-item');
            
            li.dataset.id = contact.id;
            clone.querySelector('.contact-name').textContent = contact.nombre;
            clone.querySelector('.contact-email').textContent = contact.email;
            clone.querySelector('.contact-phone').textContent = contact.telefono || 'N/A';
            
            const fecha = new Date(contact.fechaActualizacion);
            clone.querySelector('.contact-date').textContent = `Última act.: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;

            contactList.appendChild(clone);
        });
    }

    function editContact(id) {
        const contact = facade.obtenerContactoParaEditar(id);
        if (contact) {
            form.id.value = contact.id;
            form.nombre.value = contact.nombre;
            form.email.value = contact.email;
            form.telefono.value = contact.telefono;
            form.motivo.value = contact.motivo;
            form.mensaje.value = contact.mensaje;
            form.aceptaTerminos.checked = contact.aceptaTerminos;
            form.querySelector(`input[name="preferenciaContacto"][value="${contact.preferenciaContacto}"]`).checked = true;
            
            form.querySelector('button[type="submit"]').textContent = 'Actualizar Contacto';
            window.location.hash = '#contacto';
        }
    }

    // --- LÓGICA DE VALIDACIÓN DEL FORMULARIO ---
    function showFieldError(field, message) {
        field.classList.add('is-invalid');
        const errorSpan = field.closest('.form-group').querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = message;
    }

    function clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorSpan = field.closest('.form-group').querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = '';
    }

    function validateField(field) {
        clearFieldError(field);
        let isValid = true;

        if (field.type === 'checkbox') {
            if (!field.checked) {
                showFieldError(field, 'Debes aceptar los términos y condiciones.');
                isValid = false;
            }
        } else {
            const value = field.value.trim();
            if (!value) {
                showFieldError(field, 'Este campo es obligatorio.');
                isValid = false;
            } else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
                showFieldError(field, 'El formato del email no es válido.');
                isValid = false;
            } else if (field.id === 'telefono' && !/^\d{10}$/.test(value)) {
                showFieldError(field, 'El teléfono debe contener 10 dígitos.');
                isValid = false;
            }
        }
        return isValid;
    }

    function validateForm() {
        let isFormValid = true;
        fieldsToValidate.forEach(field => {
            if (!validateField(field)) isFormValid = false;
        });
        return isFormValid;
    }

    // --- COMPONENTES DE UI (TOAST Y MODAL) ---
    function showToast(message, type = 'info') {
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;

        toast.className = '';
        toastIcon.className = 'fas';

        if (type === 'success') {
            toast.classList.add('success');
            toastIcon.classList.add('fa-check-circle');
        } else if (type === 'error') {
            toast.classList.add('error');
            toastIcon.classList.add('fa-exclamation-circle');
        } else {
            toastIcon.classList.add('fa-info-circle');
        }

        toast.classList.add('show');
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 4000);
    }

    function showConfirmationModal(message) {
        return new Promise(resolve => {
            modalMessage.textContent = message;
            modalOverlay.classList.remove('hidden');

            const cleanup = () => {
                modalConfirmBtn.removeEventListener('click', handleConfirm);
                modalCancelBtn.removeEventListener('click', handleCancel);
            };

            const handleConfirm = () => {
                modalOverlay.classList.add('hidden');
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                modalOverlay.classList.add('hidden');
                cleanup();
                resolve(false);
            };

            modalConfirmBtn.addEventListener('click', handleConfirm);
            modalCancelBtn.addEventListener('click', handleCancel);
        });
    }

    // --- MANEJADORES DE EVENTOS ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateForm()) {
            showToast('Por favor, corrige los errores del formulario.', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.aceptaTerminos = form.aceptaTerminos.checked;
        
        const isUpdating = !!data.id;
        facade.guardarContacto(data);
        
        showToast(isUpdating ? '¡Contacto actualizado con éxito!' : '¡Contacto guardado con éxito!', 'success');
        form.reset();
        renderContactList();
    });

    form.addEventListener('reset', () => {
        fieldsToValidate.forEach(field => clearFieldError(field));
        form.querySelector('button[type="submit"]').textContent = 'Guardar Contacto';
        form.id.value = '';
    });

    fieldsToValidate.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
    });

    contactList.addEventListener('click', async (event) => {
        const target = event.target;
        const contactItem = target.closest('.contact-item');
        if (!contactItem) return;

        const contactId = contactItem.dataset.id;

        if (target.classList.contains('edit-btn')) {
            editContact(contactId);
        }

        if (target.classList.contains('delete-btn')) {
            const confirmed = await showConfirmationModal('¿Estás seguro de que quieres eliminar este contacto?');
            if (confirmed) {
                facade.eliminarContacto(contactId);
                renderContactList();
                showToast('Contacto eliminado.', 'success');
            }
        }
    });

    borrarTodoBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmationModal('¿Estás seguro de que quieres eliminar TODOS los contactos? Esta acción no se puede deshacer.');
        if (confirmed) {
            facade.borrarTodo();
            renderContactList();
            showToast('Todos los contactos han sido eliminados.', 'success');
        }
    });

    // --- EJECUCIÓN INICIAL ---
    renderContactList();
});