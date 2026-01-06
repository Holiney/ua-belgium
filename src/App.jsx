import { useState, useEffect } from 'react';
import { Header, BottomNav, PageContainer } from './components/Layout';
import { HomePage } from './components/HomePage';
import { GuidesPage, CategoryPage, ArticlePage } from './components/GuidesPage';
import { ServicesPage, ServiceProfilePage } from './components/ServicesPage';
import { ProductsPage } from './components/ProductsPage';
import { FoodPage } from './components/FoodPage';
import { RentalPage } from './components/RentalPage';
import { NewsPage, NewsDetailPage } from './components/NewsPage';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { loadFromStorage, saveToStorage } from './utils/storage';

export default function App() {
  const [page, setPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [theme, setTheme] = useState(() => loadFromStorage('app-theme', 'light'));

  // Theme handling
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    saveToStorage('app-theme', theme);
  }, [theme]);

  // Handle hardware back button on mobile
  useEffect(() => {
    const handleBackButton = () => {
      goBack();
    };

    window.addEventListener('app-back-button', handleBackButton);
    return () => window.removeEventListener('app-back-button', handleBackButton);
  }, [navigationHistory, page, pageParams]);

  // Navigation handler
  const navigate = (newPage, params = {}) => {
    setNavigationHistory(prev => [...prev, { page, params: pageParams }]);
    setPage(newPage);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back handler
  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setPage(previous.page);
      setPageParams(previous.params);
    } else {
      setPage('home');
      setPageParams({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bottom nav handler (resets history)
  const navigateFromNav = (newPage) => {
    setNavigationHistory([]);
    setPage(newPage);
    setPageParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine page title and if back button should show
  const getHeaderConfig = () => {
    switch (page) {
      case 'home':
        return { title: 'UA Belgium', showBack: false };
      case 'guides':
        return { title: 'База знань', showBack: true };
      case 'category':
        return { title: 'Категорія', showBack: true };
      case 'article':
        return { title: 'Стаття', showBack: true };
      case 'services':
        return { title: 'Послуги', showBack: false };
      case 'service':
        return { title: 'Спеціаліст', showBack: true };
      case 'products':
        return { title: 'Товари', showBack: false };
      case 'food':
        return { title: 'Їжа та напої', showBack: false };
      case 'rental':
        return { title: 'Оренда житла', showBack: false };
      case 'news':
        return { title: 'Новини', showBack: true };
      case 'news-detail':
        return { title: 'Новина', showBack: true };
      default:
        return { title: 'UA Belgium', showBack: false };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <PWAInstallBanner />

      <Header
        title={headerConfig.title}
        showBack={headerConfig.showBack}
        onBack={goBack}
      />

      <PageContainer>
        {page === 'home' && (
          <HomePage onNavigate={navigate} />
        )}

        {page === 'guides' && (
          <GuidesPage onNavigate={navigate} />
        )}

        {page === 'category' && (
          <CategoryPage
            categoryId={pageParams.categoryId}
            onNavigate={navigate}
            onBack={goBack}
          />
        )}

        {page === 'article' && (
          <ArticlePage
            articleId={pageParams.articleId}
            onBack={goBack}
          />
        )}

        {page === 'services' && (
          <ServicesPage
            onNavigate={navigate}
            initialCategoryFilter={pageParams.categoryFilter}
          />
        )}

        {page === 'service' && (
          <ServiceProfilePage
            serviceId={pageParams.serviceId}
            onBack={goBack}
          />
        )}

        {page === 'products' && (
          <ProductsPage />
        )}

        {page === 'food' && (
          <FoodPage />
        )}

        {page === 'rental' && (
          <RentalPage />
        )}

        {page === 'news' && (
          <NewsPage onNavigate={navigate} />
        )}

        {page === 'news-detail' && (
          <NewsDetailPage
            newsId={pageParams.newsId}
            onBack={goBack}
          />
        )}
      </PageContainer>

      <BottomNav
        currentPage={page}
        onNavigate={navigateFromNav}
      />
    </div>
  );
}
