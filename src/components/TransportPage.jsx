import { useState, useMemo } from 'react';
import { Card, SectionTitle } from './Layout';
import { ArrowRight, Users, Package, Calendar, Phone, MessageCircle, MapPin } from 'lucide-react';
import {
  transportTypes,
  directions,
  scheduleTypes,
  vehicleTypesTransport,
  belgianCities as belgianCitiesTransport,
  ukrainianCities,
  daysOfWeek,
  frequencies,
  mockTransportListings
} from '../data/transport';

export function TransportPage() {
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [fromCity, setFromCity] = useState('all');
  const [toCity, setToCity] = useState('all');

  const filteredListings = useMemo(() => {
    return mockTransportListings.filter(listing => {
      const matchesDirection = selectedDirection === 'all' || listing.direction === selectedDirection;
      const matchesType = selectedType === 'all' || listing.type === selectedType;
      const matchesFrom = fromCity === 'all' || listing.route.from.city === fromCity;
      const matchesTo = toCity === 'all' || listing.route.to.city === toCity;

      return matchesDirection && matchesType && matchesFrom && matchesTo && listing.status === 'active';
    });
  }, [selectedDirection, selectedType, fromCity, toCity]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <SectionTitle>🚐 Транспорт UA ↔ BE</SectionTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Перевезення пасажирів та посилок між країнами
        </p>
      </div>

      {/* Direction selector */}
      <div className="grid grid-cols-3 gap-2">
        {Object.values(directions).map(dir => (
          <button
            key={dir.id}
            onClick={() => setSelectedDirection(selectedDirection === dir.id ? 'all' : dir.id)}
            className={`p-3 rounded-xl text-center transition-all ${
              selectedDirection === dir.id
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="text-xl mb-1">{dir.flag}</div>
            <div className="text-xs font-medium">{dir.name}</div>
          </button>
        ))}
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
        {Object.values(transportTypes).map(type => (
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

      {/* Route filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
            Звідки
          </label>
          <select
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Будь-яке місто</option>
            <optgroup label="Бельгія">
              {belgianCitiesTransport.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
            <optgroup label="Україна">
              {ukrainianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
            Куди
          </label>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Будь-яке місто</option>
            <optgroup label="Бельгія">
              {belgianCitiesTransport.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
            <optgroup label="Україна">
              {ukrainianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Знайдено: {filteredListings.length} {filteredListings.length === 1 ? 'маршрут' : 'маршрутів'}
      </p>

      {/* Listings */}
      <div className="space-y-4">
        {filteredListings.map(listing => (
          <TransportCard key={listing.id} listing={listing} />
        ))}

        {filteredListings.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              😔 Маршрутів не знайдено. Спробуйте змінити фільтри.
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

function TransportCard({ listing }) {
  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  };

  const getScheduleText = () => {
    if (listing.scheduleType === 'one-time') {
      return `${formatDate(listing.departureDate)}`;
    } else {
      const days = listing.daysOfWeek.map(d => daysOfWeek[d]).join(', ');
      return `${frequencies[listing.frequency]}: ${days}`;
    }
  };

  const handleContact = (type) => {
    if (type === 'phone') {
      window.location.href = `tel:${listing.driver.phone}`;
    } else if (type === 'telegram') {
      window.open(`https://t.me/${listing.driver.telegram.replace('@', '')}`, '_blank');
    } else if (type === 'viber') {
      window.open(`viber://chat?number=${listing.driver.viber.replace(/\s/g, '')}`, '_blank');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">{listing.route.from.city}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">{listing.route.to.city}</span>
          </div>
          {listing.route.stops && listing.route.stops.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Через: {listing.route.stops.map(s => s.city).join(' → ')}
            </div>
          )}
        </div>
        <div className="text-2xl">{directions[listing.direction].flag.split(' → ')[0]}</div>
      </div>

      {/* Schedule */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">{getScheduleText()}</span>
      </div>

      {/* Capacity & Type */}
      <div className="flex gap-3 text-sm">
        {(listing.type === 'passengers' || listing.type === 'combined') && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
            <Users className="w-4 h-4" />
            {listing.capacity.passengers} {listing.capacity.passengers === 1 ? 'місце' : 'місць'}
          </div>
        )}
        {(listing.type === 'parcels' || listing.type === 'combined') && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
            <Package className="w-4 h-4" />
            До {listing.capacity.parcels.maxWeight} кг
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="flex gap-4 text-sm">
        {listing.pricing.passengerPrice > 0 && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Пасажир: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              €{listing.pricing.passengerPrice}
            </span>
          </div>
        )}
        {listing.pricing.parcelPricePerKg > 0 && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Посилка: </span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              €{listing.pricing.parcelPricePerKg}/кг
            </span>
          </div>
        )}
      </div>

      {/* Driver */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="font-medium">{listing.driver.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {vehicleTypesTransport[listing.driver.vehicle.type]} • {listing.driver.vehicle.model}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {listing.driver.experience}
            </div>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {listing.description}
          </p>
        )}

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {listing.amenities.map(amenity => (
              <span
                key={amenity}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Contact buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleContact('phone')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            <Phone className="w-4 h-4" />
            Подзвонити
          </button>
          {listing.driver.telegram && (
            <button
              onClick={() => handleContact('telegram')}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              title="Telegram"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
          {listing.driver.viber && (
            <button
              onClick={() => handleContact('viber')}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              title="Viber"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
