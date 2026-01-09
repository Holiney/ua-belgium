import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TELEGRAM_BOT_USERNAME = 'ua_belg_bot';

// Telegram Login Button using the official widget script
export function TelegramLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const widgetLoadedRef = useRef(false);
  const { signInWithTelegram } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  // Callback for Telegram auth result
  const handleTelegramAuth = useCallback(async (user) => {
    console.log('Telegram auth received:', user);
    setIsLoading(true);

    try {
      const { data, error } = await signInWithTelegram(user);
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
    } finally {
      setIsLoading(false);
    }
  }, [signInWithTelegram, onSuccess, onError]);

  // Check URL parameters for auth data (redirect mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const hash = params.get('hash');

    if (id && hash) {
      const telegramData = {
        id: parseInt(params.get('id'), 10),
        first_name: params.get('first_name') || '',
        last_name: params.get('last_name') || '',
        username: params.get('username') || '',
        photo_url: params.get('photo_url') || '',
        auth_date: parseInt(params.get('auth_date'), 10),
        hash: params.get('hash')
      };

      console.log('Found Telegram auth in URL:', telegramData);
      window.history.replaceState({}, document.title, window.location.pathname);
      handleTelegramAuth(telegramData);
    }
  }, [handleTelegramAuth]);

  // Load Telegram widget script
  useEffect(() => {
    if (widgetLoadedRef.current || !containerRef.current) return;
    widgetLoadedRef.current = true;

    // Define global callback
    window.onTelegramAuth = handleTelegramAuth;

    const loadWidget = () => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      script.onerror = () => {
        console.error('Failed to load Telegram widget');
        setWidgetError(true);
      };

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);
      }
    };

    const timeoutId = setTimeout(loadWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      delete window.onTelegramAuth;
    };
  }, [handleTelegramAuth]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-500">Авторизація...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Official Telegram Widget */}
      <div
        ref={containerRef}
        className="flex justify-center min-h-[40px]"
      />

      {widgetError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Віджет не завантажився
        </p>
      )}
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
    alert('Помилка входу: ' + (error?.message || 'Спробуйте ще раз.'));
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
