import { useState } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Search, Clock } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// Categories for food
const categories = [
  { id: 'all', name: 'Все', icon: '🍽️' },
  { id: 'homemade', name: 'Домашня їжа', icon: '🥘' },
  { id: 'ukrainian', name: 'Продукти з України', icon: '🇺🇦' },
  { id: 'baking', name: 'Випічка', icon: '🥐' },
  { id: 'drinks', name: 'Напої', icon: '🍷' },
  { id: 'sweets', name: 'Солодощі', icon: '🍬' },
  { id: 'preserves', name: 'Консервація', icon: '🫙' },
];

const cities = [
  { id: 'all', name: 'Вся Бельгія' },
  { id: 'brussels', name: 'Брюссель' },
  { id: 'antwerp', name: 'Антверпен' },
  { id: 'ghent', name: 'Гент' },
  { id: 'liege', name: 'Льєж' },
  { id: 'bruges', name: 'Брюгге' },
  { id: 'other', name: 'Інше місто' },
];

// Mock data for food
const mockFoodItems = [
  {
    id: '1',
    title: 'Домашні вареники з картоплею',
    category: 'homemade',
    price: 12,
    unit: 'за 1 кг',
    city: 'brussels',
    description: 'Ліплю на замовлення. Можу з картоплею, сиром, вишнею. Мінімальне замовлення 1 кг.',
    contact: { phone: '+32 470 111 222', telegram: '@varenyky_be' },
    availableDays: 'Сб-Нд',
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '2',
    title: 'Сало українське, домашнє',
    category: 'ukrainian',
    price: 18,
    unit: 'за 1 кг',
    city: 'antwerp',
    description: 'Привезено з України. Сало з прошарком, засолене з часником та перцем.',
    contact: { telegram: '@ukraine_products' },
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '3',
    title: 'Торт Київський на замовлення',
    category: 'baking',
    price: 45,
    unit: 'за торт',
    city: 'brussels',
    description: 'Готую справжній Київський торт за оригінальним рецептом. Замовлення за 3 дні.',
    contact: { phone: '+32 485 333 444', telegram: '@cakes_brussels' },
    availableDays: 'За замовленням',
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '4',
    title: 'Цукерки Roshen, Корона',
    category: 'sweets',
    price: 8,
    unit: 'за упаковку',
    city: 'ghent',
    description: 'Привезені з України. Є різні види: Roshen, Корона, АВК. Пишіть для списку.',
    contact: { telegram: '@ua_sweets' },
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '5',
    title: 'Домашня горілка на горіхах',
    category: 'drinks',
    price: 25,
    unit: 'за 0.5л',
    city: 'liege',
    description: 'Настоянка на волоських горіхах. Є також на меду та травах.',
    contact: { phone: '+32 499 555 666' },
    createdAt: new Date('2026-01-02'),
  },
  {
    id: '6',
    title: 'Мамина консервація: огірки, помідори',
    category: 'preserves',
    price: 6,
    unit: 'за банку',
    city: 'brussels',
    description: 'Домашні мариновані огірки та помідори. Як в Україні! 0.5л банки.',
    contact: { telegram: '@mama_konservy' },
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '7',
    title: 'Борщ домашній',
    category: 'homemade',
    price: 8,
    unit: 'за 1л',
    city: 'brussels',
    description: 'Готую український борщ на замовлення. Зі сметаною та пампушками +2€.',
    contact: { phone: '+32 476 777 888', telegram: '@borsch_be' },
    availableDays: 'Пт-Нд',
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '8',
    title: 'Хліб Бородінський',
    category: 'baking',
    price: 5,
    unit: 'за буханку',
    city: 'antwerp',
    description: 'Печу справжній Бородінський хліб. Замовлення за день.',
    contact: { telegram: '@bread_ua' },
    availableDays: 'За замовленням',
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '9',
    title: 'Ковбаса домашня з України',
    category: 'ukrainian',
    price: 22,
    unit: 'за 1 кг',
    city: 'brussels',
    description: 'Привезено з Закарпаття. Сиров\'ялена ковбаса.',
    contact: { phone: '+32 468 999 000' },
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '10',
    title: 'Медовик на замовлення',
    category: 'baking',
    price: 35,
    unit: 'за торт',
    city: 'ghent',
    description: 'Класичний медовик з натурального меду. 8 порцій.',
    contact: { telegram: '@medovyk_gent' },
    availableDays: 'За замовленням',
    createdAt: new Date('2026-01-02'),
  },
];

// Add Food Form Component
function AddFoodForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'homemade',
    price: '',
    unit: 'за порцію',
    city: 'brussels',
    description: '',
    phone: '',
    telegram: '',
    availableDays: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      price: parseInt(formData.price) || 0,
      unit: formData.unit,
      city: formData.city,
      description: formData.description,
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      availableDays: formData.availableDays,
      createdAt: new Date(),
      isUserItem: true,
    };

    onAdd(newItem);
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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Назва *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Домашні вареники"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Категорія</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Одиниця</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="за порцію">за порцію</option>
                <option value="за 1 кг">за 1 кг</option>
                <option value="за упаковку">за упаковку</option>
                <option value="за банку">за банку</option>
                <option value="за 0.5л">за 0.5л</option>
                <option value="за 1л">за 1л</option>
                <option value="за торт">за торт</option>
                <option value="за штуку">за штуку</option>
              </select>
            </div>
          </div>

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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Коли доступно</label>
            <input
              type="text"
              value={formData.availableDays}
              onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Наприклад: Сб-Нд або За замовленням"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Додайте деталі про продукт..."
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

// Food Card Component
function FoodCard({ item, isFavorite, onToggleFavorite }) {
  const [showContacts, setShowContacts] = useState(false);
  const category = categories.find(c => c.id === item.category);
  const city = cities.find(c => c.id === item.city);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{category?.icon}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{category?.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className="p-2 -m-2"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {item.price > 0 ? (
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              €{item.price} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Ціна договірна</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {city?.name || item.city}
          </span>
          {item.availableDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.availableDays}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {item.description}
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
            {item.contact?.phone && (
              <a
                href={`tel:${item.contact.phone}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <Phone className="w-4 h-4" />
                {item.contact.phone}
              </a>
            )}
            {item.contact?.telegram && (
              <a
                href={`https://t.me/${item.contact.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <MessageCircle className="w-4 h-4" />
                {item.contact.telegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Main Food Page
export function FoodPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userItems, setUserItems] = useState(() => loadFromStorage('food-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('food-favorites', []));

  const allItems = [...userItems, ...mockFoodItems].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredItems = allItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddItem = (item) => {
    const updated = [item, ...userItems];
    setUserItems(updated);
    saveToStorage('food-items', updated);
  };

  const toggleFavorite = (itemId) => {
    const updated = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    setFavorites(updated);
    saveToStorage('food-favorites', updated);
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
        Приватні оголошення. Відповідальність за якість продуктів несе продавець.
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук їжі та напоїв..."
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
        Знайдено: {filteredItems.length} оголошень
      </p>

      {/* Items Grid */}
      <div className="grid gap-4">
        {filteredItems.map(item => (
          <FoodCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
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
        <AddFoodForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}
