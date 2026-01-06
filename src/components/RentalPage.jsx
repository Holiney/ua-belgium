import { useState } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Search, Home, Users, Calendar, Euro } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// Categories for rental
const categories = [
  { id: 'all', name: 'Все', icon: '🏠' },
  { id: 'apartment', name: 'Квартири', icon: '🏢' },
  { id: 'room', name: 'Кімнати', icon: '🚪' },
  { id: 'house', name: 'Будинки', icon: '🏡' },
  { id: 'short-term', name: 'Подобово', icon: '📅' },
];

const cities = [
  { id: 'all', name: 'Вся Бельгія' },
  { id: 'brussels', name: 'Брюссель' },
  { id: 'antwerp', name: 'Антверпен' },
  { id: 'ghent', name: 'Гент' },
  { id: 'liege', name: 'Льєж' },
  { id: 'bruges', name: 'Брюгге' },
  { id: 'leuven', name: 'Лювен' },
  { id: 'other', name: 'Інше місто' },
];

// Mock data for rentals
const mockRentals = [
  {
    id: '1',
    title: 'Затишна квартира біля центру',
    category: 'apartment',
    price: 950,
    priceType: 'month',
    rooms: 2,
    city: 'brussels',
    district: 'Ixelles',
    description: '2-кімнатна квартира, мебльована, поруч метро. Включено воду та опалення.',
    features: ['Мебльована', 'Метро поруч', 'Балкон'],
    contact: { phone: '+32 470 111 222', telegram: '@rental_bru' },
    available: 'з 1 лютого',
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '2',
    title: 'Кімната в спільній квартирі',
    category: 'room',
    price: 450,
    priceType: 'month',
    rooms: 1,
    city: 'ghent',
    district: 'Центр',
    description: 'Кімната 15м² в квартирі з 2 сусідами (українці). Спільна кухня та ванна.',
    features: ['Мебльована', 'Українські сусіди', 'Wi-Fi'],
    contact: { telegram: '@room_gent' },
    available: 'одразу',
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '3',
    title: 'Квартира подобово / короткострок',
    category: 'short-term',
    price: 65,
    priceType: 'day',
    rooms: 1,
    city: 'brussels',
    district: 'Saint-Gilles',
    description: 'Студія для короткострокової оренди. Є все необхідне. Мін. 3 ночі.',
    features: ['Повністю обладнана', 'Wi-Fi', 'Пральна машина'],
    contact: { phone: '+32 485 333 444' },
    available: 'перевірте дати',
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '4',
    title: 'Простора квартира для сім\'ї',
    category: 'apartment',
    price: 1200,
    priceType: 'month',
    rooms: 3,
    city: 'antwerp',
    district: 'Borgerhout',
    description: '3-кімнатна квартира, 85м². Є місце для паркування. Тихий район.',
    features: ['Паркування', 'Тераса', 'Кладовка'],
    contact: { telegram: '@flat_antwerp' },
    available: 'з 15 січня',
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '5',
    title: 'Маленький будинок з садом',
    category: 'house',
    price: 1400,
    priceType: 'month',
    rooms: 3,
    city: 'liege',
    district: 'Передмістя',
    description: 'Окремий будинок, невеликий сад. Тиха вулиця, 15 хв до центру.',
    features: ['Сад', 'Гараж', 'Тихе місце'],
    contact: { phone: '+32 499 555 666' },
    available: 'з 1 березня',
    createdAt: new Date('2026-01-02'),
  },
  {
    id: '6',
    title: 'Кімната для студента',
    category: 'room',
    price: 380,
    priceType: 'month',
    rooms: 1,
    city: 'leuven',
    district: 'Біля університету',
    description: 'Кімната в студентському будинку. 10 хв пішки до KU Leuven.',
    features: ['Поруч університет', 'Спільна кухня', 'Тихо'],
    contact: { telegram: '@student_leuven' },
    available: 'з лютого',
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '7',
    title: 'Квартира на вихідні',
    category: 'short-term',
    price: 80,
    priceType: 'day',
    rooms: 2,
    city: 'bruges',
    district: 'Історичний центр',
    description: 'Атмосферна квартира в центрі Брюгге. Ідеально для туристів.',
    features: ['Центр міста', 'Вигляд на канал', 'Повністю обладнана'],
    contact: { phone: '+32 468 777 888' },
    available: 'перевірте дати',
    createdAt: new Date('2026-01-03'),
  },
];

// Add Rental Form Component
function AddRentalForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'apartment',
    price: '',
    priceType: 'month',
    rooms: '1',
    city: 'brussels',
    district: '',
    description: '',
    features: '',
    phone: '',
    telegram: '',
    available: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newRental = {
      id: Date.now().toString(),
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
      createdAt: new Date(),
      isUserItem: true,
    };

    onAdd(newRental);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">Додати оголошення</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Наприклад: з 1 лютого або одразу"
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
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Опублікувати
          </button>
        </form>
      </div>
    </div>
  );
}

// Rental Card Component
function RentalCard({ rental, isFavorite, onToggleFavorite }) {
  const [showContacts, setShowContacts] = useState(false);
  const category = categories.find(c => c.id === rental.category);
  const city = cities.find(c => c.id === rental.city);

  const priceLabel = {
    month: '/міс',
    day: '/добу',
    week: '/тиждень',
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{category?.icon}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{category?.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{rental.title}</h3>
          </div>
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
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mb-2">
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
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showContacts ? 'Сховати контакти' : 'Показати контакти'}
        </button>

        {showContacts && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
            {rental.contact?.phone && (
              <a
                href={`tel:${rental.contact.phone}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <Phone className="w-4 h-4" />
                {rental.contact.phone}
              </a>
            )}
            {rental.contact?.telegram && (
              <a
                href={`https://t.me/${rental.contact.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <MessageCircle className="w-4 h-4" />
                {rental.contact.telegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Main Rental Page
export function RentalPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRentals, setUserRentals] = useState(() => loadFromStorage('rental-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('rental-favorites', []));

  const allRentals = [...userRentals, ...mockRentals].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredRentals = allRentals.filter(rental => {
    if (selectedCategory !== 'all' && rental.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && rental.city !== selectedCity) return false;
    if (searchQuery && !rental.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddRental = (rental) => {
    const updated = [rental, ...userRentals];
    setUserRentals(updated);
    saveToStorage('rental-items', updated);
  };

  const toggleFavorite = (rentalId) => {
    const updated = favorites.includes(rentalId)
      ? favorites.filter(id => id !== rentalId)
      : [...favorites, rentalId];
    setFavorites(updated);
    saveToStorage('rental-favorites', updated);
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
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddRentalForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddRental}
        />
      )}
    </div>
  );
}
