import { useState, useMemo } from 'react';
import { Card, SectionTitle } from './Layout';
import { Search, Filter, MapPin, Phone, MessageCircle, Calendar, Gauge } from 'lucide-react';
import {
  vehicleTypes,
  fuelTypes,
  transmissionTypes,
  vehicleConditions,
  popularBrands,
  mockVehicles
} from '../data/vehicles';
import { belgianCities } from '../data/marketplace';

export function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || vehicle.type === selectedType;
      const matchesCity = selectedCity === 'all' || vehicle.city === selectedCity;
      const matchesBrand = selectedBrand === 'all' || vehicle.brand === selectedBrand;

      return matchesSearch && matchesType && matchesCity && matchesBrand && vehicle.status === 'active';
    });
  }, [searchQuery, selectedType, selectedCity, selectedBrand]);

  const activeFilters = [selectedCity, selectedBrand].filter(f => f !== 'all').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <SectionTitle>🚗 Автомобілі</SectionTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Купівля-продаж авто та мотоциклів
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук по марці або моделі..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedType === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Всі типи
        </button>
        {Object.values(vehicleTypes).map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === type.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {type.icon} {type.name}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
        >
          <Filter className="w-4 h-4" />
          Додаткові фільтри
          {activeFilters > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full text-xs">
              {activeFilters}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Марка</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Всі марки</option>
                {popularBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

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

      {/* Results */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Знайдено: {filteredVehicles.length}
      </p>

      {/* Vehicles grid */}
      <div className="grid gap-4">
        {filteredVehicles.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}

        {filteredVehicles.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              😔 Автомобілів не знайдено. Спробуйте змінити фільтри.
            </p>
          </Card>
        )}
      </div>

      {/* Add button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl z-30">
        +
      </button>
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
  };

  const handleContact = (type) => {
    if (type === 'phone') {
      window.location.href = `tel:${vehicle.contact.phone}`;
    } else if (type === 'telegram') {
      window.open(`https://t.me/${vehicle.contact.phone.replace(/\s/g, '')}`, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-6xl">{vehicleTypes[vehicle.type].icon}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-xl">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {vehicle.year} • {fuelTypes[vehicle.fuelType]} • {transmissionTypes[vehicle.transmission]}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              €{vehicle.price.toLocaleString()}
            </div>
            {vehicle.negotiable && (
              <div className="text-xs text-gray-500">договірна</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Gauge className="w-4 h-4" />
            {vehicle.mileage.toLocaleString()} км
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            ТО до {formatDate(vehicle.technicalInspection)}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {vehicle.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          {vehicle.city}
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
          {vehicle.contact.preferredContact === 'telegram' && (
            <button
              onClick={() => handleContact('telegram')}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              title="Telegram"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
