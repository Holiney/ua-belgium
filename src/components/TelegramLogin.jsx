import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TELEGRAM_BOT_USERNAME = 'ua_belgium_bot';

export function TelegramLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const { signInWithTelegram } = useAuth();

  useEffect(() => {
    // Check for auth data in URL (redirect mode)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const hash = params.get('hash');

    if (id && hash) {
      const telegramData = {
        id: params.get('id'),
        first_name: params.get('first_name'),
        last_name: params.get('last_name'),
        username: params.get('username'),
        photo_url: params.get('photo_url'),
        auth_date: params.get('auth_date'),
        hash: params.get('hash')
      };
      console.log('Found Telegram auth in URL:', telegramData);
      window.history.replaceState({}, document.title, window.location.pathname);

      signInWithTelegram(telegramData).then(({ data, error }) => {
        if (error) {
          onError?.(error);
        } else {
          onSuccess?.(data);
        }
      });
    }
  }, [signInWithTelegram, onSuccess, onError]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    // Set up global callback
    window.onTelegramAuth = async (user) => {
      console.log('Telegram auth callback:', user);
      const { data, error } = await signInWithTelegram(user);
      if (error) {
        onError?.(error);
      } else {
        onSuccess?.(data);
      }
    };

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [signInWithTelegram, onSuccess, onError]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} className="flex justify-center min-h-[40px]" />
    </div>
  );
}

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
            Увійдіть через Telegram
          </p>
        </div>

        <TelegramLoginButton
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Скасувати
        </button>
      </div>
    </div>
  );
}
