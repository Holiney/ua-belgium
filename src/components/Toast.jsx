import { useEffect } from "react";
import { vibrateDevice } from "../utils/helpers";

export const Toast = ({ message, isVisible, onClose, type = "success" }) => {
  useEffect(() => {
    if (isVisible) vibrateDevice(type === "success" ? "success" : "error");
  }, [isVisible, type]);

  if (!isVisible) return null;

  const colors = {
    success: "bg-gradient-to-r from-emerald-500 to-teal-500",
    error: "bg-gradient-to-r from-red-500 to-pink-500",
  };
  const emoji = type === "success" ? "✅" : "❌";

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[60] ${
        colors[type] || colors.success
      } text-white px-5 py-4 rounded-2xl shadow-2xl animate-slide-down flex justify-between items-center`}
    >
      <span className="font-semibold flex items-center gap-2">
        <span className="text-lg">{emoji}</span> {message}
      </span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  );
};
