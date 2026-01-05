import { useState } from "react";
import { t } from "../constants/translations";
import { PRINT_ROOMS } from "../constants/zones";
import { getAllSavedDates, getHistoryData } from "../utils/storage";
import { formatDate } from "../utils/helpers";

export const HistoryView = ({ lang }) => {
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
