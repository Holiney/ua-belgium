import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, UtensilsCrossed, Building2, Phone, MessageCircle, MapPin, Home, Clock, Calendar, Gift } from 'lucide-react';
import { Card } from './Layout';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { supabase, isBackendReady, getListings } from '../lib/supabase';

// Import categories and cities from page components
import { categories as productCategories, cities as productCities } from './ProductsPage';
import { categories as foodCategories, cities as foodCities } from './FoodPage';
import { categories as rentalCategories, cities as rentalCities } from './RentalPage';

// Tab config
const tabs = [
  { id: 'all', name: 'Всі', icon: Heart },
  { id: 'products', name: 'Товари', icon: ShoppingBag },
  { id: 'food', name: 'Їжа', icon: UtensilsCrossed },
  { id: 'rental', name: 'Оренда', icon: Building2 },
];

// Product Card
function ProductCard({ item, onRemove }) {
  const [showContacts, setShowContacts] = useState(false);
  const category = productCategories?.find(c => c.id === item.category);
  const city = productCities?.find(c => c.id === item.city);
  const isLooking = item.listingType === 'looking';

  // Handle both local and Supabase data formats
  const isFree = item.isFree || item.is_free;
  const contactPhone = item.contact?.phone || item.contact_phone;
  const contactTelegram = item.contact?.telegram || item.contact_telegram;

  return (
    <Card className={`overflow-hidden ${isLooking ? 'border-l-4 border-l-purple-500' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Товар</span>
              {isLooking && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  Шукаю
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 -m-2"
          >
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {isFree ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              <Gift className="w-4 h-4" />
              Безкоштовно
            </span>
          ) : item.price > 0 ? (
            <span className={`text-lg font-bold ${isLooking ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {isLooking ? 'до ' : ''}€{item.price}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Договірна</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          {city?.name || item.city}
        </div>

        <button
          onClick={() => setShowContacts(!showContacts)}
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showContacts ? 'Сховати контакти' : 'Показати контакти'}
        </button>

        {showContacts && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
            {contactTelegram && (
              <a href={`https://t.me/${contactTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                {contactTelegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Food Card
function FoodCard({ item, onRemove }) {
  const [showContacts, setShowContacts] = useState(false);
  const city = foodCities?.find(c => c.id === item.city);
  const isLooking = item.listingType === 'looking';

  // Handle both local and Supabase data formats
  const contactPhone = item.contact?.phone || item.contact_phone;
  const contactTelegram = item.contact?.telegram || item.contact_telegram;

  return (
    <Card className={`overflow-hidden ${isLooking ? 'border-l-4 border-l-purple-500' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">Їжа</span>
              {isLooking && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  Шукаю
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 -m-2">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {item.price > 0 ? (
            <span className={`text-lg font-bold ${isLooking ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {isLooking ? 'до ' : ''}€{item.price} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
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
          {item.availableDays && !isLooking && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.availableDays}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowContacts(!showContacts)}
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showContacts ? 'Сховати контакти' : 'Показати контакти'}
        </button>

        {showContacts && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
            {contactTelegram && (
              <a href={`https://t.me/${contactTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                {contactTelegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Rental Card
function RentalCard({ item, onRemove }) {
  const [showContacts, setShowContacts] = useState(false);
  const city = rentalCities?.find(c => c.id === item.city);
  const isLooking = item.listingType === 'looking';

  // Handle both local and Supabase data formats
  const contactPhone = item.contact?.phone || item.contact_phone;
  const contactTelegram = item.contact?.telegram || item.contact_telegram;

  const priceLabel = {
    month: '/міс',
    day: '/добу',
    week: '/тиждень',
  };

  return (
    <Card className={`overflow-hidden ${isLooking ? 'border-l-4 border-l-purple-500' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Оренда</span>
              {isLooking && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  Шукаю
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 -m-2">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xl font-bold ${isLooking ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {isLooking ? 'до ' : ''}€{item.price}
            <span className="text-sm font-normal text-gray-500">{priceLabel[item.priceType]}</span>
          </span>
          {item.rooms && (
            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              <Home className="w-3.5 h-3.5" />
              {item.rooms} {item.rooms === 1 ? 'кімната' : item.rooms < 5 ? 'кімнати' : 'кімнат'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          {city?.name}{item.district && `, ${item.district}`}
        </div>

        {item.available && (
          <div className={`flex items-center gap-1 text-sm mb-2 ${isLooking ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
            <Calendar className="w-4 h-4" />
            {item.available}
          </div>
        )}

        <button
          onClick={() => setShowContacts(!showContacts)}
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showContacts ? 'Сховати контакти' : 'Показати контакти'}
        </button>

        {showContacts && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
            {contactTelegram && (
              <a href={`https://t.me/${contactTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                {contactTelegram}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Main Favorites Page
export function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [productFavorites, setProductFavorites] = useState(() => loadFromStorage('products-favorites', []));
  const [foodFavorites, setFoodFavorites] = useState(() => loadFromStorage('food-favorites', []));
  const [rentalFavorites, setRentalFavorites] = useState(() => loadFromStorage('rental-favorites', []));

  // State for loaded data
  const [allProducts, setAllProducts] = useState([]);
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase or localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isBackendReady && supabase) {
          const [productsRes, foodRes, rentalsRes] = await Promise.all([
            getListings('products'),
            getListings('food'),
            getListings('rentals'),
          ]);
          setAllProducts(productsRes.data || []);
          setAllFoodItems(foodRes.data || []);
          setAllRentals(rentalsRes.data || []);
        } else {
          setAllProducts(loadFromStorage('products-items', []));
          setAllFoodItems(loadFromStorage('food-items', []));
          setAllRentals(loadFromStorage('rental-items', []));
        }
      } catch (err) {
        console.error('Error loading favorites data:', err);
        setAllProducts(loadFromStorage('products-items', []));
        setAllFoodItems(loadFromStorage('food-items', []));
        setAllRentals(loadFromStorage('rental-items', []));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Get favorite items
  const favoriteProducts = allProducts.filter(item => productFavorites.includes(item.id));
  const favoriteFoodItems = allFoodItems.filter(item => foodFavorites.includes(item.id));
  const favoriteRentals = allRentals.filter(item => rentalFavorites.includes(item.id));

  // Remove handlers
  const removeProductFavorite = (id) => {
    const updated = productFavorites.filter(fid => fid !== id);
    setProductFavorites(updated);
    saveToStorage('products-favorites', updated);
  };

  const removeFoodFavorite = (id) => {
    const updated = foodFavorites.filter(fid => fid !== id);
    setFoodFavorites(updated);
    saveToStorage('food-favorites', updated);
  };

  const removeRentalFavorite = (id) => {
    const updated = rentalFavorites.filter(fid => fid !== id);
    setRentalFavorites(updated);
    saveToStorage('rental-favorites', updated);
  };

  // Count totals
  const totalCount = favoriteProducts.length + favoriteFoodItems.length + favoriteRentals.length;

  // Filter by active tab
  const showProducts = activeTab === 'all' || activeTab === 'products';
  const showFood = activeTab === 'all' || activeTab === 'food';
  const showRentals = activeTab === 'all' || activeTab === 'rental';

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">збережених оголошень</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'all' ? totalCount :
            tab.id === 'products' ? favoriteProducts.length :
            tab.id === 'food' ? favoriteFoodItems.length :
            favoriteRentals.length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.name}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Products */}
        {showProducts && favoriteProducts.length > 0 && (
          <div className="space-y-3">
            {activeTab === 'all' && (
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Товари ({favoriteProducts.length})
              </h3>
            )}
            {favoriteProducts.map(item => (
              <ProductCard
                key={`product-${item.id}`}
                item={item}
                onRemove={() => removeProductFavorite(item.id)}
              />
            ))}
          </div>
        )}

        {/* Food */}
        {showFood && favoriteFoodItems.length > 0 && (
          <div className="space-y-3">
            {activeTab === 'all' && (
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Їжа та напої ({favoriteFoodItems.length})
              </h3>
            )}
            {favoriteFoodItems.map(item => (
              <FoodCard
                key={`food-${item.id}`}
                item={item}
                onRemove={() => removeFoodFavorite(item.id)}
              />
            ))}
          </div>
        )}

        {/* Rentals */}
        {showRentals && favoriteRentals.length > 0 && (
          <div className="space-y-3">
            {activeTab === 'all' && (
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Оренда ({favoriteRentals.length})
              </h3>
            )}
            {favoriteRentals.map(item => (
              <RentalCard
                key={`rental-${item.id}`}
                item={item}
                onRemove={() => removeRentalFavorite(item.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Поки що порожньо
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Натискайте на серце, щоб зберегти оголошення, які вам сподобалися
            </p>
          </div>
        )}

        {/* Tab-specific empty state */}
        {activeTab !== 'all' && (
          (activeTab === 'products' && favoriteProducts.length === 0) ||
          (activeTab === 'food' && favoriteFoodItems.length === 0) ||
          (activeTab === 'rental' && favoriteRentals.length === 0)
        ) && totalCount > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Немає збережених {activeTab === 'products' ? 'товарів' : activeTab === 'food' ? 'їжі' : 'оренди'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
