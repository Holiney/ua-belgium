import { useState, useMemo } from 'react';
import { Card, SectionTitle } from './Layout';
import { serviceCategories, belgianCities } from '../data/categories';
import { services } from '../data/services';
import { ChevronRight, MapPin, Filter, X, Phone, MessageCircle } from 'lucide-react';

export function ServicesPage({ onNavigate, initialCategoryFilter = null }) {
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || '');
  const [cityFilter, setCityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (categoryFilter && service.category !== categoryFilter) return false;
      if (cityFilter && service.city !== cityFilter) return false;
      return true;
    });
  }, [categoryFilter, cityFilter]);

  const activeFiltersCount = [categoryFilter, cityFilter].filter(Boolean).length;

  const getCityName = (cityId) => {
    const city = belgianCities.find(c => c.id === cityId);
    return city ? city.name.split(' / ')[0] : cityId;
  };

  const getCategoryName = (catId) => {
    const category = serviceCategories.find(c => c.id === catId);
    return category ? category.name : catId;
  };

  const getCategoryIcon = (catId) => {
    const category = serviceCategories.find(c => c.id === catId);
    return category ? category.icon : '📦';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          💼 Каталог послуг
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Українські спеціалісти в Бельгії
        </p>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Фільтри
          </span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 space-y-4 animate-fade-in">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Категорія
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="">Усі категорії</option>
              {serviceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Місто
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="">Усі міста</option>
              {belgianCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setCityFilter('');
              }}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium"
            >
              <X className="w-4 h-4" />
              Очистити фільтри
            </button>
          )}
        </Card>
      )}

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              {getCategoryIcon(categoryFilter)} {getCategoryName(categoryFilter)}
              <button onClick={() => setCategoryFilter('')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {cityFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {getCityName(cityFilter)}
              <button onClick={() => setCityFilter('')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Знайдено: <span className="font-semibold">{filteredServices.length}</span> спеціалістів
      </p>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className="p-4"
            onClick={() => onNavigate('service', { serviceId: service.id })}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl">
                {getCategoryIcon(service.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {service.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{getCityName(service.city)}</span>
                  <span>•</span>
                  <span>{getCategoryName(service.category)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {service.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Нічого не знайдено
          </p>
          <button
            onClick={() => {
              setCategoryFilter('');
              setCityFilter('');
            }}
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Очистити фільтри
          </button>
        </div>
      )}
    </div>
  );
}

export function ServiceProfilePage({ serviceId, onBack }) {
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Послугу не знайдено</p>
      </div>
    );
  }

  const category = serviceCategories.find(c => c.id === service.category);
  const city = belgianCities.find(c => c.id === service.city);

  const handleContact = () => {
    if (service.contactType === 'phone') {
      window.location.href = `tel:${service.contact}`;
    } else if (service.contactType === 'telegram') {
      window.open(`https://t.me/${service.contact.replace('@', '')}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg mb-4">
          {category?.icon || '👤'}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {service.name}
        </h1>
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{city?.name || service.city}</span>
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 font-medium">
          {category?.icon} {category?.name}
        </span>
      </div>

      {/* Description */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">
          Про спеціаліста
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {service.description}
        </p>
      </Card>

      {/* Contact Section */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
          Контакт
        </h2>
        <button
          onClick={handleContact}
          className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold text-white transition-all active:scale-[0.98] ${
            service.contactType === 'telegram'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          {service.contactType === 'telegram' ? (
            <>
              <MessageCircle className="w-5 h-5" />
              Написати в Telegram
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Зателефонувати
            </>
          )}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          {service.contact}
        </p>
      </Card>

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 px-4">
        UA Belgium не несе відповідальності за якість послуг.
        Завжди перевіряйте відгуки та домовляйтеся про умови заздалегідь.
      </div>
    </div>
  );
}
