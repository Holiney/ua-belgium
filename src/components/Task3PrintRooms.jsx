import { useState, useEffect } from "react";
import { t } from "../constants/translations";
import {
  PRINT_ROOMS,
  PRINT_ITEMS,
  PRINT_ITEMS_LIMITED,
  LIMITED_ROOMS,
  BACKEND_URL,
} from "../constants/zones";
import { loadFromStorage, saveToStorage, getTodayKey } from "../utils/storage";
import { vibrateDevice } from "../utils/helpers";
import { Toast } from "./Toast";
import { BottomSheet } from "./BottomSheet";
import { NumberGrid } from "./NumberGrid";

export const Task3PrintRooms = ({ lang }) => {
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
