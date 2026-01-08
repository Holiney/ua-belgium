import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'ua_belgium_bot';

// Telegram Login Button using the official widget
export function TelegramLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const { signInWithTelegram } = useAuth();

  useEffect(() => {
    // Define global callback ONCE
    window.onTelegramAuth = async (user) => {
      console.log('✅ Telegram auth received:', user);
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
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [signInWithTelegram, onSuccess, onError]);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;
    scriptLoadedRef.current = true;

    console.log('Loading Telegram widget for bot:', TELEGRAM_BOT_USERNAME);

    // Create iframe-based widget manually
    const iframe = document.createElement('iframe');
    iframe.src = `https://oauth.telegram.org/embed/${TELEGRAM_BOT_USERNAME}?origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(window.location.href)}&size=large&userpic=true&radius=12`;
    iframe.width = '240';
    iframe.height = '40';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.overflow = 'hidden';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';

    containerRef.current.appendChild(iframe);

    // Listen for messages from Telegram iframe
    const handleMessage = (event) => {
      if (event.origin === 'https://oauth.telegram.org') {
        console.log('Message from Telegram:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'auth_result' && data.result) {
            window.onTelegramAuth?.(data.result);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Also check URL for redirect auth data
  useEffect(() => {
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
      window.onTelegramAuth?.(telegramData);
    }
  }, []);

  if (!TELEGRAM_BOT_USERNAME) {
    return (
      <div className="text-center text-red-500 text-sm">
        Telegram бот не налаштований
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="flex justify-center min-h-[40px]" />

      {/* Fallback manual button */}
      <a
        href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-medium transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        Відкрити в Telegram
      </a>

      <p className="text-xs text-gray-500 text-center">
        Якщо віджет не працює, натисніть кнопку вище
      </p>
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
        </div>

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
