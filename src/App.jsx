import React, { useState, useEffect, useCallback } from "react";

// === URL ДЛЯ СИНХРОНІЗАЦІЇ ===
// Сюди вставте URL з Power Automate (HTTP Request) або Google Apps Script
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzgovsIQyZPGdeWR-x4UBuoJRNtSM7n3Q7QYDWg2VTdRuR2RrmXSrriV7Uw8a82FmMc9Q/exec";

// --- Translations ---
const translations = {
  ua: {
    appTitle: "Статистика роботи",
    appDesc: "Збір даних по персоналу, транспорту та канцелярії",
    chooseTask: "Оберіть завдання:",
    personnel: "Персонал",
    bikes: "Велосипеди",
    office: "Канцелярія",
    history: "Історія",
    settings: "Налаштування",
    save: "Зберегти",
    copy: "Копіювати",
    copied: "Скопійовано!",
    delete: "Видалити",
    install: "Встановити",
    view: "Переглянути",
    ok: "ОК",
    noData: "Немає збережених даних",
    noDataToSave: "Немає даних для збереження",
    dataEmpty: "Введіть хоча б одне значення",
    dataSavedToday: "Дані збережено локально",
    units: "одиниць",
    add: "Додати",
    subtract: "Відняти",
    personnelByZones: "Персонал по зонах",
    cars: "Автомобілі",
    totalCars: "Всього автомобілів",
    workersCount: "Кількість працівників в",
    carsCount: "Кількість автомобілів",
    bikesAndTransport: "Велосипеди та транспорт",
    quantity: "Кількість",
    officeSupplies: "Канцелярські товари",
    room: "Кімната",
    historyTitle: "Історія збережених даних",
    recordsFound: "Знайдено записів",
    historyEmpty: "Історія порожня",
    saveDataPrompt: "Збережіть дані в одному з завдань",
    pwaInstall: "Встановити додаток",
    pwaInstallDesc: "Для кращого досвіду роботи",
    language: "Мова",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Тема",
    light: "Світла",
    dark: "Темна",
    vibrationSetting: "Вібрація",
    vibrationOn: "Увімкнено",
    vibrationOff: "Вимкнено",
  },
  en: {
    appTitle: "Work Statistics",
    appDesc: "Data collection for staff, transport and office supplies",
    chooseTask: "Choose a task:",
    personnel: "Personnel",
    bikes: "Bikes",
    office: "Office",
    history: "History",
    settings: "Settings",
    save: "Save",
    copy: "Copy",
    copied: "Copied!",
    delete: "Delete",
    install: "Install",
    view: "View",
    ok: "OK",
    noData: "No saved data",
    noDataToSave: "No data to save",
    dataEmpty: "Enter at least one value",
    dataSavedToday: "Data saved locally",
    units: "units",
    add: "Add",
    subtract: "Subtract",
    personnelByZones: "Personnel by zones",
    cars: "Cars",
    totalCars: "Total cars",
    workersCount: "Number of workers in",
    carsCount: "Number of cars",
    bikesAndTransport: "Bikes and transport",
    quantity: "Quantity",
    officeSupplies: "Office supplies",
    room: "Room",
    historyTitle: "Saved data history",
    recordsFound: "Records found",
    historyEmpty: "History is empty",
    saveDataPrompt: "Save data in one of the tasks",
    pwaInstall: "Install app",
    pwaInstallDesc: "For better experience",
    language: "Language",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    vibrationSetting: "Vibration",
    vibrationOn: "On",
    vibrationOff: "Off",
  },
  nl: {
    appTitle: "Werkstatistieken",
    appDesc: "Gegevens verzamelen over personeel, vervoer en kantoorartikelen",
    chooseTask: "Kies een taak:",
    personnel: "Personeel",
    bikes: "Fietsen",
    office: "Kantoor",
    history: "Geschiedenis",
    settings: "Instellingen",
    save: "Opslaan",
    copy: "Kopiëren",
    copied: "Gekopieerd!",
    delete: "Verwijderen",
    install: "Installeren",
    view: "Bekijken",
    ok: "OK",
    noData: "Geen opgeslagen gegevens",
    noDataToSave: "Geen gegevens om op te slaan",
    dataEmpty: "Voer minimaal één waarde in",
    dataSavedToday: "Lokaal opgeslagen",
    units: "eenheden",
    add: "Toevoegen",
    subtract: "Aftrekken",
    personnelByZones: "Personeel per zone",
    cars: "Auto's",
    totalCars: "Totaal auto's",
    workersCount: "Aantal werknemers in",
    carsCount: "Aantal auto's",
    bikesAndTransport: "Fietsen en vervoer",
    quantity: "Hoeveelheid",
    officeSupplies: "Kantoorartikelen",
    room: "Kamer",
    historyTitle: "Geschiedenis",
    recordsFound: "Records gevonden",
    historyEmpty: "Geschiedenis is leeg",
    saveDataPrompt: "Sla gegevens op in een van de taken",
    pwaInstall: "App installeren",
    pwaInstallDesc: "Voor een betere ervaring",
    language: "Taal",
    ukrainian: "Українська",
    english: "English",
    dutch: "Nederlands",
    theme: "Thema",
    light: "Licht",
    dark: "Donker",
    vibrationSetting: "Trillen",
    vibrationOn: "Aan",
    vibrationOff: "Uit",
  },
};

const t = (lang, key) => translations[lang]?.[key] || key;

// --- Constants ---

// Зона 170 видалена
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

const PRINT_ITEMS_LIMITED = [
  "EK 13",
  "EK 14",
  "EK 15",
  "EK 16",
  "EK 17",
  "EK 18",
];

// Кімната 170 додана
const PRINT_ROOMS = [
  "20",
  "30",
  "40",
  "50",
  "140",
  "162",
  "170",
  "220",
  "250",
  "340",
  "422",
  "463",
];
const LIMITED_ROOMS = ["20", "30", "40"];

const VIBRATION_PATTERNS = {
  counterIncrease: [20],
  counterDecrease: [50],
  success: [100, 50, 100],
  error: [200, 100, 200],
};

// --- Helpers ---

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

const loadFromStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

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
    if (key && /-data-(\d{4}-\d{2}-\d{2})/.test(key)) {
      const match = key.match(/-data-(\d{4}-\d{2}-\d{2})/);
      if (match) dates.add(match[1]);
    }
  }
  return Array.from(dates).sort().reverse();
};

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

// Функція для збору всіх даних за дату для Історії
const getHistoryData = (date) => {
  const personnel = loadFromStorage(`task1-personnel-data-${date}`, {});
  const cars = loadFromStorage(`task1-cars-data-${date}`, 0);
  const bikes = loadFromStorage(`task2-bikes-data-${date}`, {});
  const office = {};
  PRINT_ROOMS.forEach((room) => {
    const roomData = loadFromStorage(`task3-data-${date}-${room}`, {});
    if (Object.keys(roomData).length > 0) {
      office[room] = roomData;
    }
  });
  return { personnel, cars, bikes, office };
};

// --- Components ---

const PWAInstallBanner = ({ lang }) => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl animate-fade-in flex justify-between items-center">
      <div>
        <h3 className="font-bold">{t(lang, "pwaInstall")}</h3>
        <p className="text-xs opacity-90">{t(lang, "pwaInstallDesc")}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-white text-indigo-600 rounded-lg font-bold text-sm"
        >
          {t(lang, "install")}
        </button>
        <button onClick={() => setShow(false)} className="px-2">
          ✕
        </button>
      </div>
    </div>
  );
};

const Toast = ({ message, isVisible, onClose, type = "success" }) => {
  useEffect(() => {
    if (isVisible) vibrateDevice(type === "success" ? "success" : "error");
  }, [isVisible, type]);

  if (!isVisible) return null;
  const colors = {
    success: "bg-gradient-to-r from-emerald-500 to-teal-500",
    error: "bg-gradient-to-r from-red-500 to-pink-500",
  };
  const emoji = type === "success" ? "✅" : "❌";

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[60] ${
        colors[type] || colors.success
      } text-white px-5 py-4 rounded-2xl shadow-2xl animate-slide-down flex justify-between items-center`}
    >
      <span className="font-semibold flex items-center gap-2">
        <span className="text-lg">{emoji}</span> {message}
      </span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  );
};

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-t-3xl overflow-y-auto animate-slide-up mt-24">
        <div className="flex justify-center py-4">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-24">{children}</div>
      </div>
    </div>
  );
};

const Counter = ({ value, onChange, label, lang, onClose }) => {
  const [throttled, setThrottled] = useState(false);
  const click = (d) => {
    if (throttled) return;
    if ((d > 0 && value < 999) || (d < 0 && value > 0)) {
      vibrateDevice(d > 0 ? "counterIncrease" : "counterDecrease");
      onChange(value + d);
      setThrottled(true);
      setTimeout(() => setThrottled(false), 100);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {label}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <span className="text-7xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            {value}
          </span>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t(lang, "units")}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => click(1)}
          className="w-full h-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg font-bold text-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          ➕ {t(lang, "add")}
        </button>
        <button
          onClick={() => click(-1)}
          className="w-full h-16 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl shadow-lg font-bold text-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          ➖ {t(lang, "subtract")}
        </button>
        <button
          onClick={onClose}
          className="w-full h-16 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold"
        >
          {t(lang, "ok")}
        </button>
      </div>
    </div>
  );
};

const NumberGrid = ({ value, onChange, label, onClose, lang, options }) => (
  <div className="flex flex-col gap-6">
    <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
        {label}
      </h2>
      <span className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {value === 0 && options.includes("–") ? "–" : value}
      </span>
    </div>
    <div className="grid grid-cols-5 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt === "–" ? 0 : opt)}
          className={`h-14 font-bold rounded-xl shadow-md transition-all ${
            value === opt || (value === 0 && opt === "–")
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border dark:border-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
    <button
      onClick={onClose}
      className="w-full h-16 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold"
    >
      {t(lang, "ok")}
    </button>
  </div>
);

// --- Task Components ---

const Task1PersonnelCars = ({ lang }) => {
  const [data, setData] = useState({});
  const [cars, setCars] = useState(0);
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    const k = getTodayKey();
    setData(loadFromStorage(`task1-personnel-data-${k}`, {}));
    setCars(loadFromStorage(`task1-cars-data-${k}`, 0));
  }, []);

  useEffect(() => {
    const k = getTodayKey();
    saveToStorage(`task1-personnel-data-${k}`, data);
    saveToStorage(`task1-cars-data-${k}`, cars);
    if (Object.keys(data).length > 0 || cars > 0)
      showToast(t(lang, "dataSavedToday"));
  }, [data, cars]);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const copy = () => {
    const lines = Object.entries(data)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`);
    if (cars > 0) lines.push(`${t(lang, "totalCars")}: ${cars}`);
    if (!lines.length) return showToast(t(lang, "dataEmpty"), "error");
    copyToClipboard(
      `${new Date().toLocaleDateString("uk-UA")}\n${t(
        lang,
        "personnel"
      )}:\n${lines.join("\n")}`
    );
    vibrateDevice("success");
    showToast(t(lang, "copied"));
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.msg}
        isVisible={toast.show}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 space-y-4 border border-blue-100 dark:border-blue-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span className="text-2xl">👥</span>
          {t(lang, "personnelByZones")}
        </h2>
        <div className="space-y-3">
          {PERSONNEL_ZONES.map((z) => (
            <button
              key={z}
              onClick={() => setSel(z)}
              className="w-full rounded-xl bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm hover:shadow-md p-4 flex justify-between border border-blue-100 dark:border-blue-800 transition-transform active:scale-[0.98]"
            >
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {z}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-blue-600 text-white shadow">
                {data[z] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 border border-emerald-100 dark:border-emerald-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          {t(lang, "cars")}
        </h2>
        <button
          onClick={() => setSel("Parking")}
          className="w-full rounded-xl bg-white dark:bg-gray-800 p-4 flex justify-between shadow-sm hover:shadow-md border border-emerald-100 dark:border-emerald-800 active:scale-[0.98]"
        >
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {t(lang, "totalCars")}
          </span>
          <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-600 text-white shadow">
            {cars}
          </span>
        </button>
      </div>

      <button
        onClick={copy}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-4 font-bold text-lg flex justify-center gap-2 active:scale-[0.98]"
      >
        📋 {t(lang, "copy")}
      </button>

      <BottomSheet isOpen={!!sel} onClose={() => setSel(null)} title={sel}>
        <Counter
          value={sel === "Parking" ? cars : data[sel] ?? 0}
          onChange={(v) =>
            sel === "Parking"
              ? setCars(v)
              : setData((p) => ({ ...p, [sel]: v }))
          }
          label={sel}
          lang={lang}
          onClose={() => setSel(null)}
        />
      </BottomSheet>
    </div>
  );
};

const Task2BikeParking = ({ lang }) => {
  const [data, setData] = useState({});
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    setData(loadFromStorage(`task2-bikes-data-${getTodayKey()}`, {}));
  }, []);
  useEffect(() => {
    if (Object.values(data).some((v) => v > 0)) {
      saveToStorage(`task2-bikes-data-${getTodayKey()}`, data);
      setToast({ show: true, msg: t(lang, "dataSavedToday"), type: "success" });
      setTimeout(() => setToast({ show: false, msg: "" }), 2000);
    }
  }, [data]);

  const copy = () => {
    const lines = Object.entries(data)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`);
    if (!lines.length)
      return setToast({ show: true, msg: t(lang, "dataEmpty"), type: "error" });
    copyToClipboard(
      `${new Date().toLocaleDateString("uk-UA")}\n${t(
        lang,
        "bikes"
      )}:\n${lines.join("\n")}`
    );
    vibrateDevice("success");
    setToast({ show: true, msg: t(lang, "copied") });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.msg}
        isVisible={toast.show}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 space-y-4 border border-orange-100 dark:border-orange-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span className="text-2xl">🚴</span>
          {t(lang, "bikesAndTransport")}
        </h2>
        <div className="space-y-3">
          {BIKE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSel(t)}
              className="w-full rounded-xl bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 shadow-sm hover:shadow-md p-4 flex justify-between border border-orange-100 dark:border-orange-800 active:scale-[0.98]"
            >
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {t}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-orange-600 text-white shadow">
                {data[t] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={copy}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-4 font-bold text-lg flex justify-center gap-2 active:scale-[0.98]"
      >
        📋 {t(lang, "copy")}
      </button>
      <BottomSheet isOpen={!!sel} onClose={() => setSel(null)} title={sel}>
        <Counter
          value={data[sel] ?? 0}
          onChange={(v) => setData((p) => ({ ...p, [sel]: v }))}
          label={sel}
          lang={lang}
          onClose={() => setSel(null)}
        />
      </BottomSheet>
    </div>
  );
};

const Task3PrintRooms = ({ lang }) => {
  const [room, setRoom] = useState(PRINT_ROOMS[0]);
  const [data, setData] = useState({});
  const [item, setItem] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    setData(loadFromStorage(`task3-data-${getTodayKey()}-${room}`, {}));
  }, [room]);
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      saveToStorage(`task3-data-${getTodayKey()}-${room}`, data);
      setToast({ show: true, msg: t(lang, "dataSavedToday"), type: "success" });
      setTimeout(() => setToast({ show: false, msg: "" }), 2000);
    }
  }, [data, room]);

  const getOpts = (i) => {
    if (!i) return [];
    if (
      [
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
      ].includes(i)
    )
      return ["–", 1];
    if (
      [
        "EK 1",
        "EK 2",
        "EK 8A",
        "EK 8B",
        "EK 8C",
        "EK 9A",
        "EK 9B",
        "EK 9C",
      ].includes(i)
    )
      return [0, 1, 2, 3, 4, 5];
    if (["EK 3", "EK 4", "EK 10A"].includes(i))
      return Array.from({ length: 11 }, (_, x) => x);
    if (["EK 5", "EK 6"].includes(i))
      return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    return Array.from({ length: 21 }, (_, x) => x);
  };

  const sync = async () => {
    if (!Object.values(data).some((v) => v !== 0))
      return setToast({
        show: true,
        msg: t(lang, "noDataToSave"),
        type: "error",
      });
    if (!window.confirm(`Sync: ${room}?`)) return;
    setSyncing(true);
    try {
      await fetch(BACKEND_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: getTodayKey(), room, items: data }),
      });
      vibrateDevice("success");
      setToast({ show: true, msg: "OK!", type: "success" });
    } catch (e) {
      setToast({ show: true, msg: "Error", type: "error" });
    } finally {
      setSyncing(false);
      setTimeout(() => setToast({ show: false, msg: "" }), 3000);
    }
  };

  const items = LIMITED_ROOMS.includes(room)
    ? PRINT_ITEMS_LIMITED
    : PRINT_ITEMS;

  return (
    <div className="space-y-6">
      <Toast
        message={toast.msg}
        isVisible={toast.show}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 space-y-5 border border-purple-100 dark:border-purple-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span className="text-2xl">🖨️</span>
          {t(lang, "officeSupplies")}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {PRINT_ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`py-3 text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 ${
                room === r
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-purple-100 dark:border-purple-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {items.map((i) => {
            const opts = getOpts(i);
            const val = data[i] ?? (opts.includes("–") ? "–" : 0);
            return (
              <button
                key={i}
                onClick={() => setItem(i)}
                className="w-full rounded-xl bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 shadow-sm p-4 flex justify-between border border-purple-100 dark:border-purple-800 active:scale-[0.98]"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {i}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-bold min-w-[30px] ${
                    val !== 0 && val !== "–"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {val}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={sync}
        disabled={syncing}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl px-6 py-4 font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {syncing ? (
          <span className="animate-spin">↻</span>
        ) : (
          <span className="text-xl">☁️</span>
        )}{" "}
        Google
      </button>
      <BottomSheet isOpen={!!item} onClose={() => setItem(null)} title={item}>
        <NumberGrid
          value={data[item] ?? 0}
          onChange={(v) => setData((p) => ({ ...p, [item]: v }))}
          label={item}
          lang={lang}
          onClose={() => setItem(null)}
          options={getOpts(item)}
        />
      </BottomSheet>
    </div>
  );
};

const HistoryView = ({ lang }) => {
  const [dates, setDates] = useState(getAllSavedDates());
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDelete = (e, dateToDelete) => {
    e.stopPropagation();
    if (window.confirm(`${t(lang, "delete")} ${dateToDelete}?`)) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes(dateToDelete)) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setDates(getAllSavedDates());
    }
  };

  if (selectedDate) {
    const data = getHistoryData(selectedDate);
    const hasPersonnel =
      Object.keys(data.personnel).length > 0 || data.cars > 0;
    const hasBikes = Object.keys(data.bikes).length > 0;
    const hasOffice = Object.keys(data.office).length > 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDate(null)}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            ⬅️
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {formatDate(selectedDate, lang)}
            </h2>
            <p className="text-xs text-gray-500">{selectedDate}</p>
          </div>
        </div>

        {hasPersonnel && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-blue-100 dark:border-blue-900/30">
            <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
              👥 {t(lang, "personnel")}
            </h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(data.personnel).map(
                ([k, v]) =>
                  v > 0 && (
                    <li
                      key={k}
                      className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1 last:border-0"
                    >
                      <span className="text-gray-600 dark:text-gray-300">
                        {k}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {v}
                      </span>
                    </li>
                  )
              )}
              {data.cars > 0 && (
                <li className="flex justify-between pt-2 font-bold">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t(lang, "totalCars")}
                  </span>
                  <span className="text-emerald-600">{data.cars}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {hasBikes && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-orange-900/30">
            <h3 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
              🚴 {t(lang, "bikes")}
            </h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(data.bikes).map(
                ([k, v]) =>
                  v > 0 && (
                    <li
                      key={k}
                      className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1 last:border-0"
                    >
                      <span className="text-gray-600 dark:text-gray-300">
                        {k}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {v}
                      </span>
                    </li>
                  )
              )}
            </ul>
          </div>
        )}

        {hasOffice && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30">
            <h3 className="font-bold text-purple-600 mb-3 flex items-center gap-2">
              🖨️ {t(lang, "office")}
            </h3>
            <div className="space-y-4">
              {Object.entries(data.office).map(([room, items]) => (
                <div
                  key={room}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl"
                >
                  <div className="font-bold text-xs text-gray-500 uppercase mb-2">
                    {t(lang, "room")} {room}
                  </div>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(items).map(([item, count]) => (
                      <li key={item} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          {item}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {count === 0 ? "–" : count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasPersonnel && !hasBikes && !hasOffice && (
          <div className="text-center text-gray-400 py-10">
            {t(lang, "noData")}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex gap-3">
        <span className="text-3xl">📚</span>
        {t(lang, "historyTitle")}
      </h2>
      {!dates.length ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-bold text-gray-500">
            {t(lang, "historyEmpty")}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((d) => (
            <div
              key={d}
              onClick={() => setSelectedDate(d)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-gray-800 shadow p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all relative"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {formatDate(d, lang)}
              </h3>
              <p className="text-sm text-gray-500">{d}</p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-500 transition-colors">
                👉
              </div>
              <button
                onClick={(e) => handleDelete(e, d)}
                className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const SettingsView = ({ lang, setLang, theme, setTheme, vib, setVib }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex gap-3">
      ⚙️ {t(lang, "settings")}
    </h2>
    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 space-y-6 border border-gray-100 dark:border-gray-700">
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
          {t(lang, "language")}
        </label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold dark:text-white"
        >
          <option value="ua">🇺🇦 UA</option>
          <option value="en">🇬🇧 EN</option>
          <option value="nl">🇳🇱 NL</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
          {t(lang, "theme")}
        </label>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              theme === "light"
                ? "bg-white shadow text-gray-800"
                : "text-gray-500"
            }`}
          >
            {t(lang, "light")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              theme === "dark"
                ? "bg-gray-700 text-white shadow"
                : "text-gray-500"
            }`}
          >
            {t(lang, "dark")}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [task, setTask] = useState("task3");
  const [lang, setLang] = useState(() => loadFromStorage("app-lang", "ua"));
  const [theme, setTheme] = useState(() =>
    loadFromStorage("app-theme", "light")
  );
  const [vib, setVib] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    saveToStorage("app-theme", theme);
    saveToStorage("app-lang", lang);
  }, [theme, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 pb-10">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <PWAInstallBanner lang={lang} />
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-lg mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t(lang, "appTitle")}
            </h1>
          </div>
          <button
            onClick={() => setTask("settings")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto pt-24 px-4">
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t(lang, "chooseTask")}
            </h2>
            <button
              onClick={() => setTask("history")}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm font-bold"
            >
              📚 {t(lang, "history")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTask("task1")}
              className={`p-4 rounded-xl shadow-lg transition-all active:scale-95 ${
                task === "task1"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 border dark:border-gray-700"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl">👥</div>
                <div className="text-xs font-bold mt-1">
                  {t(lang, "personnel")}
                </div>
              </div>
            </button>
            <button
              onClick={() => setTask("task2")}
              className={`p-4 rounded-xl shadow-lg transition-all active:scale-95 ${
                task === "task2"
                  ? "bg-gradient-to-br from-orange-600 to-amber-600 text-white"
                  : "bg-white dark:bg-gray-800 border dark:border-gray-700"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl">🚴</div>
                <div className="text-xs font-bold mt-1">{t(lang, "bikes")}</div>
              </div>
            </button>
            <button
              onClick={() => setTask("task3")}
              className={`p-4 rounded-xl shadow-lg transition-all active:scale-95 ${
                task === "task3"
                  ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                  : "bg-white dark:bg-gray-800 border dark:border-gray-700"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl">🖨️</div>
                <div className="text-xs font-bold mt-1">
                  {t(lang, "office")}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-6 border border-gray-100 dark:border-gray-700 animate-fade-in">
          {task === "task1" && <Task1PersonnelCars lang={lang} />}
          {task === "task2" && <Task2BikeParking lang={lang} />}
          {task === "task3" && <Task3PrintRooms lang={lang} />}
          {task === "history" && <HistoryView lang={lang} />}
          {task === "settings" && (
            <SettingsView
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
              vib={vib}
              setVib={setVib}
            />
          )}
        </div>
        <div className="text-center mt-8 pb-4 opacity-50 text-xs">
          Work Stats PWA v2
        </div>
      </div>
    </div>
  );
}
