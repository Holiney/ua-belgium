import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, SectionTitle } from './Layout';
import { LoginPage } from './PhoneLogin';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { supabase, isBackendReady, getListings, deleteListing } from '../lib/supabase';
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
  Clock,
  Shield,
  HelpCircle,
  Camera,
  Package,
  Trash2
} from 'lucide-react';

const cityNames = {
  brussels: 'Брюссель',
  antwerp: 'Антверпен',
  ghent: 'Гент',
  liege: 'Льєж',
  charleroi: 'Шарлеруа',
  bruges: 'Брюгге',
  leuven: 'Лювен',
  other: 'Інше',
};

export function ProfilePage({ onNavigate }) {
  const { user, profile, isAuthenticated, loading, signOut, updateProfile } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [myListings, setMyListings] = useState({ products: [], food: [], rentals: [] });
  const [listingsLoading, setListingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [editingProfile, setEditingProfile] = useState(false);
  const [localProfile, setLocalProfile] = useState(() => loadFromStorage('user-profile', null));
  const [editForm, setEditForm] = useState({ name: '', phone: '', city: '' });

  // Load listings from Supabase or localStorage
  useEffect(() => {
    if (user) {
      loadMyListings();
    } else {
      setMyListings({ products: [], food: [], rentals: [] });
    }
  }, [user]);

  useEffect(() => {
    const currentProfile = profile || localProfile;
    if (currentProfile) {
      setEditForm({
        name: currentProfile.name || '',
        phone: currentProfile.phone || '',
        city: currentProfile.city || 'brussels',
      });
    }
  }, [profile, localProfile]);

  const loadMyListings = async () => {
    if (!user) return;

    setListingsLoading(true);
    try {
      if (isBackendReady && supabase) {
        // Load from Supabase - filter by user_id and include all statuses
        const [productsRes, foodRes, rentalsRes] = await Promise.all([
          getListings('products', { userId: user.id, includeAll: true }),
          getListings('food', { userId: user.id, includeAll: true }),
          getListings('rentals', { userId: user.id, includeAll: true }),
        ]);

        setMyListings({
          products: productsRes.data || [],
          food: foodRes.data || [],
          rentals: rentalsRes.data || [],
        });
      } else {
        // Fallback to localStorage
        const allProducts = loadFromStorage('products-items', []);
        const allFood = loadFromStorage('food-items', []);
        const allRentals = loadFromStorage('rental-items', []);

        setMyListings({
          products: allProducts.filter(item => item.userId === user.id || item.isUserItem),
          food: allFood.filter(item => item.userId === user.id || item.isUserItem),
          rentals: allRentals.filter(item => item.userId === user.id || item.isUserItem),
        });
      }
    } catch (err) {
      console.error('Error loading my listings:', err);
    } finally {
      setListingsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Ви впевнені, що хочете вийти?')) {
      try {
        await signOut();
        // Clear local storage but keep theme preference
        const theme = localStorage.getItem('theme');
        localStorage.clear();
        if (theme) localStorage.setItem('theme', theme);
        // Reload page to reset state
        window.location.reload();
      } catch (err) {
        console.error('Signout error:', err);
        alert('Помилка виходу. Спробуйте ще раз.');
      }
    }
  };

  const handleSaveProfile = async () => {
    // Save to Supabase if available
    if (isBackendReady && user) {
      const { error } = await updateProfile({
        name: editForm.name,
        city: editForm.city,
      });

      if (error) {
        alert('Помилка збереження: ' + (error.message || 'Невідома помилка'));
        return;
      }
    }

    // Always save locally too
    const updatedProfile = { ...localProfile, ...editForm };
    saveToStorage('user-profile', updatedProfile);
    setLocalProfile(updatedProfile);
    setEditingProfile(false);
  };

  const handleDeleteListing = async (type, itemId) => {
    if (!confirm('Видалити це оголошення?')) return;

    try {
      if (isBackendReady && supabase) {
        // Delete from Supabase
        const tableMap = { products: 'products', food: 'food', rentals: 'rentals' };
        const { error } = await deleteListing(tableMap[type], itemId);
        if (error) {
          console.error('Delete error:', error);
          alert('Помилка видалення: ' + error.message);
          return;
        }
      }
      // Also remove from localStorage
      const storageKey = `${type}-items`;
      const items = loadFromStorage(storageKey, []);
      const updated = items.filter(item => item.id !== itemId);
      saveToStorage(storageKey, updated);
      await loadMyListings();
    } catch (err) {
      console.error('Delete exception:', err);
      alert('Помилка видалення');
    }
  };

  const handleEditListing = (type, item) => {
    // Save item to edit in localStorage so the page can pick it up
    saveToStorage('editing-item', { type, item });
    // Navigate to the appropriate page
    const pageMap = { products: 'products', food: 'food', rental: 'rental' };
    onNavigate(pageMap[type] || type);
  };

  const totalListings = myListings.products.length + myListings.food.length + myListings.rentals.length;
  const currentProfile = profile || localProfile;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated && !localProfile) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-yellow-400 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-20 text-6xl">👤</div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">
              Вітаємо в UA Belgium!
            </h2>
            <p className="text-blue-100 text-sm text-center leading-relaxed">
              Увійдіть, щоб додавати оголошення та керувати своїм профілем
            </p>
          </div>
        </div>

        {/* Login Button */}
        {isBackendReady ? (
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <Phone className="w-5 h-5" />
            Увійти за номером телефону
          </button>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
              <Shield className="w-5 h-5" />
              <p className="text-sm">
                Авторизація буде доступна після налаштування бекенду
              </p>
            </div>
          </Card>
        )}

        {/* Benefits */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Переваги авторизації
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Додавайте оголошення</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Товари, їжа, оренда</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Отримуйте повідомлення</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Зв'язок з покупцями</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Settings className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Керуйте оголошеннями</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Редагування та видалення</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Help */}
        <Card className="p-4">
          <button className="w-full flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span>Потрібна допомога?</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-yellow-400 h-24" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="relative">
              {currentProfile?.avatar_url ? (
                <img
                  src={currentProfile.avatar_url}
                  alt={currentProfile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                  <span className="text-3xl text-white font-bold">
                    {currentProfile?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {currentProfile?.name || 'Користувач'}
              </h2>
              {currentProfile?.city && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {cityNames[currentProfile.city] || currentProfile.city}
                </p>
              )}
            </div>

            <button
              onClick={() => setEditingProfile(true)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{myListings.products.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Товарів</div>
            </div>
            <div className="text-center border-x border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{myListings.food.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Їжі</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{myListings.rentals.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Оренда</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('products')}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Plus className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Товар</span>
        </button>
        <button
          onClick={() => onNavigate('food')}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Plus className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Їжа</span>
        </button>
        <button
          onClick={() => onNavigate('rental')}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Plus className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Оренда</span>
        </button>
      </div>

      {/* Contact Info */}
      {(currentProfile?.phone || currentProfile?.telegram_username) && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Контактна інформація
          </h3>
          <div className="space-y-4">
            {currentProfile?.phone && (
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Телефон</div>
                  <div className="font-medium text-gray-900 dark:text-white">{currentProfile.phone}</div>
                </div>
              </div>
            )}
            {currentProfile?.telegram_username && (
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Telegram</div>
                  <a
                    href={`https://t.me/${currentProfile.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400"
                  >
                    @{currentProfile.telegram_username}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* My Listings Section */}
      <section>
        <SectionTitle>Мої оголошення</SectionTitle>

        {totalListings === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Немає оголошень
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Створіть своє перше оголошення!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Products */}
            {myListings.products.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-500" />
                  Товари ({myListings.products.length})
                </h4>
                {myListings.products.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    type="products"
                    icon={<ShoppingBag className="w-4 h-4 text-purple-500" />}
                    onDelete={() => handleDeleteListing('products', item.id)}
                    onEdit={() => handleEditListing('products', item)}
                  />
                ))}
              </div>
            )}

            {/* Food */}
            {myListings.food.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  Їжа ({myListings.food.length})
                </h4>
                {myListings.food.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    type="food"
                    icon={<UtensilsCrossed className="w-4 h-4 text-orange-500" />}
                    onDelete={() => handleDeleteListing('food', item.id)}
                    onEdit={() => handleEditListing('food', item)}
                  />
                ))}
              </div>
            )}

            {/* Rentals */}
            {myListings.rentals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-500" />
                  Оренда ({myListings.rentals.length})
                </h4>
                {myListings.rentals.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    type="rental"
                    icon={<Building2 className="w-4 h-4 text-green-500" />}
                    onDelete={() => handleDeleteListing('rental', item.id)}
                    onEdit={() => handleEditListing('rental', item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sign Out */}
      {(isAuthenticated || localProfile) && (
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Вийти з акаунту
        </button>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Редагувати профіль
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ім'я
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Телефон
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={editForm.phone}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Підтверджено
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Номер телефону не можна змінити
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Місто
                </label>
                <select
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="brussels">Брюссель</option>
                  <option value="antwerp">Антверпен</option>
                  <option value="ghent">Гент</option>
                  <option value="liege">Льєж</option>
                  <option value="charleroi">Шарлеруа</option>
                  <option value="bruges">Брюгге</option>
                  <option value="leuven">Лювен</option>
                  <option value="other">Інше</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProfile(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Save button clicked!');
                  handleSaveProfile();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSuccess={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

// Listing card component
function ListingCard({ item, type, icon, onDelete, onEdit }) {
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
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
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {item.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {item.price !== undefined && item.price !== null && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {item.isFree ? 'Безкоштовно' : `€${item.price}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
