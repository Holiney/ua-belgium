import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { Phone, ArrowRight, RefreshCw, User, AlertTriangle } from 'lucide-react';

// Rate limiting constants
const OTP_RATE_LIMIT_KEY = 'otp-rate-limit';
const MAX_OTP_PER_PHONE_PER_HOUR = 3;
const MAX_OTP_PER_DAY = 10;
const BASE_COOLDOWN = 60; // seconds

// Get rate limit data
function getRateLimitData() {
  const data = loadFromStorage(OTP_RATE_LIMIT_KEY, {
    requests: [],
    phoneRequests: {},
  });

  // Clean up old requests (older than 24 hours)
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  data.requests = data.requests.filter(t => t > dayAgo);

  // Clean phone requests older than 1 hour
  Object.keys(data.phoneRequests).forEach(phone => {
    data.phoneRequests[phone] = data.phoneRequests[phone].filter(t => t > hourAgo);
    if (data.phoneRequests[phone].length === 0) {
      delete data.phoneRequests[phone];
    }
  });

  return data;
}

// Check if rate limited
function checkRateLimit(phone) {
  const data = getRateLimitData();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  // Check daily limit
  if (data.requests.length >= MAX_OTP_PER_DAY) {
    const oldestRequest = Math.min(...data.requests);
    const resetTime = new Date(oldestRequest + 24 * 60 * 60 * 1000);
    return {
      limited: true,
      reason: 'daily',
      message: `Досягнуто денний ліміт SMS. Спробуйте після ${resetTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }

  // Check per-phone hourly limit
  const phoneRequests = data.phoneRequests[phone] || [];
  if (phoneRequests.length >= MAX_OTP_PER_PHONE_PER_HOUR) {
    const oldestRequest = Math.min(...phoneRequests);
    const resetTime = new Date(oldestRequest + 60 * 60 * 1000);
    return {
      limited: true,
      reason: 'phone',
      message: `Забагато спроб для цього номера. Спробуйте після ${resetTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }

  // Calculate cooldown based on attempts (exponential backoff)
  const recentRequests = data.requests.filter(t => t > hourAgo);
  const cooldownMultiplier = Math.min(Math.pow(2, recentRequests.length), 8); // Max 8x

  return {
    limited: false,
    cooldown: BASE_COOLDOWN * cooldownMultiplier,
    attemptsLeft: {
      phone: MAX_OTP_PER_PHONE_PER_HOUR - phoneRequests.length,
      daily: MAX_OTP_PER_DAY - data.requests.length,
    },
  };
}

// Record OTP request
function recordOtpRequest(phone) {
  const data = getRateLimitData();
  const now = Date.now();

  data.requests.push(now);

  if (!data.phoneRequests[phone]) {
    data.phoneRequests[phone] = [];
  }
  data.phoneRequests[phone].push(now);

  saveToStorage(OTP_RATE_LIMIT_KEY, data);
}

// Phone Login with OTP - Belgian format
export function PhoneLoginButton({ onSuccess, onError }) {
  const { sendOtp, verifyOtp, updateProfile } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'name'
  const [phone, setPhone] = useState('+32 ');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [userData, setUserData] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Format Belgian phone number: +32 4XX XX XX XX
  const formatBelgianPhone = (value) => {
    // Remove all non-digits except +
    let digits = value.replace(/[^\d+]/g, '');

    // Ensure starts with +32
    if (!digits.startsWith('+')) {
      digits = '+' + digits;
    }
    if (!digits.startsWith('+32')) {
      if (digits.startsWith('+3') && digits.length > 2) {
        digits = '+32' + digits.slice(3);
      } else if (digits.startsWith('+') && digits.length > 1 && !digits.startsWith('+3')) {
        digits = '+32' + digits.slice(1);
      } else if (digits === '+' || digits === '+3') {
        // Allow typing
      } else {
        digits = '+32';
      }
    }

    // Format: +32 4XX XX XX XX
    const numbers = digits.slice(3); // Remove +32
    let formatted = '+32';

    if (numbers.length > 0) {
      formatted += ' ' + numbers.slice(0, 3);
    }
    if (numbers.length > 3) {
      formatted += ' ' + numbers.slice(3, 5);
    }
    if (numbers.length > 5) {
      formatted += ' ' + numbers.slice(5, 7);
    }
    if (numbers.length > 7) {
      formatted += ' ' + numbers.slice(7, 9);
    }

    return formatted;
  };

  // Get raw phone for API
  const getRawPhone = (formatted) => {
    return formatted.replace(/\s/g, '');
  };

  // Handle phone input
  const handlePhoneChange = (e) => {
    const formatted = formatBelgianPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  // Validate Belgian phone
  const isValidBelgianPhone = (phone) => {
    const raw = getRawPhone(phone);
    // Belgian mobile: +32 4XX XX XX XX (10 digits after +32)
    // Belgian landline: +32 2/3/4/9 XXX XX XX (9 digits after +32)
    return raw.length >= 11 && raw.length <= 12 && raw.startsWith('+32');
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!isValidBelgianPhone(phone)) {
      setError('Введіть коректний бельгійський номер');
      return;
    }

    const rawPhone = getRawPhone(phone);

    // Check rate limit
    const rateCheck = checkRateLimit(rawPhone);
    if (rateCheck.limited) {
      setError(rateCheck.message);
      setRateLimitInfo(rateCheck);
      return;
    }

    setIsLoading(true);
    setError('');
    setRateLimitInfo(null);

    try {
      const { error } = await sendOtp(rawPhone);

      if (error) {
        setError(error.message || 'Помилка відправки коду');
      } else {
        // Record successful OTP request
        recordOtpRequest(rawPhone);

        setStep('otp');
        // Start countdown with exponential backoff
        const cooldownTime = rateCheck.cooldown || BASE_COOLDOWN;
        setCountdown(cooldownTime);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Update rate limit info
        setRateLimitInfo({
          attemptsLeft: {
            phone: rateCheck.attemptsLeft.phone - 1,
            daily: rateCheck.attemptsLeft.daily - 1,
          }
        });
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
      const rawPhone = getRawPhone(phone);
      const { data, error } = await verifyOtp(rawPhone, otp);

      if (error) {
        setError(error.message || 'Невірний код');
      } else {
        setUserData(data);

        // Check if this is first login (no name set)
        const existingProfile = loadFromStorage('user-profile', null);
        const isFirstLogin = !existingProfile?.name || existingProfile.name === 'Користувач';

        if (isFirstLogin) {
          // Save phone immediately - it won't be changeable
          const profile = {
            ...existingProfile,
            phone: rawPhone,
            phoneVerified: true,
          };
          saveToStorage('user-profile', profile);
          setStep('name');
        } else {
          // Existing user - just complete login
          onSuccess?.(data);
        }
      }
    } catch (err) {
      setError(err.message || 'Помилка верифікації');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save name and complete registration
  const handleSaveName = async () => {
    if (!name.trim()) {
      setError("Введіть ваше ім'я");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const rawPhone = getRawPhone(phone);
      const profile = {
        name: name.trim(),
        phone: rawPhone,
        phoneVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Save locally
      saveToStorage('user-profile', profile);

      // Update in Supabase if available
      if (updateProfile) {
        await updateProfile({ name: name.trim() });
      }

      onSuccess?.(userData);
    } catch (err) {
      setError(err.message || 'Помилка збереження');
    } finally {
      setIsLoading(false);
    }
  };

  // Check rate limit on phone change
  useEffect(() => {
    if (isValidBelgianPhone(phone)) {
      const rawPhone = getRawPhone(phone);
      const rateCheck = checkRateLimit(rawPhone);
      if (rateCheck.limited) {
        setRateLimitInfo(rateCheck);
      } else {
        setRateLimitInfo({ attemptsLeft: rateCheck.attemptsLeft });
      }
    }
  }, [phone]);

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    // Check rate limit before resending
    const rawPhone = getRawPhone(phone);
    const rateCheck = checkRateLimit(rawPhone);
    if (rateCheck.limited) {
      setError(rateCheck.message);
      setRateLimitInfo(rateCheck);
      return;
    }

    await handleSendOtp();
  };

  // Go back to phone step
  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  // Name input step (after OTP verification for new users)
  if (step === 'name') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <User className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Вітаємо! 🎉
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Завершіть реєстрацію
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ваше ім'я *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Наприклад: Олена"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Це ім'я бачитимуть інші користувачі
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
            <span className="ml-auto text-green-500 text-xs">✓ Підтверджено</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={handleSaveName}
          disabled={isLoading || !name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Зберігаємо...
            </>
          ) : (
            'Завершити реєстрацію'
          )}
        </button>
      </div>
    );
  }

  // Phone input step
  if (step === 'phone') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Номер телефону (Бельгія)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+32 4XX XX XX XX"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ми надішлемо SMS з кодом підтвердження
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {rateLimitInfo?.attemptsLeft && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Залишилось спроб: {rateLimitInfo.attemptsLeft.phone} на цей номер, {rateLimitInfo.attemptsLeft.daily} на сьогодні
          </p>
        )}

        <button
          onClick={handleSendOtp}
          disabled={isLoading || !isValidBelgianPhone(phone)}
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
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
            <span className="text-2xl">🇧🇪</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Вхід в UA Belgium
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Увійдіть за бельгійським номером телефону
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
