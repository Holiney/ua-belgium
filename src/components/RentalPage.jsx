import { useState, useRef, useEffect } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Search, Home, Calendar, Image, ChevronLeft, ChevronRight, Trash2, Edit2, LogIn } from 'lucide-react';
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

// Categories for rental
export const categories = [
  { id: 'all', name: 'Все', icon: '🏠' },
  { id: 'apartment', name: 'Квартири', icon: '🏢' },
  { id: 'room', name: 'Кімнати', icon: '🚪' },
  { id: 'house', name: 'Будинки', icon: '🏡' },
  { id: 'short-term', name: 'Подобово', icon: '📅' },
];

export const cities = [
  { id: 'all', name: 'Вся Бельгія' },
  { id: 'brussels', name: 'Брюссель' },
  { id: 'antwerp', name: 'Антверпен' },
  { id: 'ghent', name: 'Гент' },
  { id: 'liege', name: 'Льєж' },
  { id: 'bruges', name: 'Брюгге' },
  { id: 'leuven', name: 'Лювен' },
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

// Add Rental Form Component
function AddRentalForm({ onClose, onAdd, editItem = null }) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    category: editItem?.category || 'apartment',
    price: editItem?.price?.toString() || '',
    priceType: editItem?.priceType || 'month',
    rooms: editItem?.rooms?.toString() || '1',
    city: editItem?.city || profile?.city || 'brussels',
    district: editItem?.district || '',
    description: editItem?.description || '',
    features: editItem?.features?.join(', ') || '',
    phone: editItem?.contact?.phone || profile?.phone || '',
    telegram: editItem?.contact?.telegram || (profile?.telegram_username ? `@${profile.telegram_username}` : ''),
    available: editItem?.available || '',
    images: editItem?.images || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = user?.id || getLocalUserId();
    const newRental = {
      id: editItem?.id || Date.now().toString(),
      title: formData.title,
      category: formData.category,
      price: parseInt(formData.price) || 0,
      priceType: formData.priceType,
      rooms: parseInt(formData.rooms) || 1,
      city: formData.city,
      district: formData.district,
      description: formData.description,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      available: formData.available,
      images: formData.images,
      createdAt: editItem?.createdAt || new Date().toISOString(),
      userId: userId,
      isUserItem: true,
    };

    try {
      await onAdd(newRental);
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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Заголовок *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Затишна квартира в центрі"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Тип житла</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Період</label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="month">на місяць</option>
                <option value="day">за добу</option>
                <option value="week">за тиждень</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Кількість кімнат</label>
            <select
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="1">1 кімната / Студія</option>
              <option value="2">2 кімнати</option>
              <option value="3">3 кімнати</option>
              <option value="4">4+ кімнати</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Район</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Наприклад: Ixelles"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Коли доступно</label>
            <input
              type="text"
              value={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: з 1 лютого"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Особливості (через кому)</label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Мебльована, Wi-Fi, Балкон"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Додайте деталі про житло..."
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

// Rental Card Component
function RentalCard({ rental, isFavorite, onToggleFavorite, isOwner, onEdit, onDelete }) {
  const [showContacts, setShowContacts] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const category = categories.find(c => c.id === rental.category || c.id === rental.rental_type);
  const city = cities.find(c => c.id === rental.city);

  // Handle both local and Supabase data formats
  const contactPhone = rental.contact?.phone || rental.contact_phone;
  const contactTelegram = rental.contact?.telegram || rental.contact_telegram;

  const priceLabel = {
    month: '/міс',
    day: '/добу',
    week: '/тиждень',
  };

  return (
    <Card className="overflow-hidden">
      {rental.images && rental.images.length > 0 && (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={rental.images[imageIndex]}
            alt={rental.title}
            className="w-full h-full object-cover"
          />
          {rental.images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex(i => (i > 0 ? i - 1 : rental.images.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImageIndex(i => (i < rental.images.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                {imageIndex + 1}/{rental.images.length}
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
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{rental.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(rental); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(rental.id); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(rental.id);
              }}
              className="p-2 -m-2"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            €{rental.price}
            <span className="text-sm font-normal text-gray-500">{priceLabel[rental.priceType]}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            <Home className="w-3.5 h-3.5" />
            {rental.rooms} {rental.rooms === 1 ? 'кімната' : rental.rooms < 5 ? 'кімнати' : 'кімнат'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          {city?.name}{rental.district && `, ${rental.district}`}
        </div>

        {rental.available && (
          <div className="flex items-center gap-1 text-sm mb-2 text-green-600 dark:text-green-400">
            <Calendar className="w-4 h-4" />
            {rental.available}
          </div>
        )}

        {rental.features && rental.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {rental.features.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {feature}
              </span>
            ))}
            {rental.features.length > 3 && (
              <span className="text-xs text-gray-500">+{rental.features.length - 3}</span>
            )}
          </div>
        )}

        {rental.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {rental.description}
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

// Main Rental Page
export function RentalPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRentals, setUserRentals] = useState([]);
  const [favorites, setFavorites] = useState(() => loadFromStorage('rental-favorites', []));
  const [isLoading, setIsLoading] = useState(true);

  // Load listings from Supabase or localStorage
  useEffect(() => {
    loadListings();
  }, [user]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      if (isBackendReady && supabase) {
        const { data, error } = await getListings('rentals');
        if (error) {
          console.error('Error loading rentals from Supabase:', error);
          setUserRentals(loadFromStorage('rental-items', []));
        } else {
          setUserRentals(data || []);
        }
      } else {
        setUserRentals(loadFromStorage('rental-items', []));
      }
    } catch (err) {
      console.error('Error loading listings:', err);
      setUserRentals(loadFromStorage('rental-items', []));
    } finally {
      setIsLoading(false);
    }
  };

  // Check for item to edit from profile page
  useEffect(() => {
    const editingData = loadFromStorage('editing-item', null);
    if (editingData && editingData.type === 'rental' && editingData.item) {
      setEditingRental(editingData.item);
      setShowAddForm(true);
      saveToStorage('editing-item', null);
    }
  }, []);

  const allRentals = [...userRentals].sort(
    (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
  );

  const filteredRentals = allRentals.filter(rental => {
    if (selectedCategory !== 'all' && rental.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && rental.city !== selectedCity) return false;
    if (searchQuery && !rental.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleAddRental = async (rental) => {
    if (isBackendReady && supabase && user) {
      try {
        const supabaseData = {
          user_id: user.id,
          title: rental.title,
          description: rental.description,
          price: rental.price || 0,
          rental_type: rental.category,
          city: rental.city,
          images: rental.images || [],
          contact_phone: rental.contact?.phone || '',
          contact_telegram: rental.contact?.telegram || '',
          status: 'active',
        };

        if (isValidUUID(rental.id)) {
          const { error } = await updateListing('rentals', rental.id, supabaseData);
          if (error) {
            throw new Error('Помилка оновлення: ' + error.message);
          }
        } else {
          const { error } = await createListing('rentals', supabaseData);
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
      const existingIndex = userRentals.findIndex(r => r.id === rental.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...userRentals];
        updated[existingIndex] = rental;
      } else {
        updated = [rental, ...userRentals];
      }
      setUserRentals(updated);
      saveToStorage('rental-items', updated);
    }
    setEditingRental(null);
  };

  const handleDeleteRental = async (rentalId) => {
    if (!confirm('Видалити це оголошення?')) return;

    if (isBackendReady && supabase && user) {
      try {
        const { error } = await deleteListing('rentals', rentalId);
        if (error) {
          alert('Помилка видалення: ' + error.message);
          return;
        }
        await loadListings();
      } catch (err) {
        console.error('Error deleting rental:', err);
      }
    } else {
      const updated = userRentals.filter(r => r.id !== rentalId);
      setUserRentals(updated);
      saveToStorage('rental-items', updated);
    }
  };

  const handleEditRental = (rental) => {
    setEditingRental(rental);
    setShowAddForm(true);
  };

  const toggleFavorite = (rentalId) => {
    const updated = favorites.includes(rentalId)
      ? favorites.filter(id => id !== rentalId)
      : [...favorites, rentalId];
    setFavorites(updated);
    saveToStorage('rental-favorites', updated);
  };

  const isOwner = (rental) => {
    if (!user) return false;
    return rental.user_id === user.id || rental.userId === user.id;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук житла..."
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
        Знайдено: {filteredRentals.length} оголошень
      </p>

      {/* Rentals Grid */}
      <div className="grid gap-4">
        {filteredRentals.map(rental => (
          <RentalCard
            key={rental.id}
            rental={rental}
            isFavorite={favorites.includes(rental.id)}
            onToggleFavorite={toggleFavorite}
            isOwner={isOwner(rental)}
            onEdit={handleEditRental}
            onDelete={handleDeleteRental}
          />
        ))}
      </div>

      {filteredRentals.length === 0 && (
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
        <AddRentalForm
          onClose={() => { setShowAddForm(false); setEditingRental(null); }}
          onAdd={handleAddRental}
          editItem={editingRental}
        />
      )}
    </div>
  );
}
