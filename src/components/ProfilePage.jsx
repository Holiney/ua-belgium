import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, SectionTitle } from './Layout';
import { LoginPage } from './TelegramLogin';
import { supabase } from '../lib/supabase';
import {
  User,
  LogOut,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  ChevronRight,
  Settings,
  MessageCircle,
  Phone,
  MapPin,
  Edit2,
  Plus,
  Eye,
  Clock
} from 'lucide-react';

export function ProfilePage({ onNavigate }) {
  const { user, profile, isAuthenticated, loading, signOut, updateProfile, isBackendReady } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [myListings, setMyListings] = useState({ products: [], food: [], rentals: [] });
  const [loadingListings, setLoadingListings] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', city: '' });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyListings();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        city: profile.city || 'brussels',
      });
    }
  }, [profile]);

  const loadMyListings = async () => {
    if (!user) return;
    setLoadingListings(true);

    try {
      const [productsRes, foodRes, rentalsRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('food_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('rentals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setMyListings({
        products: productsRes.data || [],
        food: foodRes.data || [],
        rentals: rentalsRes.data || [],
      });
    } catch (err) {
      console.error('Error loading listings:', err);
    }

    setLoadingListings(false);
  };

  const handleSignOut = async () => {
    if (confirm('Ви впевнені, що хочете вийти?')) {
      await signOut();
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await updateProfile(editForm);
    if (!error) {
      setEditingProfile(false);
    } else {
      alert('Помилка збереження профілю');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  const totalListings = myListings.products.length + myListings.food.length + myListings.rentals.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        <Card className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ви не увійшли
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Увійдіть, щоб додавати оголошення, зберігати обране та керувати своїм профілем
          </p>
          {isBackendReady ? (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Увійти через Telegram
            </button>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Авторизація буде доступна після налаштування бекенду
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Переваги авторизації:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-500" />
              Додавайте власні оголошення
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              Отримуйте повідомлення від покупців
            </li>
            <li className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-500" />
              Керуйте своїми оголошеннями
            </li>
          </ul>
        </Card>

        {showLogin && (
          <LoginPage
            onClose={() => setShowLogin(false)}
            onSuccess={() => setShowLogin(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {profile?.name || 'Користувач'}
            </h2>
            {profile?.telegram_username && (
              <a
                href={`https://t.me/${profile.telegram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                @{profile.telegram_username}
              </a>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {totalListings} оголошень
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditingProfile(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'listings', label: 'Мої оголошення' },
          { id: 'settings', label: 'Налаштування' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onNavigate('products', { openCreate: true })}
              className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center"
            >
              <ShoppingBag className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">+ Товар</span>
            </button>
            <button
              onClick={() => onNavigate('food', { openCreate: true })}
              className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center"
            >
              <UtensilsCrossed className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">+ Їжа</span>
            </button>
            <button
              onClick={() => onNavigate('rental', { openCreate: true })}
              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center"
            >
              <Building2 className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">+ Оренда</span>
            </button>
          </div>

          {loadingListings ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : totalListings === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Немає оголошень
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Створіть своє перше оголошення!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Products */}
              {myListings.products.length > 0 && (
                <section>
                  <SectionTitle>Товари ({myListings.products.length})</SectionTitle>
                  <div className="space-y-2">
                    {myListings.products.map((item) => (
                      <ListingCard key={item.id} item={item} type="product" />
                    ))}
                  </div>
                </section>
              )}

              {/* Food */}
              {myListings.food.length > 0 && (
                <section>
                  <SectionTitle>Їжа ({myListings.food.length})</SectionTitle>
                  <div className="space-y-2">
                    {myListings.food.map((item) => (
                      <ListingCard key={item.id} item={item} type="food" />
                    ))}
                  </div>
                </section>
              )}

              {/* Rentals */}
              {myListings.rentals.length > 0 && (
                <section>
                  <SectionTitle>Оренда ({myListings.rentals.length})</SectionTitle>
                  <div className="space-y-2">
                    {myListings.rentals.map((item) => (
                      <ListingCard key={item.id} item={item} type="rental" />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Контактна інформація
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Telegram</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {profile?.telegram_username ? `@${profile.telegram_username}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Телефон</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {profile?.phone || 'Не вказано'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">Місто</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {profile?.city || 'Не вказано'}
                </span>
              </div>
            </div>
          </Card>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Вийти з акаунту
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Редагувати профіль
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ім'я
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+32 xxx xx xx xx"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Місто
                </label>
                <select
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="brussels">Брюссель</option>
                  <option value="antwerp">Антверпен</option>
                  <option value="ghent">Гент</option>
                  <option value="liege">Льєж</option>
                  <option value="charleroi">Шарлеруа</option>
                  <option value="bruges">Брюгге</option>
                  <option value="other">Інше</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProfile(false)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Listing card component
function ListingCard({ item, type }) {
  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    sold: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    rented: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    inactive: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  const statusLabels = {
    active: 'Активне',
    sold: 'Продано',
    rented: 'Здано',
    inactive: 'Неактивне',
  };

  const typeIcons = {
    product: <ShoppingBag className="w-4 h-4 text-purple-500" />,
    food: <UtensilsCrossed className="w-4 h-4 text-orange-500" />,
    rental: <Building2 className="w-4 h-4 text-green-500" />,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            {typeIcons[type]}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
              {statusLabels[item.status]}
            </span>
            <span className="text-xs text-gray-400">
              {item.type === 'offer' ? 'Пропоную' : 'Шукаю'}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {item.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {item.price && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                €{item.price}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );
}
