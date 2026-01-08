import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

export function TelegramLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const { signInWithTelegram } = useAuth();

  const handleTelegramAuth = useCallback(async (telegramUser) => {
    console.log('Telegram auth callback received:', telegramUser);
    try {
      const { data, error } = await signInWithTelegram(telegramUser);
      if (error) {
        console.error('Sign in error:', error);
        onError?.(error);
      } else {
        console.log('Sign in success:', data);
        onSuccess?.(data);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      onError?.(err);
    }
  }, [signInWithTelegram, onSuccess, onError]);

  useEffect(() => {
    // Create global callback for Telegram Widget
    window.TelegramLoginWidget = {
      dataOnauth: handleTelegramAuth
    };
    window.onTelegramAuth = handleTelegramAuth;

    // Load Telegram Widget script
    if (containerRef.current && TELEGRAM_BOT_USERNAME) {
      // Clear previous content
      containerRef.current.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.async = true;

      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
      delete window.TelegramLoginWidget;
    };
  }, [handleTelegramAuth]);

  if (!TELEGRAM_BOT_USERNAME) {
    return (
      <div className="text-center text-red-500 text-sm">
        Telegram бот не налаштований
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center">
      {/* Telegram widget will be inserted here */}
    </div>
  );
}


// Login page/modal component
export function LoginPage({ onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();

  const handleSuccess = (data) => {
    onSuccess?.(data);
    onClose?.();
  };

  const handleError = (error) => {
    console.error('Login error:', error);
    alert('Помилка входу. Спробуйте ще раз.');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center">
            <span className="text-3xl">🇺🇦</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Вхід в UA Belgium
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Увійдіть, щоб додавати оголошення та зберігати обране
          </p>
        </div>

        <div className="space-y-4">
          <TelegramLoginButton
            onSuccess={handleSuccess}
            onError={handleError}
          />

          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            SMS авторизація буде доступна незабаром
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Продовжити без входу
        </button>
      </div>
    </div>
  );
}
