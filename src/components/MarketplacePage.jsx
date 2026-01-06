import { useState, useMemo, useEffect } from 'react';
import { Card, SectionTitle } from './Layout';
import { Search, Filter, MapPin, Phone, MessageCircle, Plus, X, Heart } from 'lucide-react';
import {
  marketplaceCategories,
  belgianCities,
  mockMarketplaceItems
} from '../data/marketplace';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const conditions = {
  'new': 'Новий',
  'like-new': 'Як новий',
  'good': 'Добрий',
  'fair': 'Задовільний'
};

const preferredContacts = {
  'phone': 'Телефон',
  'telegram': 'Telegram',
  'viber': 'Viber'
};

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userItems, setUserItems] = useState(() => loadFromStorage('marketplace-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('marketplace-favorites', []));

  // Збереження даних при зміні
  useEffect(() => {
    saveToStorage('marketplace-items', userItems);
  }, [userItems]);

  useEffect(() => {
    saveToStorage('marketplace-favorites', favorites);
  }, [favorites]);

  // Об'єднання mock даних з користувацькими
  const allItems = useMemo(() => {
    const userItemsWithDates = userItems.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
    return [...userItemsWithDates, ...mockMarketplaceItems];
  }, [userItems]);

  // Фільтрування товарів
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || item.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity && item.status === 'active';
    });
  }, [searchQuery, selectedCategory, selectedCity, allItems]);

  const handleAddItem = (newItem) => {
    const item = {
      ...newItem,
      id: `user-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      photos: []
    };
    setUserItems(prev => [item, ...prev]);
    setShowAddForm(false);
  };

  const toggleFavorite = (itemId) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <SectionTitle>🛍️ Маркетплейс</SectionTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Купівля-продаж товарів між українцями
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Шукати товари..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Всі категорії
        </button>
        {Object.values(marketplaceCategories).map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
        >
          <Filter className="w-4 h-4" />
          Фільтри
          {(selectedCity !== 'all') && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full text-xs">1</span>
          )}
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Місто</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Всі міста</option>
                {belgianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Знайдено: {filteredItems.length} {filteredItems.length === 1 ? 'товар' : 'товарів'}
      </p>

      {/* Items grid */}
      <div className="grid gap-4">
        {filteredItems.map(item => (
          <MarketplaceItemCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        ))}

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              😔 Товарів не знайдено. Спробуйте змінити фільтри.
            </p>
          </Card>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddItemForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddItem}
        />
      )}
    </div>
  );
}

function AddItemForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
    condition: 'good',
    city: 'Brussels',
    contactName: '',
    contactPhone: '',
    preferredContact: 'telegram'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.contactPhone) {
      alert('Заповніть обов\'язкові поля: назва, ціна, телефон');
      return;
    }
    onSubmit({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      currency: 'EUR',
      category: formData.category,
      condition: formData.condition,
      city: formData.city,
      contact: {
        name: formData.contactName,
        phone: formData.contactPhone,
        preferredContact: formData.preferredContact
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-y-auto mt-12 rounded-t-3xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Додати оголошення</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
          {/* Назва */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Назва товару <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Наприклад: Дитяче крісло Maxi-Cosi"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-medium mb-2">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Детальний опис товару..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Ціна та категорія */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ціна (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Категорія</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(marketplaceCategories).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Стан та місто */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Стан</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(conditions).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Місто</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {belgianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Контактна інформація */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3">Контактна інформація</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Ваше ім'я</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  placeholder="Як до вас звертатися"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+32 4XX XX XX XX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Бажаний спосіб зв'язку</label>
                <select
                  value={formData.preferredContact}
                  onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(preferredContacts).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            Опублікувати оголошення
          </button>
        </form>
      </div>
    </div>
  );
}

function MarketplaceItemCard({ item, isFavorite, onToggleFavorite }) {
  const category = marketplaceCategories[item.category];
  const conditionLabels = {
    'new': 'Новий',
    'like-new': 'Як новий',
    'good': 'Добрий',
    'fair': 'Задовільний'
  };

  const formatDate = (date) => {
    const now = new Date();
    const itemDate = date instanceof Date ? date : new Date(date);
    const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сьогодні';
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    return itemDate.toLocaleDateString('uk-UA');
  };

  const handleContact = (type) => {
    if (type === 'phone') {
      window.location.href = `tel:${item.contact.phone}`;
    } else if (type === 'telegram') {
      window.open(`https://t.me/${item.contact.phone.replace(/[\s+]/g, '')}`, '_blank');
    } else if (type === 'viber') {
      window.open(`viber://chat?number=${item.contact.phone.replace(/\s/g, '')}`, '_blank');
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{category?.icon || '📦'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{category?.name || 'Інше'}</span>
          </div>
          <h3 className="font-semibold text-lg">{item.title}</h3>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            €{item.price}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {conditionLabels[item.condition]}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {item.description}
      </p>

      {/* Location & Date */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {item.city}
        </div>
        <div>•</div>
        <div>{formatDate(item.createdAt)}</div>
      </div>

      {/* Contact */}
      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => handleContact('phone')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
        >
          <Phone className="w-4 h-4" />
          Подзвонити
        </button>
        {item.contact.preferredContact === 'telegram' && (
          <button
            onClick={() => handleContact('telegram')}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            title="Telegram"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
        {item.contact.preferredContact === 'viber' && (
          <button
            onClick={() => handleContact('viber')}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
            title="Viber"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
}
