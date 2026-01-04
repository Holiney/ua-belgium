import React, { useState, useEffect, useCallback } from "react";
// Вставте сюди URL, який ви отримали на кроці 7
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzgovsIQyZPGdeWR-x4UBuoJRNtSM7n3Q7QYDWg2VTdRuR2RrmXSrriV7Uw8a82FmMc9Q/exec";
// === Повна локалізація ===
const translations = {
  ua: {
    // Основні
    appTitle: "Статистика роботи",
    appDesc: "Збір даних по персоналу, транспорту та канцелярії",
    chooseTask: "Оберіть завдання:",
    personnel: "Персонал",
    bikes: "Велосипеди",
    office: "Канцелярія",
    history: "Історія",
    settings: "Налаштування",

    // Дії
    save: "Зберегти",
    edit: "Редагувати",
    copy: "Копіювати",
    copied: "Скопійовано!",
    delete: "Видалити",
    export: "Експорт",
    install: "Встановити",
    view: "Переглянути",
    ok: "ОК",

    // Статуси
    noData: "Немає збережених даних",
    noDataToSave: "Немає даних для збереження",
    dataEmpty: "Введіть хоча б одне значення",
    dataSaved: "Дані збережено в історію!",
    dataSavedToday: "Дані збережено на сьогодні",
    editMode: "Режим редагування активовано",
    successSent: "Успішно надіслано!",
    error: "Помилка",
    dataDeleted: "Дані видалено",
    dataExported: "Дані експортовано",

    // Форми
    units: "одиниць",
    add: "Додати",
    subtract: "Відняти",

    // Task 1
    personnelByZones: "Персонал по зонах",
    cars: "Автомобілі",
    totalCars: "Всього автомобілів",
    workersCount: "Кількість працівників в",
    carsCount: "Кількість автомобілів",

    // Task 2
    bikesAndTransport: "Велосипеди та транспорт",
    quantity: "Кількість",

    // Task 3
    officeSupplies: "Канцелярські товари",
    room: "Кімната",

    // Історія
    historyTitle: "Історія збережених даних",
    recordsFound: "Знайдено записів",
    historyEmpty: "Історія порожня",
    saveDataPrompt: "Збережіть дані в одному з завдань, щоб вони з'явились тут",
    detailedView: "Детальний перегляд даних",
    deleteConfirm: "Видалити всі дані за",

    // PWA
    pwaInstall: "Встановити додаток",
    pwaInstallDesc: "Для кращого досвіду роботи",
    pwaStatus: "PWA Статус",
    online: "Онлайн",
    offline: "Офлайн",
    installed: "Встановлено",
    inBrowser: "В браузері",
    vibration: "Вібрація",
    localStorage: "Локальне збереження",

    // Налаштування
    language: "Мова",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Тема",
    light: "Світла",
    dark: "Темна",
    purple: "Фіолетова",
    vibrationSetting: "Вібрація",
    vibrationOn: "Увімкнено",
    vibrationOff: "Вимкнено",
  },

  en: {
    // Basic
    appTitle: "Work Statistics",
    appDesc: "Data collection for staff, transport and office supplies",
    chooseTask: "Choose a task:",
    personnel: "Personnel",
    bikes: "Bikes",
    office: "Office",
    history: "History",
    settings: "Settings",

    // Actions
    save: "Save",
    edit: "Edit",
    copy: "Copy",
    copied: "Copied!",
    delete: "Delete",
    export: "Export",
    install: "Install",
    view: "View",
    ok: "OK",

    // Statuses
    noData: "No saved data",
    noDataToSave: "No data to save",
    dataEmpty: "Enter at least one value",
    dataSaved: "Data saved to history!",
    dataSavedToday: "Data saved for today",
    editMode: "Edit mode activated",
    successSent: "Successfully sent!",
    error: "Error",
    dataDeleted: "Data deleted",
    dataExported: "Data exported",

    // Forms
    units: "units",
    add: "Add",
    subtract: "Subtract",

    // Task 1
    personnelByZones: "Personnel by zones",
    cars: "Cars",
    totalCars: "Total cars",
    workersCount: "Number of workers in",
    carsCount: "Number of cars",

    // Task 2
    bikesAndTransport: "Bikes and transport",
    quantity: "Quantity",

    // Task 3
    officeSupplies: "Office supplies",
    room: "Room",

    // History
    historyTitle: "Saved data history",
    recordsFound: "Records found",
    historyEmpty: "History is empty",
    saveDataPrompt: "Save data in one of the tasks to see it here",
    detailedView: "Detailed data view",
    deleteConfirm: "Delete all data for",

    // PWA
    pwaInstall: "Install app",
    pwaInstallDesc: "For better experience",
    pwaStatus: "PWA Status",
    online: "Online",
    offline: "Offline",
    installed: "Installed",
    inBrowser: "In browser",
    vibration: "Vibration",
    localStorage: "Local storage",

    // Settings
    language: "Language",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    purple: "Purple",
    vibrationSetting: "Vibration",
    vibrationOn: "On",
    vibrationOff: "Off",
  },

  nl: {
    // Basis
    appTitle: "Werkstatistieken",
    appDesc: "Gegevens verzamelen over personeel, vervoer en kantoorartikelen",
    chooseTask: "Kies een taak:",
    personnel: "Personeel",
    bikes: "Fietsen",
    office: "Kantoor",
    history: "Geschiedenis",
    settings: "Instellingen",

    // Acties
    save: "Opslaan",
    edit: "Bewerken",
    copy: "Kopiëren",
    copied: "Gekopieerd!",
    delete: "Verwijderen",
    export: "Exporteren",
    install: "Installeren",
    view: "Bekijken",
    ok: "OK",

    // Statussen
    noData: "Geen opgeslagen gegevens",
    noDataToSave: "Geen gegevens om op te slaan",
    dataEmpty: "Voer minimaal één waarde in",
    dataSaved: "Gegevens opgeslagen in geschiedenis!",
    dataSavedToday: "Gegevens opgeslagen voor vandaag",
    editMode: "Bewerkingsmodus geactiveerd",
    successSent: "Succesvol verzonden!",
    error: "Fout",
    dataDeleted: "Gegevens verwijderd",
    dataExported: "Gegevens geëxporteerd",

    // Formulieren
    units: "eenheden",
    add: "Toevoegen",
    subtract: "Aftrekken",

    // Taak 1
    personnelByZones: "Personeel per zone",
    cars: "Auto's",
    totalCars: "Totaal auto's",
    workersCount: "Aantal werknemers in",
    carsCount: "Aantal auto's",

    // Taak 2
    bikesAndTransport: "Fietsen en vervoer",
    quantity: "Hoeveelheid",

    // Taak 3
    officeSupplies: "Kantoorartikelen",
    room: "Kamer",

    // Geschiedenis
    historyTitle: "Geschiedenis opgeslagen gegevens",
    recordsFound: "Records gevonden",
    historyEmpty: "Geschiedenis is leeg",
    saveDataPrompt: "Sla gegevens op in een van de taken om ze hier te zien",
    detailedView: "Gedetailleerde wegave",
    deleteConfirm: "Verwijder alle gegevens voor",

    // PWA
    pwaInstall: "App installeren",
    pwaInstallDesc: "Voor een betere ervaring",
    pwaStatus: "PWA Status",
    online: "Online",
    offline: "Offline",
    installed: "Geïnstalleerd",
    inBrowser: "In browser",
    vibration: "Trillen",
    localStorage: "Lokale opslag",

    // Settings
    language: "Taal",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Thema",
    light: "Licht",
    dark: "Donker",
    purple: "Paars",
    vibrationSetting: "Trillen",
    vibrationOn: "Aan",
    vibrationOff: "Uit",
  },
};

// Helper function for translations
const t = (lang, key) => translations[lang]?.[key] || key;

// Constants
const PERSONNEL_ZONES = [
  "Zone 220",
  "Zone 230",
  "Zone 240",
  "Zone 250",
  "Zone 260",
  "Zone 440",
  "Zone 520",
];

const BIKE_TYPES = [
  "Kinderzitje",
  "Buitenformaat",
  "Op te hangen",
  "Op te laden",
  "Steps",
  "Standaardfietsen",
  "MPA",
  "MV",
  "6A",
];

const PRINT_ITEMS = [
  "EK 1",
  "EK 2",
  "EK 3",
  "EK 4",
  "EK 5",
  "EK 6",
  "EK 7A",
  "EK 7B",
  "EK 7C",
  "EK 8A",
  "EK 8B",
  "EK 8C",
  "EK 9A",
  "EK 9B",
  "EK 9C",
  "EK 10A",
  "EK 10B",
  "EK 11A",
  "EK 11B",
  "EK 12",
  "EK 13",
  "EK 14",
  "EK 15",
  "EK 16",
  "EK 17",
  "EK 18",
  "EK 19",
];

const PRINT_ROOMS = ["50", "140", "162", "220", "250", "340", "422", "463"];

// Vibration patterns
const VIBRATION_PATTERNS = {
  counterIncrease: [20],
  counterDecrease: [50],
  success: [100, 50, 100],
  error: [200, 100, 200],
  delete: [200, 100, 200],
};

// Vibration helper function
const vibrateDevice = (pattern) => {
  const isVibrationEnabled = loadFromStorage("app-vibration-enabled", true);
  if (isVibrationEnabled && "vibrate" in navigator) {
    if (typeof pattern === "string" && VIBRATION_PATTERNS[pattern]) {
      navigator.vibrate(VIBRATION_PATTERNS[pattern]);
    } else if (Array.isArray(pattern) || typeof pattern === "number") {
      navigator.vibrate(pattern);
    }
  }
};

// Storage helpers
const loadFromStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    // Use nullish coalescing to handle null or undefined data
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Error loading from storage:", e);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
};

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const formatDate = (dateStr, lang = "ua") => {
  const date = new Date(dateStr);
  const locale = lang === "ua" ? "uk-UA" : lang === "nl" ? "nl-NL" : "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getAllSavedDates = () => {
  const dates = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Оновлена логіка для фільтрації ключів історії
    if (
      key &&
      (key.includes("task1-personnel-data-") ||
        key.includes("task1-cars-data-") ||
        key.includes("task2-bikes-data-") ||
        key.includes("task3-data-"))
    ) {
      const match = key.match(/-data-(\d{4}-\d{2}-\d{2})/);
      if (match) {
        dates.add(match[1]);
      }
    }
  }
  return Array.from(dates).sort().reverse();
};

const getDataForDate = (date, task) => {
  const data = {};

  if (task === "task1") {
    data.personnel = loadFromStorage(`task1-personnel-data-${date}`, {});
    data.cars = loadFromStorage(`task1-cars-data-${date}`, 0);
  } else if (task === "task2") {
    data.bikes = loadFromStorage(`task2-bikes-data-${date}`, {});
  } else if (task === "task3") {
    PRINT_ROOMS.forEach((room) => {
      data[room] = loadFromStorage(`task3-data-${date}-${room}`, {});
    });
  }

  return data;
};

// Copy to clipboard function
const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};

// PWA Install Banner Component
const PWAInstallBanner = ({ lang }) => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleInstallPrompt = () => {
      setShowInstallBanner(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
    };

    window.addEventListener("pwa-install-available", handleInstallPrompt);
    window.addEventListener("pwa-installed", handleInstalled);

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallPrompt);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const handleInstall = () => {
    if (window.installPWA) {
      window.installPWA();
    }
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner || isInstalled) return null;

  return (
    <div className="fixed top-2 left-2 right-2 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📱</span>
          <div>
            <h3 className="font-semibold text-sm">{t(lang, "pwaInstall")}</h3>
            <p className="text-xs opacity-90">{t(lang, "pwaInstallDesc")}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-white text-blue-600 rounded-md font-semibold text-xs hover:bg-gray-100 transition"
          >
            {t(lang, "install")}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, isVisible, onClose, type = "success" }) => {
  useEffect(() => {
    if (isVisible) {
      vibrateDevice(type === "success" ? "success" : "error");
    }
  }, [isVisible, type]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "copy"
      ? "bg-blue-500"
      : "bg-red-500";
  const emoji = type === "success" ? "✅" : type === "copy" ? "📋" : "❌";

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-40 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {emoji} {message}
        </span>
        <button
          onClick={onClose}
          className="ml-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Bottom Sheet
const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 bg-[hsl(var(--background))] dark:bg-gray-800 h-screen overflow-y-auto">
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

// Counter Component

const Counter = ({ value, onChange, label, lang, onClose }) => {
  const [isThrottled, setIsThrottled] = useState(false);

  const handleClick = (action) => {
    if (isThrottled) return;

    if (action === "increase" && value < 999) {
      vibrateDevice("counterIncrease");
      onChange(value + 1);
    }
    if (action === "decrease" && value > 0) {
      vibrateDevice("counterDecrease");
      onChange(value - 1);
    }

    // ставимо коротку затримку
    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), 120);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
          {label}
        </h2>
        <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {value}
          </span>
          <p className="text-sm text-[hsl(var(--muted-foreground))] italic mt-2">
            {t(lang, "units")}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => handleClick("increase")}
          disabled={isThrottled}
          className="w-full h-20 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="text-2xl">➕</span>
          {t(lang, "add")}
        </button>
        <button
          onClick={() => handleClick("decrease")}
          disabled={isThrottled}
          className="w-full h-16 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="text-xl">➖</span>
          {t(lang, "subtract")}
        </button>
        <button
          onClick={onClose}
          className="w-full h-16 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-xl shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold"
        >
          {t(lang, "ok")}
        </button>
      </div>
    </div>
  );
};
// Number Grid Component
const NumberGrid = ({ value, onChange, label, onClose, lang, options }) => {
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
          {label}
        </h2>
        <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <span className="text-5xl font-bold text-purple-600 dark:text-purple-400">
            {value === 0 && options && options.includes("–") ? "–" : value}
          </span>
          <p className="text-sm text-[hsl(var(--muted-foreground))] italic mt-2">
            {t(lang, "units")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option === "–" ? 0 : option);
            }}
            className={`h-12 text-sm font-bold rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
              value === option || (value === 0 && option === "–")
                ? "bg-[hsl(var(--purple))] text-white"
                : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-purple-50 dark:hover:bg-purple-900 active:bg-purple-100 dark:active:bg-purple-800"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-6 h-16 bg-[hsl(var(--secondary))] hover:bg-gray-300 active:bg-gray-400 text-[hsl(var(--secondary-foreground))] rounded-xl shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold"
      >
        {t(lang, "ok")}
      </button>
    </div>
  );
};

// Task 1: Personnel & Cars
const Task1PersonnelCars = ({ lang }) => {
  const [personnelData, setPersonnelData] = useState({});
  const [carsCount, setCarsCount] = useState(0);
  const [selectedZone, setSelectedZone] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedPersonnel = loadFromStorage(
      `task1-personnel-data-${todayKey}`,
      {}
    );
    const savedCars = loadFromStorage(`task1-cars-data-${todayKey}`, 0);

    setPersonnelData(savedPersonnel);
    setCarsCount(savedCars);
  }, []);

  useEffect(() => {
    const todayKey = getTodayKey();
    saveToStorage(`task1-personnel-data-${todayKey}`, personnelData);
    saveToStorage(`task1-cars-data-${todayKey}`, carsCount);
    showToast(t(lang, "dataSavedToday"));
  }, [personnelData, carsCount]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const updatePersonnel = (zone, count) => {
    setPersonnelData((prev) => ({ ...prev, [zone]: count }));
  };

  const handleCopy = () => {
    const entries = [];
    Object.entries(personnelData).forEach(([zone, count]) => {
      if (count > 0) {
        entries.push(`${zone}: ${count}`);
      }
    });
    if (carsCount > 0) {
      entries.push(`${t(lang, "totalCars")}: ${carsCount}`);
    }

    if (entries.length === 0) {
      showToast(t(lang, "dataEmpty"), "error");
      return;
    }

    const date = new Date().toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
    const textToCopy = `${date}\n${t(lang, "personnel")}:\n${entries.join(
      "\n"
    )}`;

    copyToClipboard(textToCopy);
    vibrateDevice("success");
    showToast(t(lang, "copied"), "copy");
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
        type={toast.type}
      />

      <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
          <span className="text-xl">👥</span>
          {t(lang, "personnelByZones")}
        </h2>
        <div className="space-y-3">
          {PERSONNEL_ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => {
                setSelectedZone(zone);
              }}
              className={`w-full rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-between bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 active:bg-blue-200 dark:active:bg-blue-700 text-blue-800 dark:text-blue-200`}
            >
              <span className="font-medium">{zone}</span>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-bold bg-blue-600 text-white`}
              >
                {personnelData[zone] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
          <span className="text-xl">🚗</span>
          {t(lang, "cars")}
        </h2>
        <button
          onClick={() => {
            setSelectedZone("Parking");
          }}
          className={`w-full rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-between bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 active:bg-green-200 dark:active:bg-green-700 text-green-800 dark:text-green-200`}
        >
          <span className="font-medium">{t(lang, "totalCars")}</span>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-bold bg-green-600 text-white`}
          >
            {carsCount}
          </span>
        </button>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCopy}
          className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📋</span>
          {t(lang, "copy")}
        </button>
      </div>

      <BottomSheet
        isOpen={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        title={selectedZone || ""}
      >
        {selectedZone && selectedZone !== "Parking" ? (
          <Counter
            value={personnelData[selectedZone] ?? 0}
            onChange={(count) => updatePersonnel(selectedZone, count)}
            label={`${t(lang, "workersCount")} ${selectedZone}`}
            lang={lang}
            onClose={() => setSelectedZone(null)}
          />
        ) : selectedZone === "Parking" ? (
          <Counter
            value={carsCount}
            onChange={(count) => setCarsCount(count)}
            label={t(lang, "carsCount")}
            lang={lang}
            onClose={() => setSelectedZone(null)}
          />
        ) : null}
      </BottomSheet>
    </div>
  );
};

// Task 2: Bike Parking
const Task2BikeParking = ({ lang }) => {
  const [bikeData, setBikeData] = useState({});
  const [selectedBikeType, setSelectedBikeType] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedBikes = loadFromStorage(`task2-bikes-data-${todayKey}`, {});

    setBikeData(savedBikes);
  }, []);

  useEffect(() => {
    const hasData = Object.values(bikeData).some((count) => count > 0);
    if (hasData) {
      const todayKey = getTodayKey();
      saveToStorage(`task2-bikes-data-${todayKey}`, bikeData);
      showToast(t(lang, "dataSavedToday"));
    }
  }, [bikeData]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const updateBike = (type, count) => {
    setBikeData((prev) => ({ ...prev, [type]: count }));
  };

  const handleCopy = () => {
    const entries = [];
    Object.entries(bikeData).forEach(([type, count]) => {
      if (count > 0) {
        entries.push(`${type}: ${count}`);
      }
    });

    if (entries.length === 0) {
      showToast(t(lang, "dataEmpty"), "error");
      return;
    }

    const date = new Date().toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
    const textToCopy = `${date}\n${t(lang, "bikes")}:\n${entries.join("\n")}`;

    copyToClipboard(textToCopy);
    vibrateDevice("success");
    showToast(t(lang, "copied"), "copy");
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
        type={toast.type}
      />

      <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
          <span className="text-xl">🚴</span>
          {t(lang, "bikesAndTransport")}
        </h2>
        <div className="space-y-3">
          {BIKE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedBikeType(type);
              }}
              className={`w-full rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-between bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 active:bg-orange-200 dark:active:bg-orange-700 text-orange-800 dark:text-orange-200`}
            >
              <span className="font-medium text-left">{type}</span>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-bold bg-orange-600 text-white`}
              >
                {bikeData[type] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCopy}
          className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📋</span>
          {t(lang, "copy")}
        </button>
      </div>

      <BottomSheet
        isOpen={!!selectedBikeType}
        onClose={() => setSelectedBikeType(null)}
        title={selectedBikeType || ""}
      >
        {selectedBikeType && (
          <Counter
            value={bikeData[selectedBikeType] ?? 0}
            onChange={(count) => updateBike(selectedBikeType, count)}
            label={`${t(lang, "quantity")}: ${selectedBikeType}`}
            lang={lang}
            onClose={() => setSelectedBikeType(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
};

// Task 3: Print Rooms
const Task3PrintRooms = ({ lang }) => {
  const [selectedRoom, setSelectedRoom] = useState(PRINT_ROOMS[0]);
  const [printData, setPrintData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const todayKey = getTodayKey();
    const currentData = loadFromStorage(
      `task3-data-${todayKey}-${selectedRoom}`,
      {}
    );
    setPrintData(currentData);
  }, [selectedRoom]);

  useEffect(() => {
    const hasData = Object.entries(printData).some(
      ([item, count]) =>
        count > 0 || (count === 0 && getOptionsForItem(item).includes("–"))
    );
    if (hasData) {
      const todayKey = getTodayKey();
      saveToStorage(`task3-data-${todayKey}-${selectedRoom}`, printData);
      showToast(t(lang, "dataSavedToday"));
    }
  }, [printData, selectedRoom]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Ця функція критично важлива для відображення кнопок
  const getOptionsForItem = (item) => {
    if (!item) return []; // Захист від пустих значень

    switch (item) {
      case "EK 1":
      case "EK 2":
      case "EK 8A":
      case "EK 8B":
      case "EK 8C":
      case "EK 9A":
      case "EK 9B":
      case "EK 9C":
        return Array.from({ length: 6 }, (_, i) => i); // 0-5
      case "EK 3":
      case "EK 4":
      case "EK 10A":
        return Array.from({ length: 11 }, (_, i) => i); // 0-10
      case "EK 5":
      case "EK 6":
        return Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, 20...100
      case "EK 7A":
      case "EK 7B":
      case "EK 7C":
      case "EK 10B":
        return Array.from({ length: 21 }, (_, i) => i); // 0-20
      case "EK 11A":
      case "EK 11B":
      case "EK 12":
      case "EK 13":
      case "EK 14":
      case "EK 15":
      case "EK 16":
      case "EK 17":
      case "EK 18":
      case "EK 19":
        return ["–", 1]; // 1, -
      default:
        // Якщо назва не співпала, повертаємо стандартний масив, щоб не було помилки
        return Array.from({ length: 21 }, (_, i) => i);
    }
  };

  const updateItem = (item, count) => {
    setPrintData((prev) => ({ ...prev, [item]: count }));
  };

  const handleSync = async () => {
    const hasData = Object.values(printData).some(
      (val) => val > 0 || val === 0
    );

    if (!hasData) {
      showToast(t(lang, "noDataToSave"), "error");
      return;
    }

    if (
      !window.confirm(
        `Відправити дані для кімнати ${selectedRoom} в Google Таблицю?`
      )
    ) {
      return;
    }

    setIsSyncing(true);
    const todayKey = getTodayKey();

    try {
      const payload = {
        date: todayKey,
        room: selectedRoom,
        items: printData,
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      vibrateDevice("success");
      showToast("Дані успішно відправлено в хмару!", "success");
    } catch (error) {
      console.error(error);
      vibrateDevice("error");
      showToast("Помилка з'єднання", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = () => {
    const entries = [];
    Object.entries(printData).forEach(([item, count]) => {
      // Тут теж потрібна безпечна перевірка
      const options = getOptionsForItem(item);
      if (count > 0 || (count === 0 && options.includes("–"))) {
        entries.push(`${item}: ${count === 0 ? "–" : count}`);
      }
    });

    if (entries.length === 0) {
      showToast(t(lang, "dataEmpty"), "error");
      return;
    }

    const date = new Date().toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
    const textToCopy = `${date}\n${t(
      lang,
      "room"
    )} ${selectedRoom}:\n${entries.join("\n")}`;

    copyToClipboard(textToCopy);
    vibrateDevice("success");
    showToast(t(lang, "copied"), "copy");
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
        type={toast.type}
      />

      <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
          <span className="text-xl">🖨️</span>
          {t(lang, "officeSupplies")}
        </h2>

        <div className="grid grid-cols-4 gap-2">
          {PRINT_ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`py-2 px-3 text-sm font-bold rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
                selectedRoom === room
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-[hsl(var(--border))]"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {PRINT_ITEMS.map((item) => {
            // Безпечне отримання опцій для рендеру
            const options = getOptionsForItem(item);
            const displayValue =
              printData[item] ?? (options.includes("–") ? "–" : 0);

            return (
              <button
                key={item}
                onClick={() => setSelectedItem(item)}
                className={`w-full rounded-lg shadow transition px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-between bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200`}
              >
                <span className="font-medium text-left">{item}</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-600 text-white">
                    {displayValue}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">▶</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow px-4 py-2 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <span className="text-xl">📋</span>
          {t(lang, "copy")}
        </button>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg shadow px-4 py-2 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSyncing ? (
            <span className="animate-spin">↻</span>
          ) : (
            <span className="text-xl">☁️</span>
          )}
          Google
        </button>
      </div>

      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem || ""}
      >
        {selectedItem && (
          <NumberGrid
            value={printData[selectedItem] ?? 0}
            onChange={(count) => updateItem(selectedItem, count)}
            label={`${t(lang, "quantity")}: ${selectedItem}`}
            onClose={() => setSelectedItem(null)}
            lang={lang}
            options={getOptionsForItem(selectedItem)}
          />
        )}
      </BottomSheet>
    </div>
  );
};

// History Detail View
const HistoryDetailView = ({ date, onBack, lang }) => {
  const [selectedTask, setSelectedTask] = useState("task1");
  const [toast, setToast] = useState({ show: false, message: "" });

  const task1Data = getDataForDate(date, "task1");
  const task2Data = getDataForDate(date, "task2");
  const task3Data = getDataForDate(date, "task3");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const getOptionsForItem = (item) => {
    switch (item) {
      case "EK 1":
      case "EK 2":
      case "EK 8A":
      case "EK 8B":
      case "EK 8C":
      case "EK 9A":
      case "EK 9B":
      case "EK 9C":
        return Array.from({ length: 6 }, (_, i) => i); // 0-5
      case "EK 3":
      case "EK 4":
      case "EK 10A":
        return Array.from({ length: 11 }, (_, i) => i); // 0-10
      case "EK 5":
      case "EK 6":
        return Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, 20...100
      case "EK 7A":
      case "EK 7B":
      case "EK 7C":
      case "EK 10B":
        return Array.from({ length: 21 }, (_, i) => i); // 0-20
      case "EK 11A":
      case "EK 11B":
      case "EK 12":
      case "EK 13":
      case "EK 14":
      case "EK 15":
      case "EK 16":
      case "EK 17":
      case "EK 18":
      case "EK 19":
        return ["–", 1]; // 1, - (represented as 0 and –)
      default:
        return Array.from({ length: 21 }, (_, i) => i); // Default 0-20
    }
  };

  const renderTask1Data = () => {
    const hasPersonnelData = Object.values(task1Data.personnel || {}).some(
      (count) => count > 0
    );
    const hasCarsData = task1Data.cars > 0;

    if (!hasPersonnelData && !hasCarsData) {
      return (
        <div className="text-gray-500 dark:text-gray-400 italic">
          {t(lang, "noData")}
        </div>
      );
    }

    const entries = [];
    Object.entries(task1Data.personnel || {}).forEach(([zone, count]) => {
      if (count > 0) {
        entries.push(`${zone}: ${count}`);
      }
    });
    if (task1Data.cars > 0) {
      entries.push(`${t(lang, "totalCars")}: ${task1Data.cars}`);
    }

    const handleCopy = () => {
      const dateStr = new Date(date).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      });
      const textToCopy = `${dateStr}\n${t(lang, "personnel")}:\n${entries.join(
        "\n"
      )}`;
      copyToClipboard(textToCopy);
      showToast(t(lang, "copied"), "copy");
    };

    return (
      <div className="space-y-4">
        <Toast
          message={toast.message}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, message: "" })}
          type="copy"
        />
        {hasPersonnelData && (
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
              {t(lang, "personnelByZones")}:
            </h4>
            <div className="space-y-2">
              {Object.entries(task1Data.personnel).map(
                ([zone, count]) =>
                  count > 0 && (
                    <div
                      key={zone}
                      className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900 rounded-lg"
                    >
                      <span className="dark:text-blue-200">{zone}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-300">
                        {count}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {hasCarsData && (
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              {t(lang, "cars")}:
            </h4>
            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900 rounded-lg">
              <span className="dark:text-green-200">
                {t(lang, "totalCars")}
              </span>
              <span className="font-bold text-green-600 dark:text-green-300">
                {task1Data.cars}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleCopy}
          className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
        >
          📋 {t(lang, "copy")}
        </button>
      </div>
    );
  };

  const renderTask2Data = () => {
    const entries = Object.entries(task2Data.bikes || {}).filter(
      ([_, c]) => c > 0
    );
    if (entries.length === 0)
      return (
        <div className="text-gray-500 dark:text-gray-400 italic">
          {t(lang, "noData")}
        </div>
      );

    return (
      <div className="space-y-2">
        <Toast
          message={toast.message}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, message: "" })}
          type="copy"
        />
        <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
          {t(lang, "bikesAndTransport")}:
        </h4>
        {entries.map(([type, count]) => (
          <div
            key={type}
            className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900 rounded-lg"
          >
            <span className="dark:text-orange-200">{type}</span>
            <span className="font-bold text-orange-600 dark:text-orange-300">
              {count}
            </span>
          </div>
        ))}
        <button
          onClick={() => {
            const text = `${new Date(date).toLocaleDateString("uk-UA", {
              day: "2-digit",
              month: "2-digit",
            })}\n${t(lang, "bikes")}:`;
            const formatted = entries.reduce(
              (acc, [label, val]) => acc + `\n${label}: ${val}`,
              text
            );
            copyToClipboard(formatted);
            showToast(t(lang, "copied"), "copy");
          }}
          className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
        >
          📋 {t(lang, "copy")}
        </button>
      </div>
    );
  };

  const renderTask3Data = () => {
    const hasData = Object.values(task3Data).some((roomData) =>
      Object.values(roomData || {}).some(
        (count) =>
          count > 0 ||
          (count === 0 &&
            getOptionsForItem(
              Object.keys(roomData).find((key) => roomData[key] === 0)
            )?.includes("–"))
      )
    );

    if (!hasData) {
      return (
        <div className="text-gray-500 dark:text-gray-400 italic">
          {t(lang, "noData")}
        </div>
      );
    }

    const entries = [];
    Object.entries(task3Data).forEach(([room, roomData]) => {
      const roomEntries = [];
      Object.entries(roomData || {}).forEach(([item, count]) => {
        if (
          count > 0 ||
          (count === 0 && getOptionsForItem(item).includes("–"))
        ) {
          roomEntries.push(`${item}: ${count === 0 ? "–" : count}`);
        }
      });
      if (roomEntries.length > 0) {
        entries.push(`${t(lang, "room")} ${room}:`);
        entries.push(...roomEntries);
      }
    });

    const handleCopy = () => {
      const dateStr = new Date(date).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      });
      const textToCopy = `${dateStr}\n${t(lang, "office")}:\n${entries.join(
        "\n"
      )}`;
      copyToClipboard(textToCopy);
      showToast(t(lang, "copied"), "copy");
    };

    return (
      <div className="space-y-4">
        <Toast
          message={toast.message}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, message: "" })}
          type="copy"
        />
        <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
          {t(lang, "officeSupplies")}:
        </h4>
        {Object.entries(task3Data).map(([room, roomData]) => {
          const hasRoomData = Object.values(roomData || {}).some(
            (count) =>
              count > 0 ||
              (count === 0 &&
                getOptionsForItem(
                  Object.keys(roomData).find((key) => roomData[key] === count)
                )?.includes("–"))
          );
          if (!hasRoomData) return null;

          return (
            <div key={room} className="space-y-2">
              <h5 className="font-medium text-purple-600 dark:text-purple-300">
                {t(lang, "room")} {room}:
              </h5>
              <div className="space-y-1 ml-4">
                {Object.entries(roomData).map(
                  ([item, count]) =>
                    (count > 0 ||
                      (count === 0 &&
                        getOptionsForItem(item).includes("–"))) && (
                      <div
                        key={item}
                        className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900 rounded-lg"
                      >
                        <span className="dark:text-purple-200">{item}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-300">
                          {count === 0 ? "–" : count}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          );
        })}
        <button
          onClick={handleCopy}
          className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
        >
          📋 {t(lang, "copy")}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition text-2xl"
        >
          ◀
        </button>
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            {formatDate(date, lang)}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {t(lang, "detailedView")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => {
            setSelectedTask("task1");
          }}
          className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            selectedTask === "task1"
              ? "bg-[hsl(var(--blue))] text-white"
              : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-blue-50 dark:hover:bg-blue-900 active:bg-blue-100 dark:active:bg-blue-800"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👥</span>
            <span className="text-xs font-medium">{t(lang, "personnel")}</span>
          </div>
        </button>
        <button
          onClick={() => {
            setSelectedTask("task2");
          }}
          className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            selectedTask === "task2"
              ? "bg-orange-600 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-[hsl(var(--border))] hover:bg-orange-50 dark:hover:bg-orange-900 active:bg-orange-100 dark:active:bg-orange-800"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🚴</span>
            <span className="text-xs font-medium">{t(lang, "bikes")}</span>
          </div>
        </button>
        <button
          onClick={() => {
            setSelectedTask("task3");
          }}
          className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            selectedTask === "task3"
              ? "bg-purple-600 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-[hsl(var(--border))] hover:bg-purple-50 dark:hover:bg-purple-900 active:bg-purple-100 dark:active:bg-purple-800"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🖨️</span>
            <span className="text-xs font-medium">{t(lang, "office")}</span>
          </div>
        </button>
      </div>

      <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))]">
        {selectedTask === "task1" && renderTask1Data()}
        {selectedTask === "task2" && renderTask2Data()}
        {selectedTask === "task3" && renderTask3Data()}
      </div>
    </div>
  );
};

// History View
const HistoryView = ({ lang }) => {
  const [savedDates, setSavedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const dates = getAllSavedDates();
    setSavedDates(dates);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const handleDeleteDate = (date) => {
    if (
      window.confirm(`${t(lang, "deleteConfirm")} ${formatDate(date, lang)}?`)
    ) {
      vibrateDevice("delete");
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`-data-${date}`)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => localStorage.removeItem(key));

      const updatedDates = getAllSavedDates();
      setSavedDates(updatedDates);
      showToast(t(lang, "dataDeleted"));
    }
  };

  if (selectedDate) {
    return (
      <HistoryDetailView
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
        type={toast.type}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <span className="text-xl">📚</span>
            {t(lang, "historyTitle")}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {t(lang, "recordsFound")}: {savedDates.length}
          </p>
        </div>
      </div>

      {savedDates.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
            📚
          </span>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {t(lang, "historyEmpty")}
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            {t(lang, "saveDataPrompt")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedDates.map((date) => (
            <div
              key={date}
              className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">
                    {formatDate(date, lang)}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    {date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDate(date);
                    }}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform font-medium flex items-center gap-2"
                  >
                    <span className="text-lg">👁️</span>
                    {t(lang, "view")}
                  </button>

                  <button
                    onClick={() => handleDeleteDate(date)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Settings View
const SettingsView = ({
  lang,
  setLang,
  theme,
  setTheme,
  isVibrationEnabled,
  setVibrationEnabled,
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
      ⚙️ {t(lang, "settings")}
    </h2>

    <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          {t(lang, "language")}:
        </label>
        <div className="relative">
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
            }}
            className="w-full p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
          >
            <option value="ua">{t(lang, "ukrainian")}</option>
            <option value="en">{t(lang, "english")}</option>
            <option value="nl">{t(lang, "dutch")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[hsl(var(--muted-foreground))]">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l-.707.707L15 20l-5.707-5.707.707-.707L15 18.586 19.293 14.293l.707.707L15 20l-5.707-5.707z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          {t(lang, "theme")}:
        </label>
        <div className="flex gap-2 p-1 bg-[hsl(var(--muted))] rounded-lg">
          <button
            onClick={() => {
              setTheme("light");
            }}
            className={`w-1/3 p-2 rounded-md font-medium transition-all ${
              theme === "light"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {t(lang, "light")}
          </button>
          <button
            onClick={() => {
              setTheme("dark");
            }}
            className={`w-1/3 p-2 rounded-md font-medium transition-all ${
              theme === "dark"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {t(lang, "dark")}
          </button>
          <button
            onClick={() => {
              setTheme("purple");
            }}
            className={`w-1/3 p-2 rounded-md font-medium transition-all ${
              theme === "purple"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {t(lang, "purple")}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          {t(lang, "vibrationSetting")}:
        </label>
        <div className="flex gap-2 p-1 bg-[hsl(var(--muted))] rounded-lg">
          <button
            onClick={() => {
              setVibrationEnabled(true);
            }}
            className={`w-1/2 p-2 rounded-md font-medium transition-all ${
              isVibrationEnabled
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {t(lang, "vibrationOn")}
          </button>
          <button
            onClick={() => {
              setVibrationEnabled(false);
            }}
            className={`w-1/2 p-2 rounded-md font-medium transition-all ${
              !isVibrationEnabled
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {t(lang, "vibrationOff")}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Main App Component
export default function App() {
  const [currentTask, setCurrentTask] = useState("task3");
  const [lang, setLang] = useState(() => loadFromStorage("app-language", "ua"));
  const [theme, setThemeState] = useState(() =>
    loadFromStorage("app-theme", "light")
  );
  const [isVibrationEnabled, setVibrationEnabledState] = useState(() =>
    loadFromStorage("app-vibration-enabled", true)
  );

  const taskList = ["task1", "task2", "task3"];
  let touchStartX = 0;

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    saveToStorage("app-theme", newTheme);
  }, []);

  const setVibrationEnabled = useCallback((isEnabled) => {
    setVibrationEnabledState(isEnabled);
    saveToStorage("app-vibration-enabled", isEnabled);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "purple");
    root.classList.add(theme);
  }, [theme]);

  // Swipe logic
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (taskList.includes(currentTask)) {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;
      const swipeThreshold = 50;

      if (swipeDistance > swipeThreshold) {
        // Swipe Right (Previous Task)
        const currentIndex = taskList.indexOf(currentTask);
        if (currentIndex > 0) {
          handleTaskChange(taskList[currentIndex - 1]);
        }
      } else if (swipeDistance < -swipeThreshold) {
        // Swipe Left (Next Task)
        const currentIndex = taskList.indexOf(currentTask);
        if (currentIndex < taskList.length - 1) {
          handleTaskChange(taskList[currentIndex + 1]);
        }
      }
    }
  };

  // Parse URL params for shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskParam = urlParams.get("task");
    if (taskParam && ["task1", "task2", "task3"].includes(taskParam)) {
      setCurrentTask(taskParam);
    }
  }, []);

  // Request wake lock when app starts
  useEffect(() => {
    if ("wakeLock" in navigator) {
      let wakeLock = null;
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("Wake Lock is active.");
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          requestWakeLock();
        } else {
          if (wakeLock !== null) {
            wakeLock.release();
            wakeLock = null;
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      requestWakeLock();

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        if (wakeLock !== null) {
          wakeLock.release();
        }
      };
    }
  }, []);

  const handleTaskChange = (task) => {
    setCurrentTask(task);

    // Update URL for shortcuts
    const url = new URL(window.location);
    if (task !== "history" && task !== "settings") {
      url.searchParams.set("task", task);
    } else {
      url.searchParams.delete("task");
    }
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pb-4">
      <PWAInstallBanner lang={lang} />

      <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-[hsl(var(--card))] shadow-lg flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg font-bold text-[hsl(var(--card-foreground))] flex items-center gap-2">
            <span className="text-xl">📊</span>
            {t(lang, "appTitle")}
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] italic">
            {t(lang, "appDesc")}
          </p>
        </div>
        <button
          onClick={() => handleTaskChange("settings")}
          className={`p-2 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            currentTask === "settings"
              ? "bg-[hsl(var(--primary))] text-white"
              : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
          }`}
        >
          <span className="text-lg">⚙️</span>
        </button>
      </header>

      <div
        className="max-w-lg mx-auto pt-24"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] mx-4 mb-4 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              {t(lang, "chooseTask")}
            </h2>
            <button
              onClick={() => handleTaskChange("history")}
              className={`p-2 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm font-medium flex items-center gap-1 ${
                currentTask === "history"
                  ? "bg-indigo-600 text-white"
                  : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              }`}
            >
              <span className="text-xl">📚</span>
              {t(lang, "history")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleTaskChange("task1")}
              className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
                currentTask === "task1"
                  ? "bg-blue-600 text-white"
                  : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">👥</span>
                <span className="text-xs font-medium">
                  {t(lang, "personnel")}
                </span>
              </div>
            </button>
            <button
              onClick={() => handleTaskChange("task2")}
              className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
                currentTask === "task2"
                  ? "bg-orange-600 text-white"
                  : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚴</span>
                <span className="text-xs font-medium">{t(lang, "bikes")}</span>
              </div>
            </button>
            <button
              onClick={() => handleTaskChange("task3")}
              className={`p-3 rounded-lg shadow transition hover:scale-[1.02] active:scale-[0.98] transition-transform ${
                currentTask === "task3"
                  ? "bg-purple-600 text-white"
                  : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🖨️</span>
                <span className="text-xs font-medium">{t(lang, "office")}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow-md p-4 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] mx-4 mb-4">
          {currentTask === "task1" && <Task1PersonnelCars lang={lang} />}
          {currentTask === "task2" && <Task2BikeParking lang={lang} />}
          {currentTask === "task3" && <Task3PrintRooms lang={lang} />}
          {currentTask === "history" && <HistoryView lang={lang} />}
          {currentTask === "settings" && (
            <SettingsView
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
              isVibrationEnabled={isVibrationEnabled}
              setVibrationEnabled={setVibrationEnabled}
            />
          )}
        </div>

        <div className="text-center mt-6 mx-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Work Statistics PWA v1.7 🚀
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
