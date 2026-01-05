import { useState, useMemo } from 'react';
import { Card, SectionTitle } from './Layout';
import { Search, Filter, MapPin, Phone, MessageCircle } from 'lucide-react';
import {
  marketplaceCategories,
  belgianCities,
  belgianRegions,
  mockMarketplaceItems
} from '../data/marketplace';

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Фільтрування товарів
  const filteredItems = useMemo(() => {
    return mockMarketplaceItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || item.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity && item.status === 'active';
    });
  }, [searchQuery, selectedCategory, selectedCity]);

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
          <MarketplaceItemCard key={item.id} item={item} />
        ))}

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              😔 Товарів не знайдено. Спробуйте змінити фільтри.
            </p>
          </Card>
        )}
      </div>

      {/* Add button (placeholder) */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl z-30">
        +
      </button>
    </div>
  );
}

function MarketplaceItemCard({ item }) {
  const category = marketplaceCategories[item.category];
  const conditionLabels = {
    'new': 'Новий',
    'like-new': 'Як новий',
    'good': 'Добрий',
    'fair': 'Задовільний'
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сьогодні';
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    return date.toLocaleDateString('uk-UA');
  };

  const handleContact = (type) => {
    if (type === 'phone') {
      window.location.href = `tel:${item.contact.phone}`;
    } else if (type === 'telegram') {
      window.open(`https://t.me/${item.contact.phone.replace(/\s/g, '')}`, '_blank');
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
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{category.name}</span>
          </div>
          <h3 className="font-semibold text-lg">{item.title}</h3>
        </div>
        <div className="text-right">
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
