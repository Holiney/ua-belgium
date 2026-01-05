import { useState, useEffect } from "react";
import { t } from "../constants/translations";

export const PWAInstallBanner = ({ lang }) => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl animate-fade-in flex justify-between items-center">
      <div>
        <h3 className="font-bold">{t(lang, "pwaInstall")}</h3>
        <p className="text-xs opacity-90">{t(lang, "pwaInstallDesc")}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-white text-indigo-600 rounded-lg font-bold text-sm"
        >
          {t(lang, "install")}
        </button>
        <button onClick={() => setShow(false)} className="px-2">
          ✕
        </button>
      </div>
    </div>
  );
};
