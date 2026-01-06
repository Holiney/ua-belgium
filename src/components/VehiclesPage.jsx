import { useState, useMemo, useEffect } from 'react';
import { Card, SectionTitle } from './Layout';
import { Search, Filter, MapPin, Phone, MessageCircle, Calendar, Gauge, Plus, X, Heart } from 'lucide-react';
import {
  vehicleTypes,
  fuelTypes,
  transmissionTypes,
  vehicleConditions,
  popularBrands,
  mockVehicles
} from '../data/vehicles';
import { belgianCities } from '../data/marketplace';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const preferredContacts = {
  'phone': 'Телефон',
  'telegram': 'Telegram',
  'viber': 'Viber'
};

export function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userVehicles, setUserVehicles] = useState(() => loadFromStorage('vehicles-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('vehicles-favorites', []));

  // Збереження даних при зміні
  useEffect(() => {
    saveToStorage('vehicles-items', userVehicles);
  }, [userVehicles]);

  useEffect(() => {
    saveToStorage('vehicles-favorites', favorites);
  }, [favorites]);

  // Об'єднання mock даних з користувацькими
  const allVehicles = useMemo(() => {
    const userVehiclesWithDates = userVehicles.map(v => ({
      ...v,
      createdAt: new Date(v.createdAt),
      technicalInspection: new Date(v.technicalInspection)
    }));
    return [...userVehiclesWithDates, ...mockVehicles];
  }, [userVehicles]);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || vehicle.type === selectedType;
      const matchesCity = selectedCity === 'all' || vehicle.city === selectedCity;
      const matchesBrand = selectedBrand === 'all' || vehicle.brand === selectedBrand;

      return matchesSearch && matchesType && matchesCity && matchesBrand && vehicle.status === 'active';
    });
  }, [searchQuery, selectedType, selectedCity, selectedBrand, allVehicles]);

  const handleAddVehicle = (newVehicle) => {
    const vehicle = {
      ...newVehicle,
      id: `user-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      photos: []
    };
    setUserVehicles(prev => [vehicle, ...prev]);
    setShowAddForm(false);
  };

  const toggleFavorite = (vehicleId) => {
    setFavorites(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

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
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isFavorite={favorites.includes(vehicle.id)}
            onToggleFavorite={() => toggleFavorite(vehicle.id)}
          />
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
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddVehicleForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddVehicle}
        />
      )}
    </div>
  );
}

function AddVehicleForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'car',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    fuelType: 'petrol',
    transmission: 'manual',
    price: '',
    negotiable: true,
    city: 'Brussels',
    description: '',
    condition: 'good',
    technicalInspection: '',
    contactName: '',
    contactPhone: '',
    preferredContact: 'telegram'
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.price || !formData.contactPhone) {
      alert('Заповніть обов\'язкові поля: марка, модель, ціна, телефон');
      return;
    }
    onSubmit({
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      mileage: parseInt(formData.mileage) || 0,
      mileageUnit: 'km',
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      price: parseFloat(formData.price),
      currency: 'EUR',
      negotiable: formData.negotiable,
      city: formData.city,
      description: formData.description,
      condition: formData.condition,
      owners: 1,
      technicalInspection: formData.technicalInspection || new Date(currentYear + 1, 0, 1).toISOString(),
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
            <h3 className="text-xl font-bold">Додати автомобіль</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
          {/* Тип транспорту */}
          <div>
            <label className="block text-sm font-medium mb-2">Тип транспорту</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(vehicleTypes).map(type => (
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
                  <div className="text-sm mt-1">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Марка та модель */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Марка <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Оберіть марку</option>
                {popularBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Модель <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="Corolla, Golf..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Рік та пробіг */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Рік випуску</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Пробіг (км)</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                placeholder="85000"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Паливо та КПП */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Паливо</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(fuelTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Коробка передач</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(transmissionTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ціна */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ціна (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="14500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.negotiable}
                  onChange={(e) => setFormData({...formData, negotiable: e.target.checked})}
                  className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">Договірна</span>
              </label>
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
                {Object.entries(vehicleConditions).map(([key, label]) => (
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

          {/* Технічний огляд */}
          <div>
            <label className="block text-sm font-medium mb-2">Технічний огляд до</label>
            <input
              type="date"
              value={formData.technicalInspection}
              onChange={(e) => setFormData({...formData, technicalInspection: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-medium mb-2">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Детальний опис автомобіля, стан, особливості..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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

function VehicleCard({ vehicle, isFavorite, onToggleFavorite }) {
  const formatDate = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
  };

  const handleContact = (type) => {
    if (type === 'phone') {
      window.location.href = `tel:${vehicle.contact.phone}`;
    } else if (type === 'telegram') {
      window.open(`https://t.me/${vehicle.contact.phone.replace(/[\s+]/g, '')}`, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
        <span className="text-6xl">{vehicleTypes[vehicle.type]?.icon || '🚗'}</span>
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
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
