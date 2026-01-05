import { Card, SectionTitle } from './Layout';
import { guideCategories, serviceCategories } from '../data/categories';
import { ChevronRight, BookOpen, Briefcase, Heart, Info } from 'lucide-react';

export function HomePage({ onNavigate }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-yellow-400 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🇺🇦</div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Ласкаво просимо!</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Ваш помічник для життя в Бельгії. Корисні гайди та перевірені українські спеціалісти.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center" onClick={() => onNavigate('guides')}>
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Корисних гайдів</div>
        </Card>
        <Card className="p-4 text-center" onClick={() => onNavigate('services')}>
          <Briefcase className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">18+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Спеціалістів</div>
        </Card>
      </div>

      {/* Guide Categories Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="mb-0">Категорії гайдів</SectionTitle>
          <button
            onClick={() => onNavigate('guides')}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
          >
            Усі <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {guideCategories.slice(0, 6).map((category) => (
            <Card
              key={category.id}
              className="p-4 text-center"
              onClick={() => onNavigate('category', { categoryId: category.id })}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                {category.name}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="mb-0">Категорії послуг</SectionTitle>
          <button
            onClick={() => onNavigate('services')}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
          >
            Усі <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {serviceCategories.slice(0, 3).map((category) => (
            <Card
              key={category.id}
              className="p-4 flex items-center gap-4"
              onClick={() => onNavigate('services', { categoryFilter: category.id })}
            >
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Card>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <Card className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Про UA Belgium
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ми створили цей додаток, щоб допомогти українцям швидше адаптуватися до життя в Бельгії.
              Всі гайди перевірені, а спеціалісти — реальні люди з нашої громади.
            </p>
          </div>
        </div>
      </Card>

      {/* Support Ukraine */}
      <Card className="p-5 bg-gradient-to-br from-yellow-50 to-blue-50 dark:from-yellow-900/20 dark:to-blue-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-4">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Слава Україні! 🇺🇦
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Разом ми сильніші
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
