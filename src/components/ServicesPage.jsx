import { useState, useEffect } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Search, ChevronRight, ArrowLeft, Trash2, Edit2, LogIn } from 'lucide-react';
import { Card, SectionTitle } from './Layout';
import { serviceCategories, belgianCities } from '../data/categories';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isBackendReady, createListing, updateListing, deleteListing } from '../lib/supabase';
import { useListings } from '../hooks/useListings';
import { ImageUpload } from './ui/ImageUpload';

// Get or create local user ID for anonymous users
function getLocalUserId() {
  let localId = loadFromStorage('local-user-id', null);
  if (!localId) {
    localId = 'local-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    saveToStorage('local-user-id', localId);
  }
  return localId;
}

// Add Service Form Component
function AddServiceForm({ onClose, onAdd, editItem = null, initialCategory = null }) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: editItem?.name || editItem?.title || '',
    category: editItem?.category || initialCategory || 'repair',
    city: editItem?.city || profile?.city || 'brussels',
    description: editItem?.description || '',
    phone: editItem?.contact_phone || editItem?.contact?.phone || profile?.phone || '',
    telegram: editItem?.contact_telegram || editItem?.contact?.telegram || (profile?.telegram_username ? `@${profile.telegram_username}` : ''),
    price: editItem?.price || '',
    images: editItem?.images || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = user?.id || getLocalUserId();
    const newItem = {
      id: editItem?.id || Date.now().toString(),
      name: formData.name,
      title: formData.name, // For compatibility
      category: formData.category,
      city: formData.city,
      description: formData.description,
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      price: formData.price,
      images: formData.images,
      createdAt: editItem?.createdAt || new Date().toISOString(),
      userId: userId,
      isUserItem: true,
    };

    try {
      await onAdd(newItem);
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.message || 'Помилка збереження');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {editItem ? 'Редагувати послугу' : 'Додати послугу'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
          />

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Назва *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Перукар Марія"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Категорія</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {serviceCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Місто</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {belgianCities.map(city => (
                <option key={city.id} value={city.id}>{city.name.split(' / ')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Ціна (необов'язково)</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: від €30/год або Договірна"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              placeholder="Опишіть вашу послугу, досвід, що пропонуєте..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="+32 ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Telegram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">@</span>
              <input
                type="text"
                value={formData.telegram.replace(/^@/, '')}
                onChange={(e) => {
                  const value = e.target.value.replace(/^@/, '');
                  setFormData({ ...formData, telegram: value ? `@${value}` : '' });
                }}
                className="w-full pl-8 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="username"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Зберігаємо...' : (editItem ? 'Зберегти' : 'Опублікувати')}
          </button>
        </form>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, isFavorite, onToggleFavorite, isOwner, onEdit, onDelete, getCategoryIcon, getCityName }) {
  const [showContacts, setShowContacts] = useState(false);

  const contactPhone = service.contact?.phone || service.contact_phone;
  const contactTelegram = service.contact?.telegram || service.contact_telegram;
  const category = serviceCategories.find(c => c.id === service.category);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.name || service.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl flex-shrink-0">
            {category?.icon || '📦'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {service.name || service.title}
            </h3>
            <div className="flex items-center gap-1">
              {isOwner && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(service); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(service.id); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(service.id); }}
                className="p-2 -m-2"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{getCityName(service.city)}</span>
            <span>•</span>
            <span>{category?.name}</span>
          </div>

          {service.price && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg">
                {service.price}
              </span>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {service.description}
          </p>

          <button
            onClick={() => setShowContacts(!showContacts)}
            className="w-full py-2 text-sm font-medium rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {showContacts ? 'Сховати контакти' : 'Показати контакти'}
          </button>

          {showContacts && (
            <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  <Phone className="w-4 h-4" />
                  {contactPhone}
                </a>
              )}
              {contactTelegram && (
                <a
                  href={`https://t.me/${contactTelegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  {contactTelegram}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Auth Required Modal
function AuthRequiredModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Потрібна авторизація
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Щоб додавати послуги, будь ласка, увійдіть у свій акаунт
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium"
          >
            Скасувати
          </button>
          <button
            onClick={onLogin}
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
          >
            Увійти
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to check if string is a valid UUID
const isValidUUID = (str) => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Main Services Page
export function ServicesPage({ onNavigate, initialCategoryFilter = null }) {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || '');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => loadFromStorage('services-favorites', []));

  // SWR for instant cache + background refresh
  const { listings: userServices, isLoading, refresh } = useListings('services');

  // Check for item to edit from profile page
  useEffect(() => {
    const editingData = loadFromStorage('editing-item', null);
    if (editingData && editingData.type === 'service' && editingData.item) {
      setEditingItem(editingData.item);
      setShowAddForm(true);
      saveToStorage('editing-item', null);
    }
  }, []);

  const getCityName = (cityId) => {
    const city = belgianCities.find(c => c.id === cityId);
    return city ? city.name.split(' / ')[0] : cityId;
  };

  const getCategoryIcon = (catId) => {
    const category = serviceCategories.find(c => c.id === catId);
    return category ? category.icon : '📦';
  };

  const filteredServices = userServices.filter((service) => {
    if (categoryFilter && service.category !== categoryFilter) return false;
    if (cityFilter && service.city !== cityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = (service.name || service.title || '').toLowerCase();
      const desc = (service.description || '').toLowerCase();
      if (!name.includes(query) && !desc.includes(query)) return false;
    }
    return true;
  });

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleAddItem = async (item) => {
    if (isBackendReady && supabase && user) {
      try {
        const supabaseData = {
          user_id: user.id,
          title: item.name,
          description: item.description,
          price: item.price || null,
          category: item.category,
          city: item.city,
          images: item.images || [],
          contact_phone: item.contact?.phone || '',
          contact_telegram: item.contact?.telegram || '',
          status: 'active',
        };

        if (isValidUUID(item.id)) {
          const { error } = await updateListing('services', item.id, supabaseData);
          if (error) {
            throw new Error('Помилка оновлення: ' + error.message);
          }
        } else {
          const { error } = await createListing('services', supabaseData);
          if (error) {
            throw new Error('Помилка створення: ' + error.message);
          }
        }
        await refresh();
      } catch (err) {
        console.error('Supabase error:', err);
        throw err;
      }
    } else {
      // Offline mode
      const existingIndex = userServices.findIndex(i => i.id === item.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...userServices];
        updated[existingIndex] = item;
      } else {
        updated = [item, ...userServices];
      }
      saveToStorage('services-items', updated);
      refresh(updated, false);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Видалити цю послугу?')) return;

    if (isBackendReady && supabase && user) {
      try {
        const { error } = await deleteListing('services', itemId);
        if (error) {
          alert('Помилка видалення: ' + error.message);
          return;
        }
        await refresh();
      } catch (err) {
        console.error('Error deleting service:', err);
      }
    } else {
      const updated = userServices.filter(i => i.id !== itemId);
      saveToStorage('services-items', updated);
      refresh(updated, false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const toggleFavorite = (itemId) => {
    const updated = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    setFavorites(updated);
    saveToStorage('services-favorites', updated);
  };

  const isOwner = (item) => {
    if (!user) return false;
    return item.user_id === user.id || item.userId === user.id;
  };

  const selectedCategory = serviceCategories.find(c => c.id === categoryFilter);

  // Show category selection if no category selected
  if (!categoryFilter) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Послуги
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Українські спеціалісти в Бельгії
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук послуг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          />
        </div>

        {/* If searching, show results */}
        {searchQuery ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Знайдено: {filteredServices.length} послуг
            </p>
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isFavorite={favorites.includes(service.id)}
                  onToggleFavorite={toggleFavorite}
                  isOwner={isOwner(service)}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  getCategoryIcon={getCategoryIcon}
                  getCityName={getCityName}
                />
              ))}
            </div>
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Нічого не знайдено
                </p>
              </div>
            )}
          </>
        ) : (
          /* Category Cards */
          <div className="grid gap-3">
            {serviceCategories.map((cat) => {
              const count = userServices.filter(s => s.category === cat.id).length;
              return (
                <Card
                  key={cat.id}
                  className={`p-4 ${cat.featured ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      cat.featured
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {cat.name}
                        </h3>
                        {cat.featured && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                            Популярне
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cat.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {count} {count === 1 ? 'послуга' : count < 5 ? 'послуги' : 'послуг'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleAddClick}
          className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Auth Required Modal */}
        {showAuthModal && (
          <AuthRequiredModal
            onClose={() => setShowAuthModal(false)}
            onLogin={() => {
              setShowAuthModal(false);
              if (onNavigate) onNavigate('profile');
            }}
          />
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <AddServiceForm
            onClose={() => { setShowAddForm(false); setEditingItem(null); }}
            onAdd={handleAddItem}
            editItem={editingItem}
          />
        )}
      </div>
    );
  }

  // Show services list for selected category
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCategoryFilter('')}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{selectedCategory?.icon}</span>
            {selectedCategory?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* City filter */}
      <div className="flex gap-2">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm flex-1"
        >
          <option value="">Усі міста</option>
          {belgianCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name.split(' / ')[0]}
            </option>
          ))}
        </select>
        {cityFilter && (
          <button
            onClick={() => setCityFilter('')}
            className="px-3 py-2 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            Очистити
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isLoading ? 'Завантаження...' : `Знайдено: ${filteredServices.length} послуг`}
      </p>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isFavorite={favorites.includes(service.id)}
            onToggleFavorite={toggleFavorite}
            isOwner={isOwner(service)}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            getCategoryIcon={getCategoryIcon}
            getCityName={getCityName}
          />
        ))}
      </div>

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Ще немає послуг у цій категорії
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Станьте першим, хто додасть свою послугу!
          </p>
          <button
            onClick={handleAddClick}
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Додати послугу
          </button>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <AuthRequiredModal
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            setShowAuthModal(false);
            if (onNavigate) onNavigate('profile');
          }}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddServiceForm
          onClose={() => { setShowAddForm(false); setEditingItem(null); }}
          onAdd={handleAddItem}
          editItem={editingItem}
          initialCategory={categoryFilter}
        />
      )}
    </div>
  );
}

// Simplified Service Profile Page (for backwards compatibility)
export function ServiceProfilePage({ serviceId, onBack }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Деталі послуги недоступні</p>
      <button
        onClick={onBack}
        className="mt-4 text-blue-600 dark:text-blue-400 font-medium"
      >
        Повернутися назад
      </button>
    </div>
  );
}
