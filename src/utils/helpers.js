import { VIBRATION_PATTERNS } from "../constants/zones";
import { loadFromStorage } from "./storage";

// Vibration helper
export const vibrateDevice = (pattern) => {
  const isVibrationEnabled = loadFromStorage("app-vibration-enabled", true);
  if (isVibrationEnabled && "vibrate" in navigator) {
    if (typeof pattern === "string" && VIBRATION_PATTERNS[pattern]) {
      navigator.vibrate(VIBRATION_PATTERNS[pattern]);
    } else if (Array.isArray(pattern) || typeof pattern === "number") {
      navigator.vibrate(pattern);
    }
  }
};

// Date formatting
export const formatDate = (dateStr, lang = "ua") => {
  const date = new Date(dateStr);
  const locale = lang === "ua" ? "uk-UA" : lang === "nl" ? "nl-NL" : "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Clipboard helper
export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};
