import { useState } from 'react';
import { Plus, X, Heart, MapPin, Phone, MessageCircle, Gift, Search, Tag } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// Listing types
const listingTypes = [
  { id: 'all', name: 'Всі' },
  { id: 'offer', name: 'Пропоную', icon: '📦', color: 'blue' },
  { id: 'looking', name: 'Шукаю', icon: '🔍', color: 'purple' },
];

// Categories for products
export const categories = [
  { id: 'all', name: 'Всі', icon: '📦' },
  { id: 'electronics', name: 'Електроніка', icon: '📱' },
  { id: 'furniture', name: 'Меблі', icon: '🛋️' },
  { id: 'appliances', name: 'Побутова техніка', icon: '🧺' },
  { id: 'clothing', name: 'Одяг та взуття', icon: '👕' },
  { id: 'kids', name: 'Дитяче', icon: '🧸' },
  { id: 'transport', name: 'Транспорт', icon: '🚗' },
  { id: 'tools', name: 'Інструменти', icon: '🔧' },
  { id: 'sports', name: 'Спорт та хобі', icon: '⚽' },
  { id: 'other', name: 'Інше', icon: '📦' },
];

export const cities = [
  { id: 'all', name: 'Вся Бельгія' },
  { id: 'brussels', name: 'Брюссель' },
  { id: 'antwerp', name: 'Антверпен' },
  { id: 'ghent', name: 'Гент' },
  { id: 'liege', name: 'Льєж' },
  { id: 'bruges', name: 'Брюгге' },
  { id: 'other', name: 'Інше місто' },
];

const conditions = [
  { id: 'all', name: 'Будь-який' },
  { id: 'new', name: 'Нове' },
  { id: 'used', name: 'Б/У' },
];

// Mock data for products
export const mockProducts = [
  {
    id: '1',
    listingType: 'offer',
    title: 'iPhone 13 Pro 256GB',
    category: 'electronics',
    price: 650,
    condition: 'used',
    city: 'brussels',
    description: 'Відмінний стан, повний комплект, батарея 89%',
    contact: { phone: '+32 470 123 456', telegram: '@seller1' },
    isFree: false,
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '2',
    listingType: 'looking',
    title: 'Шукаю дитячу коляску',
    category: 'kids',
    price: 200,
    condition: 'used',
    city: 'antwerp',
    description: 'Шукаю коляску в хорошому стані, бажано Bugaboo або Stokke. Бюджет до €200',
    contact: { telegram: '@looking_stroller' },
    isFree: false,
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '3',
    listingType: 'offer',
    title: 'Диван IKEA Kivik',
    category: 'furniture',
    price: 200,
    condition: 'used',
    city: 'ghent',
    description: 'Сірий диван, 3-місний, самовивіз',
    contact: { telegram: '@furniture_seller' },
    isFree: false,
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '4',
    listingType: 'offer',
    title: 'Дитяче ліжечко з матрацом',
    category: 'kids',
    price: 0,
    condition: 'used',
    city: 'brussels',
    description: 'Віддам безкоштовно, самовивіз з Uccle',
    contact: { phone: '+32 476 345 678' },
    isFree: true,
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '5',
    listingType: 'looking',
    title: 'Шукаю пральну машину',
    category: 'appliances',
    price: 150,
    condition: 'used',
    city: 'liege',
    description: 'Потрібна пральна машина 7+ кг. Можу забрати сам.',
    contact: { phone: '+32 499 456 789' },
    isFree: false,
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '6',
    listingType: 'offer',
    title: 'Велосипед Trek FX 3',
    category: 'transport',
    price: 450,
    condition: 'used',
    city: 'brussels',
    description: 'Гібридний велосипед, розмір M, в ідеальному стані',
    contact: { telegram: '@bike_seller' },
    isFree: false,
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '7',
    listingType: 'offer',
    title: 'PlayStation 5 + 2 контролери',
    category: 'electronics',
    price: 400,
    condition: 'used',
    city: 'antwerp',
    description: 'Консоль з дисководом, мало використовувалась',
    contact: { phone: '+32 468 567 890' },
    isFree: false,
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '8',
    listingType: 'offer',
    title: 'Volkswagen Golf 7 2018',
    category: 'transport',
    price: 14500,
    condition: 'used',
    city: 'brussels',
    description: '1.6 TDI, 95000 км, автомат, повна історія',
    contact: { phone: '+32 477 678 901', telegram: '@auto_be' },
    isFree: false,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '9',
    listingType: 'looking',
    title: 'Шукаю велосипед для дитини',
    category: 'transport',
    price: 100,
    condition: 'used',
    city: 'ghent',
    description: 'Потрібен дитячий велосипед на вік 5-7 років',
    contact: { telegram: '@looking_bike' },
    isFree: false,
    createdAt: new Date('2026-01-04'),
  },
  {
    id: '10',
    listingType: 'offer',
    title: 'Жіноча куртка Zara, M',
    category: 'clothing',
    price: 45,
    condition: 'used',
    city: 'brussels',
    description: 'Демісезонна, носила один сезон',
    contact: { telegram: '@clothes_sell' },
    isFree: false,
    createdAt: new Date('2026-01-04'),
  },
];

// Add Product Form Component
function AddProductForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    listingType: 'offer',
    title: '',
    category: 'electronics',
    price: '',
    condition: 'used',
    city: 'brussels',
    description: '',
    phone: '',
    telegram: '',
    isFree: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newProduct = {
      id: Date.now().toString(),
      listingType: formData.listingType,
      title: formData.title,
      category: formData.category,
      price: formData.isFree ? 0 : (parseInt(formData.price) || 0),
      condition: formData.condition,
      city: formData.city,
      description: formData.description,
      contact: {
        phone: formData.phone,
        telegram: formData.telegram,
      },
      isFree: formData.isFree,
      createdAt: new Date(),
      isUserItem: true,
    };

    onAdd(newProduct);
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
          {/* Listing Type Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Тип оголошення</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, listingType: 'offer' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                  formData.listingType === 'offer'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 dark:text-gray-200'
                }`}
              >
                <span>📦</span> Пропоную
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, listingType: 'looking' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                  formData.listingType === 'looking'
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'border-gray-300 dark:border-gray-600 dark:text-gray-200'
                }`}
              >
                <span>🔍</span> Шукаю
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              {formData.listingType === 'offer' ? 'Що пропонуєте?' : 'Що шукаєте?'} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={formData.listingType === 'offer' ? "Наприклад: iPhone 13 Pro" : "Наприклад: Дитяча коляска"}
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

          {formData.listingType === 'offer' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-medium dark:text-gray-200">🎁 Віддам безкоштовно</span>
              </label>
            </div>
          )}

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                {formData.listingType === 'offer' ? 'Ціна (€)' : 'Бюджет (€)'}
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0 = договірна"
              />
            </div>
          )}

          {formData.listingType === 'offer' && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Стан</label>
              <div className="flex gap-2">
                {conditions.filter(c => c.id !== 'all').map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: cond.id })}
                    className={`flex-1 py-2 px-4 rounded-xl border transition-colors ${
                      formData.condition === cond.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 dark:border-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {cond.name}
                  </button>
                ))}
              </div>
            </div>
          )}

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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder={formData.listingType === 'offer' ? "Додайте деталі про товар..." : "Опишіть що саме шукаєте..."}
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

// Product Card Component
function ProductCard({ product, isFavorite, onToggleFavorite }) {
  const [showContacts, setShowContacts] = useState(false);
  const category = categories.find(c => c.id === product.category);
  const city = cities.find(c => c.id === product.city);
  const isLooking = product.listingType === 'looking';

  return (
    <Card className={`overflow-hidden ${isLooking ? 'border-l-4 border-l-purple-500' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isLooking ? (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full flex items-center gap-1">
                  🔍 Шукаю
                </span>
              ) : (
                <span className="text-lg">{category?.icon}</span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">{category?.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="p-2 -m-2"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {product.isFree ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              <Gift className="w-4 h-4" />
              Безкоштовно
            </span>
          ) : product.price > 0 ? (
            <span className={`text-lg font-bold ${isLooking ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {isLooking ? 'до ' : ''}€{product.price}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Договірна</span>
          )}
          {!isLooking && product.condition && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              {product.condition === 'new' ? 'Нове' : 'Б/У'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          {city?.name || product.city}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <button
          onClick={() => setShowContacts(!showContacts)}
          className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
            isLooking
              ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          {showContacts ? 'Сховати контакти' : 'Показати контакти'}
        </button>

        {showContacts && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
            {product.contact?.phone && (
              <a
                href={`tel:${product.contact.phone}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <Phone className="w-4 h-4" />
                {product.contact.phone}
              </a>
            )}
            {product.contact?.telegram && (
              <a
                href={`https://t.me/${product.contact.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <MessageCircle className="w-4 h-4" />
                {product.contact.telegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Main Products Page
export function ProductsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedListingType, setSelectedListingType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProducts, setUserProducts] = useState(() => loadFromStorage('products-items', []));
  const [favorites, setFavorites] = useState(() => loadFromStorage('products-favorites', []));

  const allProducts = [...userProducts, ...mockProducts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredProducts = allProducts.filter(product => {
    if (selectedListingType !== 'all' && product.listingType !== selectedListingType) return false;
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && product.city !== selectedCity) return false;
    if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
    if (showFreeOnly && !product.isFree) return false;
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddProduct = (product) => {
    const updated = [product, ...userProducts];
    setUserProducts(updated);
    saveToStorage('products-items', updated);
  };

  const toggleFavorite = (productId) => {
    const updated = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    setFavorites(updated);
    saveToStorage('products-favorites', updated);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук товарів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        />
      </div>

      {/* Listing Type Filter */}
      <div className="flex gap-2">
        {listingTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedListingType(type.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              selectedListingType === type.id
                ? type.id === 'looking'
                  ? 'bg-purple-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {type.icon && <span>{type.icon}</span>}
            {type.name}
          </button>
        ))}
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

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        >
          {cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>

        {selectedListingType !== 'looking' && (
          <>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
            >
              {conditions.map(cond => (
                <option key={cond.id} value={cond.id}>{cond.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                showFreeOnly
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Gift className="w-4 h-4" />
              Безкоштовно
            </button>
          </>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Знайдено: {filteredProducts.length} оголошень
      </p>

      {/* Products Grid */}
      <div className="grid gap-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
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
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}
