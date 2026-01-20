import { useState, useRef, useEffect } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Gift, Search, ChevronLeft, ChevronRight, Trash2, Edit2, LogIn } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isBackendReady, createListing, updateListing, deleteListing } from '../lib/supabase';
import { useListings } from '../hooks/useListings';
import { ImageUpload } from './ui/ImageUpload';

// Categories for products
export const categories = [
  { id: 'all', name: 'Всі', icon: '📦' },
  { id: 'electronics', name: 'Електроніка', icon: '📱' },
  { id: 'furniture', name: 'Меблі', icon: '🛋️' },
  { id: 'appliances', name: 'Побутова техніка', icon: '🧺' },
  { id: 'clothing', name: 'Одяг та взуття', icon: '👕' },
  { id: 'kids', name: 'Дитяче', icon: '🧸' },
  { id: 'transport', name: 'Транспорт', icon: '🚗' },
  { id: 'tools', name: 'Інструменти', icon: '🔧' },
  { id: 'sports', name: 'Спорт та хобі', icon: '⚽' },
  { id: 'other', name: 'Інше', icon: '📦' },
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

const conditions = [
  { id: 'all', name: 'Будь-який' },
  { id: 'new', name: 'Нове' },
  { id: 'used', name: 'Б/У' },
];


// Image Gallery Component
function ImageGallery({ images, onRemove, editable = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative">
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={images[currentIndex]}
          alt={`Фото ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {editable && (
        <button
          onClick={() => onRemove(currentIndex)}
          className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Get or create local user ID for anonymous users
function getLocalUserId() {
  let localId = loadFromStorage('local-user-id', null);
  if (!localId) {
    localId = 'local-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    saveToStorage('local-user-id', localId);
  }
  return localId;
}

// Add Product Form Component
function AddProductForm({ onClose, onAdd, editItem = null }) {
  const { user, profile } = useAuth();
  const localProfile = loadFromStorage('user-profile', {});
  const currentProfile = profile || localProfile;

  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    category: editItem?.category || 'electronics',
    price: editItem?.price?.toString() || '',
    condition: editItem?.condition || 'used',
    city: editItem?.city || currentProfile?.city || 'brussels',
    description: editItem?.description || '',
    phone: editItem?.contact?.phone || currentProfile?.phone || '',
    telegram: editItem?.contact?.telegram || (currentProfile?.telegram_username ? `@${currentProfile.telegram_username}` : ''),
    isFree: editItem?.isFree || false,
    images: editItem?.images || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = user?.id || getLocalUserId();

    const newProduct = {
      id: editItem?.id || Date.now().toString(),
      title: formData.title,
      category: formData.category,
      price: formData.isFree ? 0 : (parseInt(formData.price) || 0),
      condition: formData.condition,
      city: formData.city,
      description: formData.description,
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      images: formData.images,
      isFree: formData.isFree,
      createdAt: editItem?.createdAt || new Date().toISOString(),
      userId: userId,
      isUserItem: true,
    };

    try {
      await onAdd(newProduct);
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
              placeholder="Наприклад: iPhone 13 Pro"
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

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium dark:text-gray-200">Віддам безкоштовно</span>
            </label>
          </div>

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Ціна *</label>
              <div className="relative w-32">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 pr-8 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                  required
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">€</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Стан</label>
            <div className="flex gap-2">
              {conditions.filter(c => c.id !== 'all').map(cond => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: cond.id })}
                  className={`flex-1 py-2 px-4 rounded-xl border transition-colors ${
                    formData.condition === cond.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 dark:text-gray-200'
                  }`}
                >
                  {cond.name}
                </button>
              ))}
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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Додайте деталі про товар..."
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

// Product Card Component
function ProductCard({ product, isFavorite, onToggleFavorite, isOwner, onEdit, onDelete }) {
  const [showContacts, setShowContacts] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const category = categories.find(c => c.id === product.category);
  const city = cities.find(c => c.id === product.city);

  // Handle both local and Supabase data formats
  const isFree = product.isFree || product.is_free;
  const contactPhone = product.contact?.phone || product.contact_phone;
  const contactTelegram = product.contact?.telegram || product.contact_telegram;

  return (
    <Card className="overflow-hidden">
      {product.images && product.images.length > 0 && (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={product.images[imageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex(i => (i > 0 ? i - 1 : product.images.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImageIndex(i => (i < product.images.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                {imageIndex + 1}/{product.images.length}
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
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product.id);
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
          {isFree ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              <Gift className="w-4 h-4" />
              Безкоштовно
            </span>
          ) : product.price > 0 ? (
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">€{product.price}</span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Договірна</span>
          )}
          {product.condition && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              {product.condition === 'new' ? 'Нове' : 'Б/У'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          {city?.name || product.city}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {product.description}
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

// Main Products Page
export function ProductsPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => loadFromStorage('products-favorites', []));

  // SWR for instant cache + background refresh
  const { listings: userProducts, isLoading, refresh } = useListings('products');

  const loadListings = refresh;

  // Check for item to edit from profile page
  useEffect(() => {
    const editingData = loadFromStorage('editing-item', null);
    if (editingData && editingData.type === 'products' && editingData.item) {
      setEditingProduct(editingData.item);
      setShowAddForm(true);
      saveToStorage('editing-item', null); // Clear after use
    }
  }, []);

  const allProducts = [...userProducts].sort(
    (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
  );

  const filteredProducts = allProducts.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && product.city !== selectedCity) return false;
    if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
    if (showFreeOnly && !product.isFree && !product.is_free) return false;
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleAddProduct = async (product) => {
    if (isBackendReady && supabase && user) {
      try {
        // Prepare data for Supabase
        const supabaseData = {
          user_id: user.id,
          title: product.title,
          description: product.description,
          price: product.price || 0,
          is_free: product.isFree || false,
          category: product.category,
          city: product.city,
          images: product.images || [],
          contact_phone: product.contact?.phone || '',
          contact_telegram: product.contact?.telegram || '',
          status: 'active',
        };

        // Only update if product has a valid UUID (existing Supabase product)
        if (isValidUUID(product.id)) {
          const { error } = await updateListing('products', product.id, supabaseData);
          if (error) {
            throw new Error('Помилка оновлення: ' + error.message);
          }
        } else {
          const { error } = await createListing('products', supabaseData);
          if (error) {
            throw new Error('Помилка створення: ' + error.message);
          }
        }

        // Reload listings
        await loadListings();
      } catch (err) {
        console.error('Supabase error:', err);
        throw err;
      }
    } else {
      // Offline mode - update localStorage and refresh cache
      const existingIndex = userProducts.findIndex(p => p.id === product.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...userProducts];
        updated[existingIndex] = product;
      } else {
        updated = [product, ...userProducts];
      }
      saveToStorage('products-items', updated);
      refresh(updated, false); // Update SWR cache without revalidation
    }

    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Видалити це оголошення?')) return;

    if (isBackendReady && supabase && user) {
      try {
        const { error } = await deleteListing('products', productId);
        if (error) {
          console.error('Error deleting product:', error);
          alert('Помилка видалення: ' + error.message);
          return;
        }
        await loadListings();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    } else {
      // Offline mode - update localStorage and refresh cache
      const updated = userProducts.filter(p => p.id !== productId);
      saveToStorage('products-items', updated);
      refresh(updated, false); // Update SWR cache without revalidation
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const toggleFavorite = (productId) => {
    const updated = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    setFavorites(updated);
    saveToStorage('products-favorites', updated);
  };

  const isOwner = (product) => {
    if (!user) return false;
    return product.user_id === user.id || product.userId === user.id;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук товарів..."
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

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        >
          {cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>

        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        >
          {conditions.map(cond => (
            <option key={cond.id} value={cond.id}>{cond.name}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFreeOnly(!showFreeOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
            showFreeOnly
              ? 'bg-green-500 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Gift className="w-4 h-4" />
          Безкоштовно
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Знайдено: {filteredProducts.length} оголошень
      </p>

      {/* Products Grid */}
      <div className="grid gap-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={toggleFavorite}
            isOwner={isOwner(product)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
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
        <AddProductForm
          onClose={() => { setShowAddForm(false); setEditingProduct(null); }}
          onAdd={handleAddProduct}
          editItem={editingProduct}
        />
      )}
    </div>
  );
}
