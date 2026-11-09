export function getShamsiDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const persianDate = new Intl.DateTimeFormat('fa-IR', dateOptions).format(now);
    const time = new Intl.DateTimeFormat('fa-IR', timeOptions).format(now);
    return `${persianDate} - ${time}`;
}

export function normalizePersianText(text) {
    if (!text) return '';
    return text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase().trim();
}

export function downloadCSV(contacts) {
    if (contacts.length === 0) {
        alert('لیست مخاطبین شما خالی است. ابتدا مخاطب اضافه کنید.');
        return;
    }
    const headers = ['نام', 'نام خانوادگی', 'شماره تلفن', 'تاریخ ثبت'];
    const rows = contacts.map(contact => {
        return [
            `"${contact.name || ''}"`,
            `"${contact.lastName || ''}"`,
            `"${contact.phone || ''}"`,
            `"${contact.date || ''}"`
        ].join(',');
    });
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `contacts-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}