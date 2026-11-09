import { normalizePersianText } from './utils.js';

// گرفتن المان‌ها
export const elements = {
    contactsList: document.getElementById('contacts-list'),
    emptyState: document.getElementById('empty-state'),
    template: document.getElementById('contact-row-template'),
    contactModal: document.getElementById('contact-modal'),
    deleteModal: document.getElementById('delete-modal'),
    contactForm: document.getElementById('contact-form'),
    modalTitle: document.getElementById('modal-title'),
    nameInput: document.getElementById('contact-name'),
    lastNameInput: document.getElementById('contact-lastname'),
    phoneInput: document.getElementById('contact-phone'),
    nameError: document.getElementById('name-error'),
    phoneError: document.getElementById('phone-error'),
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn')
};

export function renderContacts(contacts, currentSearchQuery, currentSort) {
    elements.contactsList.innerHTML = '';

    let processedContacts = contacts.filter(contact => {
        const searchLower = normalizePersianText(currentSearchQuery);
        const fullName = normalizePersianText(`${contact.name} ${contact.lastName}`);
        return fullName.includes(searchLower);
    });

    processedContacts.sort((a, b) => {
        if (currentSort === 'newest') return Number(b.id) - Number(a.id);
        if (currentSort === 'oldest') return Number(a.id) - Number(b.id);
        if (currentSort === 'alphabetical') return a.name.localeCompare(b.name, 'fa');
        return 0;
    });

    if (processedContacts.length === 0) {
        elements.emptyState.style.display = 'block';
        if (currentSearchQuery !== '') {
            elements.emptyState.querySelector('p').textContent = 'هیچ مخاطبی با این مشخصات یافت نشد.';
            elements.emptyState.querySelector('.text-sm').textContent = 'عبارت دیگری را جستجو کنید.';
        } else {
            elements.emptyState.querySelector('p').textContent = 'هنوز هیچ مخاطبی ثبت نشده است.';
            elements.emptyState.querySelector('.text-sm').textContent = 'برای شروع، روی دکمه «افزودن مخاطب» کلیک کنید.';
        }
    } else {
        elements.emptyState.style.display = 'none';
        processedContacts.forEach(contact => {
            const clone = elements.template.content.cloneNode(true);
            clone.querySelector('.td-name').textContent = contact.name;
            clone.querySelector('.td-lastname').textContent = contact.lastName || '-';
            clone.querySelector('.td-phone').textContent = contact.phone;
            clone.querySelector('.td-date').textContent = contact.date;
            clone.querySelector('.btn-edit').dataset.id = contact.id;
            clone.querySelector('.btn-delete').dataset.id = contact.id;
            elements.contactsList.appendChild(clone);
        });
    }
}

export function validateForm() {
    let isValid = true;
    if (elements.nameInput.value.trim() === '') {
        elements.nameInput.classList.add('input-error');
        elements.nameError.classList.add('show');
        isValid = false;
    } else {
        elements.nameInput.classList.remove('input-error');
        elements.nameError.classList.remove('show');
    }
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(elements.phoneInput.value)) {
        elements.phoneInput.classList.add('input-error');
        elements.phoneError.classList.add('show');
        isValid = false;
    } else {
        elements.phoneInput.classList.remove('input-error');
        elements.phoneError.classList.remove('show');
    }
    return isValid;
}