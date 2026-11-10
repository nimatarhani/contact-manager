# 📇 Contact Manager

A modern, fast, and fully responsive web application for managing contacts, built entirely with **Vanilla JavaScript** without any external frameworks or libraries. This project focuses on performance, code readability, and an excellent User Experience (UX).

## ✨ Key Features

- **Full Contact Management (CRUD):** Add, edit, and delete contacts using beautiful custom modals.
- **Smart Real-time Search:** Search by first or last name with built-in normalization for Persian/Arabic characters (e.g., converting Arabic 'ي' to Persian 'ی' and 'ك' to 'ک').
- **Advanced Sorting:** Sort the contact list by newest, oldest, and Persian alphabetical order.
- **Dark/Light Mode:** Full theme support with the user's preference saved in the browser's `localStorage`.
- **CSV Export:** Export contact lists to CSV with UTF-8 BOM support (ensures correct rendering of Persian characters in Microsoft Excel).
- **Persian Date & Time:** Automatically generates the registration date and time for each contact using `Intl.DateTimeFormat`.
- **RTL & Responsive Design:** Utilizes the Vazirmatn font and is fully optimized for mobile, tablet, and desktop screens.
- **Zero Dependencies:** No React, Vue, jQuery, or any other third-party libraries.
- **Modular Architecture:** JS and CSS are split into smaller, highly maintainable modules.

## 🛠 Technologies Used

- **HTML5** (Semantic markup)
- **CSS3** (CSS Variables, Flexbox, Media Queries, Animations)
- **Vanilla JavaScript (ES6+)** (ES Modules, State Management, Event Delegation)
- **LocalStorage** (Client-side data persistence)

## 📁 Project Structure

```text
contact-manager/
│
├── index.html              # Main HTML file
├── style.css               # Main CSS file (imports all partials)
├── README.md               # Project documentation
│
├── css/                    # Modular CSS files
│   ├── variables.css       # Color tokens and theme settings
│   ├── base.css            # CSS Reset and base body styles
│   ├── components.css      # Buttons, Table, Modals, and Forms
│   └── responsive.css      # Mobile-specific media queries
│
└── js/                     # Modular JavaScript files
    ├── app.js              # Entry point and Event Listeners
    ├── store.js            # State management and LocalStorage logic
    ├── ui.js               # DOM rendering and Form validation
    └── utils.js            # Utility functions (Persian Date, CSV Export, etc.)
