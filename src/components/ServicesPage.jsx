import { useState, useMemo } from 'react';
import { Card, SectionTitle } from './Layout';
import { serviceCategories, belgianCities } from '../data/categories';
import { services } from '../data/services';
import { ChevronRight, MapPin, Filter, X, Phone, MessageCircle, Search, ArrowLeft, Clock, Route } from 'lucide-react';

export function ServicesPage({ onNavigate, initialCategoryFilter = null }) {
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || '');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (categoryFilter && service.category !== categoryFilter) return false;
      if (cityFilter && service.city !== cityFilter) return false;
      if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !service.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [categoryFilter, cityFilter, searchQuery]);

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
                  getCategoryIcon={getCategoryIcon}
                  getCityName={getCityName}
                  getCategoryName={getCategoryName}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </>
        ) : (
          /* Category Cards */
          <div className="grid gap-3">
            {serviceCategories.map((cat) => {
              const count = services.filter(s => s.category === cat.id).length;
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
                        {count} спеціалістів
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
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
        Знайдено: {filteredServices.length} спеціалістів
      </p>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            getCategoryIcon={getCategoryIcon}
            getCityName={getCityName}
            getCategoryName={getCategoryName}
            onNavigate={onNavigate}
            showCategory={false}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Нічого не знайдено
          </p>
          <button
            onClick={() => setCityFilter('')}
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Показати всі
          </button>
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, getCategoryIcon, getCityName, getCategoryName, onNavigate, showCategory = true }) {
  const isTransport = service.category === 'transport';

  return (
    <Card
      className="p-4"
      onClick={() => onNavigate('service', { serviceId: service.id })}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl flex-shrink-0">
          {getCategoryIcon(service.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {service.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{getCityName(service.city)}</span>
            {showCategory && (
              <>
                <span>•</span>
                <span>{getCategoryName(service.category)}</span>
              </>
            )}
          </div>

          {/* Transport-specific info */}
          {isTransport && service.route && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
              <Route className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{service.route}</span>
              {service.schedule && (
                <>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{service.schedule}</span>
                </>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {service.description}
          </p>

          {/* Price tag for transport */}
          {isTransport && service.price && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg">
                {service.price}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
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
  const isTransport = service.category === 'transport';

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
          <span>{city?.name.split(' / ')[0] || service.city}</span>
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 font-medium">
          {category?.icon} {category?.name}
        </span>
      </div>

      {/* Transport specific info */}
      {isTransport && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {service.route && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Маршрут</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  {service.route}
                </p>
              </div>
            )}
            {service.schedule && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Графік</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  {service.schedule}
                </p>
              </div>
            )}
            {service.price && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ціна</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  {service.price}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Description */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">
          Про {isTransport ? 'перевізника' : 'спеціаліста'}
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
