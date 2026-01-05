import { t } from "../constants/translations";

export const NumberGrid = ({ value, onChange, label, onClose, lang, options }) => (
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
