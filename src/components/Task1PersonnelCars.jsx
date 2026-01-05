import { useState, useEffect } from "react";
import { t } from "../constants/translations";
import { PERSONNEL_ZONES } from "../constants/zones";
import { loadFromStorage, saveToStorage, getTodayKey } from "../utils/storage";
import { copyToClipboard, vibrateDevice } from "../utils/helpers";
import { Toast } from "./Toast";
import { BottomSheet } from "./BottomSheet";
import { Counter } from "./Counter";

export const Task1PersonnelCars = ({ lang }) => {
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
