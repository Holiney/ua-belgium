import { useState, useEffect } from "react";
import { t } from "../constants/translations";
import { BIKE_TYPES } from "../constants/zones";
import { loadFromStorage, saveToStorage, getTodayKey } from "../utils/storage";
import { copyToClipboard, vibrateDevice } from "../utils/helpers";
import { Toast } from "./Toast";
import { BottomSheet } from "./BottomSheet";
import { Counter } from "./Counter";

export const Task2BikeParking = ({ lang }) => {
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
          {BIKE_TYPES.map((bikeType) => (
            <button
              key={bikeType}
              onClick={() => setSel(bikeType)}
              className="w-full rounded-xl bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 shadow-sm hover:shadow-md p-4 flex justify-between border border-orange-100 dark:border-orange-800 active:scale-[0.98]"
            >
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {bikeType}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-orange-600 text-white shadow">
                {data[bikeType] ?? 0}
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
