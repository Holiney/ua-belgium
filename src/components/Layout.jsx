import { Home, ShoppingBag, UtensilsCrossed, Building2, Briefcase, ArrowLeft } from 'lucide-react';

export function Header({ title, showBack, onBack }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">🇺🇦</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {title || 'UA Belgium'}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Головна', icon: Home },
    { id: 'products', label: 'Товари', icon: ShoppingBag },
    { id: 'food', label: 'Їжа', icon: UtensilsCrossed },
    { id: 'rental', label: 'Оренда', icon: Building2 },
    { id: 'services', label: 'Послуги', icon: Briefcase },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe">
      <div className="max-w-2xl mx-auto flex justify-around">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id ||
            (id === 'home' && (currentPage === 'guides' || currentPage === 'category' || currentPage === 'article' || currentPage === 'news' || currentPage === 'news-detail')) ||
            (id === 'services' && (currentPage === 'service' || currentPage === 'transport'));

          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function PageContainer({ children, className = '' }) {
  return (
    <main className={`max-w-2xl mx-auto pt-20 pb-24 px-4 ${className}`}>
      {children}
    </main>
  );
}

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all active:scale-[0.98]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-bold text-gray-900 dark:text-white mb-4 ${className}`}>
      {children}
    </h2>
  );
}
