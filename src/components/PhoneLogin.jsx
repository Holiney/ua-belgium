import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';

// Phone Login with OTP
export function PhoneLoginButton({ onSuccess, onError }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('+380');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Format phone number
  const formatPhone = (value) => {
    // Keep only digits and +
    let cleaned = value.replace(/[^\d+]/g, '');

    // Ensure starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };

  // Handle phone input
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError('Введіть коректний номер телефону');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await sendOtp(phone);

      if (error) {
        setError(error.message || 'Помилка відправки коду');
      } else {
        setStep('otp');
        // Start countdown for resend
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Помилка відправки коду');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Введіть 6-значний код');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await verifyOtp(phone, otp);

      if (error) {
        setError(error.message || 'Невірний код');
      } else {
        onSuccess?.(data);
      }
    } catch (err) {
      setError(err.message || 'Помилка верифікації');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  // Go back to phone step
  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  // Phone input step
  if (step === 'phone') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Номер телефону
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+380 XX XXX XX XX"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ми надішлемо SMS з кодом підтвердження
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={handleSendOtp}
          disabled={isLoading || phone.length < 10}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Відправляємо...
            </>
          ) : (
            <>
              Отримати код
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    );
  }

  // OTP input step
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Код надіслано на
        </p>
        <p className="font-medium text-gray-900 dark:text-white">{phone}</p>
        <button
          onClick={handleBack}
          className="text-sm text-blue-500 hover:underline mt-1"
        >
          Змінити номер
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Код з SMS
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(value);
            setError('');
          }}
          placeholder="000000"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
          maxLength={6}
          disabled={isLoading}
          autoFocus
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Перевіряємо...
          </>
        ) : (
          'Підтвердити'
        )}
      </button>

      <button
        onClick={handleResendOtp}
        disabled={countdown > 0 || isLoading}
        className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
      >
        {countdown > 0 ? (
          `Надіслати повторно через ${countdown}с`
        ) : (
          'Надіслати код повторно'
        )}
      </button>
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

        <PhoneLoginButton
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
