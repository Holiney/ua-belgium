import { useState, useEffect } from "react";
import { t } from "./constants/translations";
import { loadFromStorage, saveToStorage } from "./utils/storage";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { Task1PersonnelCars } from "./components/Task1PersonnelCars";
import { Task2BikeParking } from "./components/Task2BikeParking";
import { Task3PrintRooms } from "./components/Task3PrintRooms";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";

export default function App() {
  const [task, setTask] = useState("task3");
  const [lang, setLang] = useState(() => loadFromStorage("app-lang", "ua"));
  const [theme, setTheme] = useState(() =>
    loadFromStorage("app-theme", "light")
  );

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
            />
          )}
        </div>
        <div className="text-center mt-8 pb-4 opacity-50 text-xs">
          Work Stats PWA v2.1
        </div>
      </div>
    </div>
  );
}
