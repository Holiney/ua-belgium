import { useState } from "react";
import { vibrateDevice } from "../utils/helpers";
import { t } from "../constants/translations";

export const Counter = ({ value, onChange, label, lang, onClose }) => {
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
      <div className="space-y-4">
        <button
          onClick={() => click(1)}
          className="w-full h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-3xl shadow-2xl font-black text-4xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:shadow-emerald-500/50 border-4 border-emerald-400/30"
        >
          <span className="text-5xl">➕</span>
          <span>{t(lang, "add")}</span>
        </button>
        <button
          onClick={() => click(-1)}
          className="w-full h-24 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white rounded-3xl shadow-xl font-bold text-3xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:shadow-rose-500/50 border-4 border-rose-400/30"
        >
          <span className="text-4xl">➖</span>
          <span>{t(lang, "subtract")}</span>
        </button>
        <button
          onClick={onClose}
          className="w-full h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all"
        >
          {t(lang, "ok")}
        </button>
      </div>
    </div>
  );
};
