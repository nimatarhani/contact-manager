import { contacts, loadContacts, saveContacts } from './store.js';
import { getShamsiDateTime, downloadCSV } from './utils.js';
import { elements, renderContacts, validateForm } from './ui.js';

// وضعیت‌های UI
let editingContactId = null;
let contactToDeleteId = null;
let currentSearchQuery = '';
let currentSort = 'newest';

// بستن مودال‌ها
const closeModals = () => {
    elements.contactModal.classList.remove('active');
    elements.deleteModal.classList.remove('active');
};

// راه‌اندازی اولیه
function init() {
    loadContacts();
    renderContacts(contacts, currentSearchQuery, currentSort);
    initTheme();
}

document.addEventListener('DOMContentLoaded', init);

// ================= رویدادهای جستجو و مرتب‌سازی =================
elements.searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderContacts(contacts, currentSearchQuery, currentSort);
});

elements.sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderContacts(contacts, currentSearchQuery, currentSort);
});

// ================= فرم و ذخیره =================
elements.contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contactData = {
        name: elements.nameInput.value.trim(),
        lastName: elements.lastNameInput.value.trim(),
        phone: elements.phoneInput.value.trim(),
    };

    if (editingContactId) {
        const index = contacts.findIndex(c => c.id === editingContactId);
        if (index !== -1) {
            contacts[index] = { ...contacts[index], ...contactData };
        }
    } else {
        contacts.push({ id: Date.now().toString(), ...contactData, date: getShamsiDateTime() });
    }

    saveContacts();
    renderContacts(contacts, currentSearchQuery, currentSort);
    closeModals();
});

// ================= دکمه‌های مودال و حذف =================
document.getElementById('add-contact-btn').addEventListener('click', () => {
    editingContactId = null;
    elements.contactForm.reset();
    elements.nameInput.classList.remove('input-error');
    elements.phoneInput.classList.remove('input-error');
    elements.nameError.classList.remove('show');
    elements.phoneError.classList.remove('show');
    elements.modalTitle.textContent = 'افزودن مخاطب جدید';
    elements.contactModal.classList.add('active');
});

document.getElementById('close-contact-modal').addEventListener('click', closeModals);
document.getElementById('cancel-contact-btn').addEventListener('click', closeModals);
document.getElementById('cancel-delete-btn').addEventListener('click', closeModals);

window.addEventListener('click', (e) => {
    if (e.target === elements.contactModal) closeModals();
    if (e.target === elements.deleteModal) closeModals();
});

// ================= تفویض رویداد (Event Delegation) برای جدول =================
elements.contactsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit')) {
        const contactId = e.target.dataset.id;
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            editingContactId = contact.id;
            elements.modalTitle.textContent = 'ویرایش مخاطب';
            elements.nameInput.value = contact.name;
            elements.lastNameInput.value = contact.lastName;
            elements.phoneInput.value = contact.phone;
            elements.nameInput.classList.remove('input-error');
            elements.phoneInput.classList.remove('input-error');
            elements.nameError.classList.remove('show');
            elements.phoneError.classList.remove('show');
            elements.contactModal.classList.add('active');
        }
    }

    if (e.target.classList.contains('btn-delete')) {
        contactToDeleteId = e.target.dataset.id;
        elements.deleteModal.classList.add('active');
    }
});

elements.confirmDeleteBtn.addEventListener('click', () => {
    if (contactToDeleteId) {
        // چون contacts از store.js ایمپورت شده (یک آرایه است)، مستقیماً تغییرش می‌دهیم
        for (let i = contacts.length - 1; i >= 0; i--) {
            if (contacts[i].id === contactToDeleteId) {
                contacts.splice(i, 1);
                break;
            }
        }
        saveContacts();
        renderContacts(contacts, currentSearchQuery, currentSort);
        closeModals();
        contactToDeleteId = null;
    }
});

// ================= خروجی CSV =================
document.getElementById('export-csv-btn').addEventListener('click', () => {
    downloadCSV(contacts);
});

// ================= تم تاریک/روشن =================
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        bodyElement.classList.add('dark');
        themeToggleBtn.textContent = '☀️';
    } else {
        themeToggleBtn.textContent = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
        bodyElement.classList.toggle('dark');
        if (bodyElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        }
    });
}