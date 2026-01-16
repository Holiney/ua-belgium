import { useState, useRef, useEffect } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Search, Clock, Image, ChevronLeft, ChevronRight, Trash2, Edit2, LogIn } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isBackendReady, createListing, updateListing, deleteListing, getListings } from '../lib/supabase';

// Get or create local user ID for anonymous users
function getLocalUserId() {
  let localId = loadFromStorage('local-user-id', null);
  if (!localId) {
    localId = 'local-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    saveToStorage('local-user-id', localId);
  }
  return localId;
}

// Categories for food
export const categories = [
  { id: 'all', name: 'Все', icon: '🍽️' },
  { id: 'homemade', name: 'Домашня їжа', icon: '🥘' },
  { id: 'ukrainian', name: 'Продукти з України', icon: '🇺🇦' },
  { id: 'baking', name: 'Випічка', icon: '🥐' },
  { id: 'drinks', name: 'Напої', icon: '🍷' },
  { id: 'sweets', name: 'Солодощі', icon: '🍬' },
  { id: 'preserves', name: 'Консервація', icon: '🫙' },
];

export const cities = [
  { id: 'all', name: 'Вся Бельгія' },
  { id: 'brussels', name: 'Брюссель' },
  { id: 'antwerp', name: 'Антверпен' },
  { id: 'ghent', name: 'Гент' },
  { id: 'liege', name: 'Льєж' },
  { id: 'bruges', name: 'Брюгге' },
  { id: 'other', name: 'Інше місто' },
];


// Image Upload Component
function ImageUpload({ images, onChange, maxImages = 5 }) {
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    // Read all files first, then update state once
    const readFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    };

    const newImages = await Promise.all(filesToProcess.map(readFile));
    onChange([...images, ...newImages]);

    e.target.value = '';
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium dark:text-gray-200">
        Фото (до {maxImages} шт.)
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center gap-2 hover:border-blue-500 transition-colors"
        >
          <Image className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Додати фото ({images.length}/{maxImages})
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

// Add Food Form Component
function AddFoodForm({ onClose, onAdd, editItem = null }) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    category: editItem?.category || 'homemade',
    price: editItem?.price?.toString() || '',
    unit: editItem?.unit || 'за порцію',
    city: editItem?.city || profile?.city || 'brussels',
    description: editItem?.description || '',
    phone: editItem?.contact?.phone || profile?.phone || '',
    telegram: editItem?.contact?.telegram || (profile?.telegram_username ? `@${profile.telegram_username}` : ''),
    availableDays: editItem?.availableDays || '',
    images: editItem?.images || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = user?.id || getLocalUserId();
    const newItem = {
      id: editItem?.id || Date.now().toString(),
      title: formData.title,
      category: formData.category,
      price: parseInt(formData.price) || 0,
      unit: formData.unit,
      city: formData.city,
      description: formData.description,
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      availableDays: formData.availableDays,
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
            {editItem ? 'Редагувати оголошення' : 'Додати оголошення'}
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
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Домашні вареники"
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
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Ціна (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Одиниця</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="за порцію">за порцію</option>
                <option value="за 1 кг">за 1 кг</option>
                <option value="за упаковку">за упаковку</option>
                <option value="за банку">за банку</option>
                <option value="за 0.5л">за 0.5л</option>
                <option value="за 1л">за 1л</option>
                <option value="за торт">за торт</option>
                <option value="за штуку">за штуку</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Місто</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {cities.filter(c => c.id !== 'all').map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Коли доступно</label>
            <input
              type="text"
              value={formData.availableDays}
              onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Сб-Нд або За замовленням"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Додайте деталі про продукт..."
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
            <input
              type="text"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="@username"
            />
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

// Food Card Component
function FoodCard({ item, isFavorite, onToggleFavorite, isOwner, onEdit, onDelete }) {
  const [showContacts, setShowContacts] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const category = categories.find(c => c.id === item.category);
  const city = cities.find(c => c.id === item.city);

  // Handle both local and Supabase data formats
  const contactPhone = item.contact?.phone || item.contact_phone;
  const contactTelegram = item.contact?.telegram || item.contact_telegram;

  return (
    <Card className="overflow-hidden">
      {item.images && item.images.length > 0 && (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={item.images[imageIndex]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {item.images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex(i => (i > 0 ? i - 1 : item.images.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImageIndex(i => (i < item.images.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                {imageIndex + 1}/{item.images.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{category?.icon}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{category?.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              className="p-2 -m-2"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {item.price > 0 ? (
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              €{item.price} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Ціна договірна</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {city?.name || item.city}
          </span>
          {item.availableDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.availableDays}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

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
          Щоб додавати оголошення, будь ласка, увійдіть у свій акаунт
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

// Main Food Page
export function FoodPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Initialize from cache immediately for instant display
  const [userItems, setUserItems] = useState(() => loadFromStorage('food-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('food-favorites', []));
  // Only show loading if cache is empty
  const [isLoading, setIsLoading] = useState(() => loadFromStorage('food-items', []).length === 0);

  // Load listings once on mount - refresh from server in background
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const cached = loadFromStorage('food-items', []);
    // Only show loading spinner if no cached data
    if (cached.length === 0) {
      setIsLoading(true);
    }
    try {
      if (isBackendReady && supabase) {
        const { data, error } = await getListings('food');
        if (error) {
          console.error('Error loading food from Supabase:', error);
          // Keep cached data on error
        } else {
          const listings = data || [];
          setUserItems(listings);
          // Update cache
          saveToStorage('food-items', listings);
        }
      }
    } catch (err) {
      console.error('Error loading listings:', err);
      // Keep cached data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Check for item to edit from profile page
  useEffect(() => {
    const editingData = loadFromStorage('editing-item', null);
    if (editingData && editingData.type === 'food' && editingData.item) {
      setEditingItem(editingData.item);
      setShowAddForm(true);
      saveToStorage('editing-item', null);
    }
  }, []);

  const allItems = [...userItems].sort(
    (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
  );

  const filteredItems = allItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
          title: item.title,
          description: item.description,
          price: item.price || 0,
          category: item.category,
          city: item.city,
          images: item.images || [],
          contact_phone: item.contact?.phone || '',
          contact_telegram: item.contact?.telegram || '',
          status: 'active',
        };

        if (isValidUUID(item.id)) {
          const { error } = await updateListing('food', item.id, supabaseData);
          if (error) {
            throw new Error('Помилка оновлення: ' + error.message);
          }
        } else {
          const { error } = await createListing('food', supabaseData);
          if (error) {
            throw new Error('Помилка створення: ' + error.message);
          }
        }
        await loadListings();
      } catch (err) {
        console.error('Supabase error:', err);
        throw err;
      }
    } else {
      const existingIndex = userItems.findIndex(i => i.id === item.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...userItems];
        updated[existingIndex] = item;
      } else {
        updated = [item, ...userItems];
      }
      setUserItems(updated);
      saveToStorage('food-items', updated);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Видалити це оголошення?')) return;

    if (isBackendReady && supabase && user) {
      try {
        const { error } = await deleteListing('food', itemId);
        if (error) {
          alert('Помилка видалення: ' + error.message);
          return;
        }
        await loadListings();
      } catch (err) {
        console.error('Error deleting food:', err);
      }
    } else {
      const updated = userItems.filter(i => i.id !== itemId);
      setUserItems(updated);
      saveToStorage('food-items', updated);
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
    saveToStorage('food-favorites', updated);
  };

  const isOwner = (item) => {
    if (!user) return false;
    return item.user_id === user.id || item.userId === user.id;
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
        Приватні оголошення. Відповідальність за якість продуктів несе продавець.
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук їжі та напоїв..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        />
      </div>

      {/* Categories */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div className="flex gap-2">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        >
          {cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Знайдено: {filteredItems.length} оголошень
      </p>

      {/* Items Grid */}
      <div className="grid gap-4">
        {filteredItems.map(item => (
          <FoodCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={toggleFavorite}
            isOwner={isOwner(item)}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Оголошень не знайдено</p>
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
        <AddFoodForm
          onClose={() => { setShowAddForm(false); setEditingItem(null); }}
          onAdd={handleAddItem}
          editItem={editingItem}
        />
      )}
    </div>
  );
}
