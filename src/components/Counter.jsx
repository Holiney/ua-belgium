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
