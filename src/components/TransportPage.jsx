import { useState, useMemo, useEffect } from 'react';
import { Card, SectionTitle } from './Layout';
import { ArrowRight, Users, Package, Calendar, Phone, MessageCircle, MapPin, Plus, X, Heart } from 'lucide-react';
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
import { loadFromStorage, saveToStorage } from '../utils/storage';

export function TransportPage() {
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [fromCity, setFromCity] = useState('all');
  const [toCity, setToCity] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [userListings, setUserListings] = useState(() => loadFromStorage('transport-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('transport-favorites', []));

  // Збереження даних при зміні
  useEffect(() => {
    saveToStorage('transport-items', userListings);
  }, [userListings]);

  useEffect(() => {
    saveToStorage('transport-favorites', favorites);
  }, [favorites]);

  // Об'єднання mock даних з користувацькими
  const allListings = useMemo(() => {
    const userListingsWithDates = userListings.map(l => ({
      ...l,
      createdAt: new Date(l.createdAt),
      departureDate: l.departureDate ? new Date(l.departureDate) : null,
      arrivalDate: l.arrivalDate ? new Date(l.arrivalDate) : null
    }));
    return [...userListingsWithDates, ...mockTransportListings];
  }, [userListings]);

  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      const matchesDirection = selectedDirection === 'all' || listing.direction === selectedDirection;
      const matchesType = selectedType === 'all' || listing.type === selectedType;
      const matchesFrom = fromCity === 'all' || listing.route.from.city === fromCity;
      const matchesTo = toCity === 'all' || listing.route.to.city === toCity;

      return matchesDirection && matchesType && matchesFrom && matchesTo && listing.status === 'active';
    });
  }, [selectedDirection, selectedType, fromCity, toCity, allListings]);

  const handleAddListing = (newListing) => {
    const listing = {
      ...newListing,
      id: `user-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setUserListings(prev => [listing, ...prev]);
    setShowAddForm(false);
  };

  const toggleFavorite = (listingId) => {
    setFavorites(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <SectionTitle>🚐 Перевезення UA ↔ BE</SectionTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Пасажири та посилки між Україною та Бельгією
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
          <TransportCard
            key={listing.id}
            listing={listing}
            isFavorite={favorites.includes(listing.id)}
            onToggleFavorite={() => toggleFavorite(listing.id)}
          />
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
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddTransportForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddListing}
        />
      )}
    </div>
  );
}

function AddTransportForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'combined',
    direction: 'be-to-ua',
    fromCity: 'Brussels',
    toCity: 'Kyiv',
    scheduleType: 'one-time',
    departureDate: '',
    frequency: 'weekly',
    daysOfWeek: [],
    passengerSeats: 4,
    parcelMaxWeight: 50,
    passengerPrice: 80,
    parcelPricePerKg: 3,
    driverName: '',
    driverPhone: '',
    driverTelegram: '',
    driverViber: '',
    driverExperience: '',
    vehicleType: 'van',
    vehicleModel: '',
    description: '',
    amenities: []
  });

  const amenityOptions = ['WiFi', 'A/C', 'Зарядки USB', 'Кава/Чай', 'Зупинки на вимогу'];
  const dayOptions = [
    { id: 1, name: 'Пн' },
    { id: 2, name: 'Вт' },
    { id: 3, name: 'Ср' },
    { id: 4, name: 'Чт' },
    { id: 5, name: 'Пт' },
    { id: 6, name: 'Сб' },
    { id: 0, name: 'Нд' }
  ];

  const toggleDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayId)
        ? prev.daysOfWeek.filter(d => d !== dayId)
        : [...prev.daysOfWeek, dayId]
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.driverName || !formData.driverPhone || !formData.vehicleModel) {
      alert('Заповніть обов\'язкові поля: ім\'я водія, телефон, модель авто');
      return;
    }
    if (formData.scheduleType === 'one-time' && !formData.departureDate) {
      alert('Вкажіть дату виїзду');
      return;
    }
    if (formData.scheduleType === 'regular' && formData.daysOfWeek.length === 0) {
      alert('Оберіть дні тижня для регулярних поїздок');
      return;
    }

    // Determine country from city
    const isFromBelgium = belgianCitiesTransport.includes(formData.fromCity);
    const isToBelgium = belgianCitiesTransport.includes(formData.toCity);

    onSubmit({
      type: formData.type,
      direction: formData.direction,
      route: {
        from: {
          country: isFromBelgium ? 'belgium' : 'ukraine',
          city: formData.fromCity
        },
        to: {
          country: isToBelgium ? 'belgium' : 'ukraine',
          city: formData.toCity
        },
        stops: []
      },
      scheduleType: formData.scheduleType,
      ...(formData.scheduleType === 'one-time' ? {
        departureDate: formData.departureDate
      } : {
        frequency: formData.frequency,
        daysOfWeek: formData.daysOfWeek
      }),
      capacity: {
        passengers: formData.type !== 'parcels' ? parseInt(formData.passengerSeats) : 0,
        parcels: formData.type !== 'passengers' ? {
          maxWeight: parseInt(formData.parcelMaxWeight),
          maxVolume: '',
          restrictions: ''
        } : null
      },
      pricing: {
        passengerPrice: formData.type !== 'parcels' ? parseFloat(formData.passengerPrice) : 0,
        parcelPricePerKg: formData.type !== 'passengers' ? parseFloat(formData.parcelPricePerKg) : 0,
        currency: 'EUR',
        negotiable: true
      },
      driver: {
        name: formData.driverName,
        phone: formData.driverPhone,
        telegram: formData.driverTelegram || null,
        viber: formData.driverViber || null,
        experience: formData.driverExperience,
        vehicle: {
          type: formData.vehicleType,
          model: formData.vehicleModel,
          photo: ''
        }
      },
      description: formData.description,
      amenities: formData.amenities,
      requirements: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-y-auto mt-12 rounded-t-3xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Додати маршрут</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
          {/* Тип перевезення */}
          <div>
            <label className="block text-sm font-medium mb-2">Тип перевезення</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(transportTypes).map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.id})}
                  className={`p-3 rounded-xl text-center transition-all ${
                    formData.type === type.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="text-xs mt-1">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Напрямок */}
          <div>
            <label className="block text-sm font-medium mb-2">Напрямок</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(directions).map(dir => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => setFormData({...formData, direction: dir.id})}
                  className={`p-3 rounded-xl text-center transition-all ${
                    formData.direction === dir.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-lg">{dir.flag}</div>
                  <div className="text-xs mt-1">{dir.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Маршрут */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Звідки</label>
              <select
                value={formData.fromCity}
                onChange={(e) => setFormData({...formData, fromCity: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
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
              <label className="block text-sm font-medium mb-2">Куди</label>
              <select
                value={formData.toCity}
                onChange={(e) => setFormData({...formData, toCity: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Україна">
                  {ukrainianCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
                <optgroup label="Бельгія">
                  {belgianCitiesTransport.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Тип розкладу */}
          <div>
            <label className="block text-sm font-medium mb-2">Тип поїздки</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, scheduleType: 'one-time'})}
                className={`p-3 rounded-xl text-center transition-all ${
                  formData.scheduleType === 'one-time'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Разова
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, scheduleType: 'regular'})}
                className={`p-3 rounded-xl text-center transition-all ${
                  formData.scheduleType === 'regular'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Регулярна
              </button>
            </div>
          </div>

          {/* Дата виїзду (для разових) */}
          {formData.scheduleType === 'one-time' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Дата виїзду <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Регулярний розклад */}
          {formData.scheduleType === 'regular' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Частота</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(frequencies).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Дні тижня <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {dayOptions.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                        formData.daysOfWeek.includes(day.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Місткість та ціни */}
          {formData.type !== 'parcels' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Кількість місць</label>
                <input
                  type="number"
                  value={formData.passengerSeats}
                  onChange={(e) => setFormData({...formData, passengerSeats: e.target.value})}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ціна за пасажира (€)</label>
                <input
                  type="number"
                  value={formData.passengerPrice}
                  onChange={(e) => setFormData({...formData, passengerPrice: e.target.value})}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {formData.type !== 'passengers' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Макс. вага посилок (кг)</label>
                <input
                  type="number"
                  value={formData.parcelMaxWeight}
                  onChange={(e) => setFormData({...formData, parcelMaxWeight: e.target.value})}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ціна за кг (€)</label>
                <input
                  type="number"
                  value={formData.parcelPricePerKg}
                  onChange={(e) => setFormData({...formData, parcelPricePerKg: e.target.value})}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Інформація про водія */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3">Інформація про водія</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ім'я <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                  placeholder="Ваше ім'я"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                  placeholder="+32 4XX XX XX XX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Telegram</label>
                  <input
                    type="text"
                    value={formData.driverTelegram}
                    onChange={(e) => setFormData({...formData, driverTelegram: e.target.value})}
                    placeholder="@username"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Viber</label>
                  <input
                    type="text"
                    value={formData.driverViber}
                    onChange={(e) => setFormData({...formData, driverViber: e.target.value})}
                    placeholder="+32..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Досвід перевезень</label>
                <input
                  type="text"
                  value={formData.driverExperience}
                  onChange={(e) => setFormData({...formData, driverExperience: e.target.value})}
                  placeholder="5 років регулярних поїздок"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Транспортний засіб */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3">Транспортний засіб</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Тип</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(vehicleTypesTransport).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Модель <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                  placeholder="Mercedes Sprinter"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Зручності */}
          <div>
            <label className="block text-sm font-medium mb-2">Зручності</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-medium mb-2">Додаткова інформація</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Особливості поїздки, зупинки по дорозі, правила..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            Опублікувати маршрут
          </button>
        </form>
      </div>
    </div>
  );
}

function TransportCard({ listing, isFavorite, onToggleFavorite }) {
  const formatDate = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
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
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
          <div className="text-2xl">{directions[listing.direction]?.flag.split(' → ')[0] || '🚐'}</div>
        </div>
      </div>

      {/* Schedule */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">{getScheduleText()}</span>
      </div>

      {/* Capacity & Type */}
      <div className="flex gap-3 text-sm">
        {(listing.type === 'passengers' || listing.type === 'combined') && listing.capacity?.passengers > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
            <Users className="w-4 h-4" />
            {listing.capacity.passengers} {listing.capacity.passengers === 1 ? 'місце' : 'місць'}
          </div>
        )}
        {(listing.type === 'parcels' || listing.type === 'combined') && listing.capacity?.parcels && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
            <Package className="w-4 h-4" />
            До {listing.capacity.parcels.maxWeight} кг
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="flex gap-4 text-sm">
        {listing.pricing?.passengerPrice > 0 && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Пасажир: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              €{listing.pricing.passengerPrice}
            </span>
          </div>
        )}
        {listing.pricing?.parcelPricePerKg > 0 && (
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
              {vehicleTypesTransport[listing.driver.vehicle?.type] || 'Авто'} • {listing.driver.vehicle?.model}
            </div>
            {listing.driver.experience && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {listing.driver.experience}
              </div>
            )}
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
