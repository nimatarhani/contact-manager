export let contacts = [];

export function loadContacts() {
    const storedContacts = localStorage.getItem('contact_manager_data');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
}

export function saveContacts() {
    localStorage.setItem('contact_manager_data', JSON.stringify(contacts));
}