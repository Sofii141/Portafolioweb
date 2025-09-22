import { ContactFacade } from './contact/ContactFacade.js';

// --- INICIALIZACIÓN ---
// Se ejecuta una vez que el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    
    // Creamos una única instancia de nuestra Fachada.
    const facade = new ContactFacade();

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('contact-form');
    const formMessages = document.getElementById('form-messages');
    const contactList = document.getElementById('contact-list');
    const contactItemTemplate = document.getElementById('contact-item-template');
    const borrarTodoBtn = document.getElementById('borrar-todo-btn');

    // --- FUNCIONES ---

    /**
     * Renderiza la lista de contactos en el DOM.
     */
    function renderContactList() {
        // Limpiamos la lista actual para evitar duplicados.
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
            // Usamos la plantilla HTML para crear el elemento de la lista.
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
    
    /**
     * Valida el formulario y muestra mensajes de error.
     * @returns {boolean} - true si el formulario es válido, false en caso contrario.
     */
    function validateForm() {
        let isValid = true;
        // Limpiamos errores previos.
        form.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        form.querySelectorAll('.is-invalid').forEach(input => input.classList.remove('is-invalid'));
        
        // Función auxiliar para mostrar errores.
        const showError = (fieldId, message) => {
            isValid = false;
            const field = document.getElementById(fieldId);
            field.classList.add('is-invalid');
            const errorSpan = field.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-message')) {
                errorSpan.textContent = message;
            }
        };

        // Validaciones
        if (!form.nombre.value.trim()) showError('nombre', 'El nombre es obligatorio.');
        if (!form.email.value.trim()) {
            showError('email', 'El email es obligatorio.');
        } else if (!/^\S+@\S+\.\S+$/.test(form.email.value)) {
            showError('email', 'El formato del email no es válido.');
        }
        if (!form.motivo.value) showError('motivo', 'Debes seleccionar un motivo.');
        if (!form.mensaje.value.trim()) showError('mensaje', 'El mensaje es obligatorio.');
        if (!form.aceptaTerminos.checked) showError('aceptaTerminos', 'Debes aceptar los términos y condiciones.');

        return isValid;
    }

    /**
     * Muestra un mensaje de éxito o error general del formulario.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - 'success' o 'error'.
     */
    function showFormMessage(message, type = 'success') {
        formMessages.textContent = message;
        formMessages.className = `form-message ${type}`;
        // El mensaje desaparece después de 4 segundos.
        setTimeout(() => {
            formMessages.textContent = '';
            formMessages.className = 'form-message';
        }, 4000);
    }
    
    /**
     * Carga los datos de un contacto en el formulario para su edición.
     * @param {string} id - El ID del contacto a editar.
     */
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
            window.location.hash = '#contacto'; // Nos desplazamos a la sección de contacto.
        }
    }


    // --- MANEJADORES DE EVENTOS ---

    /**
     * Maneja el envío del formulario.
     */
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenimos el envío real del formulario.

        if (!validateForm()) {
            showFormMessage('Por favor, corrige los errores del formulario.', 'error');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // El checkbox no se incluye si no está marcado, lo manejamos manualmente.
        data.aceptaTerminos = form.aceptaTerminos.checked;

        const isUpdating = !!data.id;
        facade.guardarContacto(data);
        
        showFormMessage(isUpdating ? '¡Contacto actualizado con éxito!' : '¡Contacto guardado con éxito!', 'success');
        form.reset();
        form.querySelector('button[type="submit"]').textContent = 'Guardar Contacto';
        renderContactList();
    });
    
    /**
     * Maneja el clic en el botón de limpiar formulario.
     */
    form.addEventListener('reset', () => {
        form.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        form.querySelectorAll('.is-invalid').forEach(input => input.classList.remove('is-invalid'));
        form.querySelector('button[type="submit"]').textContent = 'Guardar Contacto';
        form.id.value = '';
    });

    /**
     * Maneja los clics en la lista de contactos (para editar o eliminar).
     * Usamos delegación de eventos para mayor eficiencia.
     */
    contactList.addEventListener('click', (event) => {
        const target = event.target;
        const contactItem = target.closest('.contact-item');
        if (!contactItem) return;

        const contactId = contactItem.dataset.id;

        if (target.classList.contains('edit-btn')) {
            editContact(contactId);
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
                facade.eliminarContacto(contactId);
                renderContactList();
                showFormMessage('Contacto eliminado.', 'success');
            }
        }
    });
    
    /**
     * Maneja el clic en el botón de "Borrar Todo".
     */
    borrarTodoBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres eliminar TODOS los contactos? Esta acción no se puede deshacer.')) {
            facade.borrarTodo();
            renderContactList();
            showFormMessage('Todos los contactos han sido eliminados.', 'success');
        }
    });

    // --- EJECUCIÓN INICIAL ---
    // Renderizamos la lista de contactos por primera vez al cargar la página.
    renderContactList();
});