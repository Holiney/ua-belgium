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
        @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); } 50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .active-task-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <PWAInstallBanner lang={lang} />

      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-lg mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t(lang, "appTitle")}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">v2.2</p>
            </div>
          </div>
          <button
            onClick={() => setTask("settings")}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 text-xl"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto pt-28 px-4">
        <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl p-8 mb-6 border-2 border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="text-indigo-600">✦</span>
              {t(lang, "chooseTask")}
            </h2>
            <button
              onClick={() => setTask("history")}
              className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:scale-105 transition-transform shadow-md"
            >
              📚 {t(lang, "history")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTask("task1")}
              className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${
                task === "task1"
                  ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white active-task-glow border-2 border-blue-400"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-xs font-bold leading-tight">
                  {t(lang, "personnel")}
                </div>
              </div>
            </button>
            <button
              onClick={() => setTask("task2")}
              className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${
                task === "task2"
                  ? "bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 text-white active-task-glow border-2 border-orange-400"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🚴</div>
                <div className="text-xs font-bold leading-tight">{t(lang, "bikes")}</div>
              </div>
            </button>
            <button
              onClick={() => setTask("task3")}
              className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${
                task === "task3"
                  ? "bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 text-white active-task-glow border-2 border-purple-400"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🖨️</div>
                <div className="text-xs font-bold leading-tight">
                  {t(lang, "office")}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl p-8 border-2 border-gray-100 dark:border-gray-700 animate-fade-in">
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
        <div className="text-center mt-10 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-md">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Work Stats PWA</span>
            <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded-full font-bold">v2.2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
