import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

export function TelegramLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const { signInWithTelegram } = useAuth();

  useEffect(() => {
    // Create global callback for Telegram Widget
    window.onTelegramAuth = async (telegramUser) => {
      try {
        const { data, error } = await signInWithTelegram(telegramUser);
        if (error) {
          onError?.(error);
        } else {
          onSuccess?.(data);
        }
      } catch (err) {
        onError?.(err);
      }
    };

    // Load Telegram Widget script
    if (containerRef.current && TELEGRAM_BOT_USERNAME) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;

      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [signInWithTelegram, onSuccess, onError]);

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

// Alternative styled button that redirects to Telegram
export function TelegramLoginButtonStyled({ className = '' }) {
  const handleClick = () => {
    if (!TELEGRAM_BOT_USERNAME) {
      alert('Telegram бот не налаштований');
      return;
    }
    // Open Telegram login in a popup
    const width = 550;
    const height = 470;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      `https://oauth.telegram.org/auth?bot_id=${TELEGRAM_BOT_USERNAME}&origin=${encodeURIComponent(window.location.origin)}&request_access=write`,
      'telegram_login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium rounded-xl transition-colors ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      Увійти через Telegram
    </button>
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">або</span>
            </div>
          </div>

          <TelegramLoginButtonStyled />

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
