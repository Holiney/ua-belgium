import { t } from "../constants/translations";

export const SettingsView = ({ lang, setLang, theme, setTheme }) => (
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
