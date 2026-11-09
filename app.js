<<<<<<< HEAD
// =========================================
// 1. State & LocalStorage (مدیریت داده‌ها)
// =========================================
let contacts = [];
let editingContactId = null;
let contactToDeleteId = null; // برای نگهداری ID مخاطبی که قرار است حذف شود

// وضعیت جستجو و مرتب‌سازی
let currentSearchQuery = '';
let currentSort = 'newest'; // پیش‌فرض: جدیدترین

// خواندن داده‌ها از حافظه مرورگر
function loadContacts() {
    const storedContacts = localStorage.getItem('contact_manager_data');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
}

// ذخیره داده‌ها در حافظه مرورگر
function saveContacts() {
    localStorage.setItem('contact_manager_data', JSON.stringify(contacts));
}

// =========================================
// 2. Utilities (ابزارهای کمکی)
// =========================================
// تولید تاریخ و ساعت شمسی
function getShamsiDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const persianDate = new Intl.DateTimeFormat('fa-IR', dateOptions).format(now);
    const time = new Intl.DateTimeFormat('fa-IR', timeOptions).format(now);
    return `${persianDate} - ${time}`;
}

// تبدیل حروف عربی به فارسی برای جستجوی دقیق‌تر (ي -> ی و ك -> ک)
function normalizePersianText(text) {
    if (!text) return '';
    return text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase().trim();
}

// =========================================
// 3. DOM Elements (عناصر صفحه)
// =========================================
const contactsList = document.getElementById('contacts-list');
const emptyState = document.getElementById('empty-state');
const template = document.getElementById('contact-row-template');

const contactModal = document.getElementById('contact-modal');
const deleteModal = document.getElementById('delete-modal');
const contactForm = document.getElementById('contact-form');
const modalTitle = document.getElementById('modal-title');

const nameInput = document.getElementById('contact-name');
const lastNameInput = document.getElementById('contact-lastname');
const phoneInput = document.getElementById('contact-phone');

const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// =========================================
// 4. Render Logic (نمایش، جستجو و مرتب‌سازی)
// =========================================
function renderContacts() {
    contactsList.innerHTML = '';

    // ۱. اعمال جستجو (Filter)
    let processedContacts = contacts.filter(contact => {
        const searchLower = normalizePersianText(currentSearchQuery);
        const fullName = normalizePersianText(`${contact.name} ${contact.lastName}`);
        return fullName.includes(searchLower);
    });

    // ۲. اعمال مرتب‌سازی (Sort)
    processedContacts.sort((a, b) => {
        if (currentSort === 'newest') {
            return Number(b.id) - Number(a.id); // ID از Date.now ساخته شده، پس زمان ثبت است
        } else if (currentSort === 'oldest') {
            return Number(a.id) - Number(b.id);
        } else if (currentSort === 'alphabetical') {
            // مرتب‌سازی الفبای فارسی با localeCompare
            return a.name.localeCompare(b.name, 'fa');
        }
        return 0;
    });

    // ۳. رندر کردن
    if (processedContacts.length === 0) {
        emptyState.style.display = 'block';
        if (currentSearchQuery !== '') {
            emptyState.querySelector('p').textContent = 'هیچ مخاطبی با این مشخصات یافت نشد.';
            emptyState.querySelector('.text-sm').textContent = 'عبارت دیگری را جستجو کنید.';
        } else {
            emptyState.querySelector('p').textContent = 'هنوز هیچ مخاطبی ثبت نشده است.';
            emptyState.querySelector('.text-sm').textContent = 'برای شروع، روی دکمه «افزودن مخاطب» کلیک کنید.';
        }
    } else {
        emptyState.style.display = 'none';
        
        processedContacts.forEach(contact => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.td-name').textContent = contact.name;
            clone.querySelector('.td-lastname').textContent = contact.lastName || '-';
            clone.querySelector('.td-phone').textContent = contact.phone;
            clone.querySelector('.td-date').textContent = contact.date;
            
            clone.querySelector('.btn-edit').dataset.id = contact.id;
            clone.querySelector('.btn-delete').dataset.id = contact.id;

            contactsList.appendChild(clone);
        });
    }
}

// =========================================
// 5. Form & Validation Logic (اعتبارسنجی فرم)
// =========================================
function validateForm() {
    let isValid = true;

    if (nameInput.value.trim() === '') {
        nameInput.classList.add('input-error');
        nameError.classList.add('show');
        isValid = false;
    } else {
        nameInput.classList.remove('input-error');
        nameError.classList.remove('show');
    }

    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        phoneInput.classList.add('input-error');
        phoneError.classList.add('show');
        isValid = false;
    } else {
        phoneInput.classList.remove('input-error');
        phoneError.classList.remove('show');
    }

    return isValid;
}

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contactData = {
        name: nameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        phone: phoneInput.value.trim(),
    };

    if (editingContactId) {
        const contactIndex = contacts.findIndex(c => c.id === editingContactId);
        if (contactIndex !== -1) {
            contacts[contactIndex] = { ...contacts[contactIndex], ...contactData };
        }
    } else {
        contacts.push({
            id: Date.now().toString(),
            ...contactData,
            date: getShamsiDateTime()
        });
    }

    saveContacts();
    renderContacts();
    closeModals();
});

// =========================================
// 6. Event Listeners (رویدادها)
// =========================================
const addContactBtn = document.getElementById('add-contact-btn');
const closeContactModal = document.getElementById('close-contact-modal');
const cancelContactBtn = document.getElementById('cancel-contact-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// جستجوی زمان واقعی (Real-time)
searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderContacts();
});

// مرتب‌سازی
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderContacts();
});

// افزودن مخاطب
addContactBtn.addEventListener('click', () => {
    editingContactId = null;
    contactForm.reset();
    nameInput.classList.remove('input-error');
    phoneInput.classList.remove('input-error');
    nameError.classList.remove('show');
    phoneError.classList.remove('show');
    modalTitle.textContent = 'افزودن مخاطب جدید';
    contactModal.classList.add('active');
});

// بستن مودال‌ها
const closeModals = () => {
    contactModal.classList.remove('active');
    deleteModal.classList.remove('active');
};

closeContactModal.addEventListener('click', closeModals);
cancelContactBtn.addEventListener('click', closeModals);
cancelDeleteBtn.addEventListener('click', closeModals);

window.addEventListener('click', (e) => {
    if (e.target === contactModal) closeModals();
    if (e.target === deleteModal) closeModals();
});

// مدیریت کلیک‌های داخل جدول (ویرایش و حذف)
contactsList.addEventListener('click', (e) => {
    // ویرایش
    if (e.target.classList.contains('btn-edit')) {
        const contactId = e.target.dataset.id;
        const contact = contacts.find(c => c.id === contactId);
        
        if (contact) {
            editingContactId = contact.id;
            modalTitle.textContent = 'ویرایش مخاطب';
            nameInput.value = contact.name;
            lastNameInput.value = contact.lastName;
            phoneInput.value = contact.phone;
            
            nameInput.classList.remove('input-error');
            phoneInput.classList.remove('input-error');
            nameError.classList.remove('show');
            phoneError.classList.remove('show');

            contactModal.classList.add('active');
        }
    }

    // حذف (باز کردن مودال تایید)
    if (e.target.classList.contains('btn-delete')) {
        contactToDeleteId = e.target.dataset.id;
        deleteModal.classList.add('active');
    }
});

// تایید نهایی حذف
confirmDeleteBtn.addEventListener('click', () => {
    if (contactToDeleteId) {
        contacts = contacts.filter(c => c.id !== contactToDeleteId);
        saveContacts();
        renderContacts();
        closeModals();
        contactToDeleteId = null;
    }
});

// =========================================
// 7. Initialization (راه‌اندازی)
// =========================================
function init() {
    loadContacts();
    renderContacts();
}

document.addEventListener('DOMContentLoaded', init);


// =========================================
// 9. Export to CSV (خروجی گرفتن CSV)
// =========================================
const exportCsvBtn = document.getElementById('export-csv-btn');

exportCsvBtn.addEventListener('click', () => {
    // اگر لیست خالی بود، کاری نکن
    if (contacts.length === 0) {
        alert('لیست مخاطبین شما خالی است. ابتدا مخاطب اضافه کنید.');
        return;
    }

    // ۱. تعریف هدرهای جدول
    const headers = ['نام', 'نام خانوادگی', 'شماره تلفن', 'تاریخ ثبت'];
    
    // ۲. تبدیل اطلاعات مخاطبین به آرایه‌های متنی
    const rows = contacts.map(contact => {
        // قرار دادن مقادیر داخل دابل کوتیشن برای جلوگیری از بهم ریختگی اگر کاما داشتند
        return [
            `"${contact.name || ''}"`,
            `"${contact.lastName || ''}"`,
            `"${contact.phone || ''}"`,
            `"${contact.date || ''}"`
        ].join(','); // جدا کردن با کاما
    });

    // ۳. ترکیب هدر و ردیف‌ها
    // استفاده از \uFEFF (BOM) برای اینکه اکسل زبان فارسی را درست نشان دهد
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

    // ۴. ساخت فایل و دانلود خودکار
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    // نام فایل به همراه تاریخ امروز (مثلاً contacts-2023-11-10.csv)
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `contacts-${today}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // آزادسازی حافظه
    URL.revokeObjectURL(url);
});

// =========================================
// 8. Dark Mode (حالت تاریک)
// =========================================
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
=======
// =========================================
// 1. State & LocalStorage (مدیریت داده‌ها)
// =========================================
let contacts = [];
let editingContactId = null;
let contactToDeleteId = null; // برای نگهداری ID مخاطبی که قرار است حذف شود

// وضعیت جستجو و مرتب‌سازی
let currentSearchQuery = '';
let currentSort = 'newest'; // پیش‌فرض: جدیدترین

// خواندن داده‌ها از حافظه مرورگر
function loadContacts() {
    const storedContacts = localStorage.getItem('contact_manager_data');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
}

// ذخیره داده‌ها در حافظه مرورگر
function saveContacts() {
    localStorage.setItem('contact_manager_data', JSON.stringify(contacts));
}

// =========================================
// 2. Utilities (ابزارهای کمکی)
// =========================================
// تولید تاریخ و ساعت شمسی
function getShamsiDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const persianDate = new Intl.DateTimeFormat('fa-IR', dateOptions).format(now);
    const time = new Intl.DateTimeFormat('fa-IR', timeOptions).format(now);
    return `${persianDate} - ${time}`;
}

// تبدیل حروف عربی به فارسی برای جستجوی دقیق‌تر (ي -> ی و ك -> ک)
function normalizePersianText(text) {
    if (!text) return '';
    return text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase().trim();
}

// =========================================
// 3. DOM Elements (عناصر صفحه)
// =========================================
const contactsList = document.getElementById('contacts-list');
const emptyState = document.getElementById('empty-state');
const template = document.getElementById('contact-row-template');

const contactModal = document.getElementById('contact-modal');
const deleteModal = document.getElementById('delete-modal');
const contactForm = document.getElementById('contact-form');
const modalTitle = document.getElementById('modal-title');

const nameInput = document.getElementById('contact-name');
const lastNameInput = document.getElementById('contact-lastname');
const phoneInput = document.getElementById('contact-phone');

const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// =========================================
// 4. Render Logic (نمایش، جستجو و مرتب‌سازی)
// =========================================
function renderContacts() {
    contactsList.innerHTML = '';

    // ۱. اعمال جستجو (Filter)
    let processedContacts = contacts.filter(contact => {
        const searchLower = normalizePersianText(currentSearchQuery);
        const fullName = normalizePersianText(`${contact.name} ${contact.lastName}`);
        return fullName.includes(searchLower);
    });

    // ۲. اعمال مرتب‌سازی (Sort)
    processedContacts.sort((a, b) => {
        if (currentSort === 'newest') {
            return Number(b.id) - Number(a.id); // ID از Date.now ساخته شده، پس زمان ثبت است
        } else if (currentSort === 'oldest') {
            return Number(a.id) - Number(b.id);
        } else if (currentSort === 'alphabetical') {
            // مرتب‌سازی الفبای فارسی با localeCompare
            return a.name.localeCompare(b.name, 'fa');
        }
        return 0;
    });

    // ۳. رندر کردن
    if (processedContacts.length === 0) {
        emptyState.style.display = 'block';
        if (currentSearchQuery !== '') {
            emptyState.querySelector('p').textContent = 'هیچ مخاطبی با این مشخصات یافت نشد.';
            emptyState.querySelector('.text-sm').textContent = 'عبارت دیگری را جستجو کنید.';
        } else {
            emptyState.querySelector('p').textContent = 'هنوز هیچ مخاطبی ثبت نشده است.';
            emptyState.querySelector('.text-sm').textContent = 'برای شروع، روی دکمه «افزودن مخاطب» کلیک کنید.';
        }
    } else {
        emptyState.style.display = 'none';
        
        processedContacts.forEach(contact => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.td-name').textContent = contact.name;
            clone.querySelector('.td-lastname').textContent = contact.lastName || '-';
            clone.querySelector('.td-phone').textContent = contact.phone;
            clone.querySelector('.td-date').textContent = contact.date;
            
            clone.querySelector('.btn-edit').dataset.id = contact.id;
            clone.querySelector('.btn-delete').dataset.id = contact.id;

            contactsList.appendChild(clone);
        });
    }
}

// =========================================
// 5. Form & Validation Logic (اعتبارسنجی فرم)
// =========================================
function validateForm() {
    let isValid = true;

    if (nameInput.value.trim() === '') {
        nameInput.classList.add('input-error');
        nameError.classList.add('show');
        isValid = false;
    } else {
        nameInput.classList.remove('input-error');
        nameError.classList.remove('show');
    }

    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        phoneInput.classList.add('input-error');
        phoneError.classList.add('show');
        isValid = false;
    } else {
        phoneInput.classList.remove('input-error');
        phoneError.classList.remove('show');
    }

    return isValid;
}

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contactData = {
        name: nameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        phone: phoneInput.value.trim(),
    };

    if (editingContactId) {
        const contactIndex = contacts.findIndex(c => c.id === editingContactId);
        if (contactIndex !== -1) {
            contacts[contactIndex] = { ...contacts[contactIndex], ...contactData };
        }
    } else {
        contacts.push({
            id: Date.now().toString(),
            ...contactData,
            date: getShamsiDateTime()
        });
    }

    saveContacts();
    renderContacts();
    closeModals();
});

// =========================================
// 6. Event Listeners (رویدادها)
// =========================================
const addContactBtn = document.getElementById('add-contact-btn');
const closeContactModal = document.getElementById('close-contact-modal');
const cancelContactBtn = document.getElementById('cancel-contact-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// جستجوی زمان واقعی (Real-time)
searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderContacts();
});

// مرتب‌سازی
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderContacts();
});

// افزودن مخاطب
addContactBtn.addEventListener('click', () => {
    editingContactId = null;
    contactForm.reset();
    nameInput.classList.remove('input-error');
    phoneInput.classList.remove('input-error');
    nameError.classList.remove('show');
    phoneError.classList.remove('show');
    modalTitle.textContent = 'افزودن مخاطب جدید';
    contactModal.classList.add('active');
});

// بستن مودال‌ها
const closeModals = () => {
    contactModal.classList.remove('active');
    deleteModal.classList.remove('active');
};

closeContactModal.addEventListener('click', closeModals);
cancelContactBtn.addEventListener('click', closeModals);
cancelDeleteBtn.addEventListener('click', closeModals);

window.addEventListener('click', (e) => {
    if (e.target === contactModal) closeModals();
    if (e.target === deleteModal) closeModals();
});

// مدیریت کلیک‌های داخل جدول (ویرایش و حذف)
contactsList.addEventListener('click', (e) => {
    // ویرایش
    if (e.target.classList.contains('btn-edit')) {
        const contactId = e.target.dataset.id;
        const contact = contacts.find(c => c.id === contactId);
        
        if (contact) {
            editingContactId = contact.id;
            modalTitle.textContent = 'ویرایش مخاطب';
            nameInput.value = contact.name;
            lastNameInput.value = contact.lastName;
            phoneInput.value = contact.phone;
            
            nameInput.classList.remove('input-error');
            phoneInput.classList.remove('input-error');
            nameError.classList.remove('show');
            phoneError.classList.remove('show');

            contactModal.classList.add('active');
        }
    }

    // حذف (باز کردن مودال تایید)
    if (e.target.classList.contains('btn-delete')) {
        contactToDeleteId = e.target.dataset.id;
        deleteModal.classList.add('active');
    }
});

// تایید نهایی حذف
confirmDeleteBtn.addEventListener('click', () => {
    if (contactToDeleteId) {
        contacts = contacts.filter(c => c.id !== contactToDeleteId);
        saveContacts();
        renderContacts();
        closeModals();
        contactToDeleteId = null;
    }
});

// =========================================
// 7. Initialization (راه‌اندازی)
// =========================================
function init() {
    loadContacts();
    renderContacts();
}

document.addEventListener('DOMContentLoaded', init);


// =========================================
// 9. Export to CSV (خروجی گرفتن CSV)
// =========================================
const exportCsvBtn = document.getElementById('export-csv-btn');

exportCsvBtn.addEventListener('click', () => {
    // اگر لیست خالی بود، کاری نکن
    if (contacts.length === 0) {
        alert('لیست مخاطبین شما خالی است. ابتدا مخاطب اضافه کنید.');
        return;
    }

    // ۱. تعریف هدرهای جدول
    const headers = ['نام', 'نام خانوادگی', 'شماره تلفن', 'تاریخ ثبت'];
    
    // ۲. تبدیل اطلاعات مخاطبین به آرایه‌های متنی
    const rows = contacts.map(contact => {
        // قرار دادن مقادیر داخل دابل کوتیشن برای جلوگیری از بهم ریختگی اگر کاما داشتند
        return [
            `"${contact.name || ''}"`,
            `"${contact.lastName || ''}"`,
            `"${contact.phone || ''}"`,
            `"${contact.date || ''}"`
        ].join(','); // جدا کردن با کاما
    });

    // ۳. ترکیب هدر و ردیف‌ها
    // استفاده از \uFEFF (BOM) برای اینکه اکسل زبان فارسی را درست نشان دهد
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

    // ۴. ساخت فایل و دانلود خودکار
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    // نام فایل به همراه تاریخ امروز (مثلاً contacts-2023-11-10.csv)
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `contacts-${today}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // آزادسازی حافظه
    URL.revokeObjectURL(url);
});

// =========================================
// 8. Dark Mode (حالت تاریک)
// =========================================
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
>>>>>>> master
});