import { Card, SectionTitle } from './Layout';
import { guideCategories } from '../data/categories';
import { mockNews } from '../data/news';
import { ChevronRight, Heart, Info, Pin } from 'lucide-react';

// Emergency contacts data
const emergencyContacts = [
  { id: '112', name: 'Екстрена допомога', number: '112', description: 'Поліція, пожежна, швидка', icon: '🆘', color: 'red' },
  { id: 'embassy', name: 'Посольство України', number: '+32 2 379 21 00', description: 'Консульський відділ', icon: '🇺🇦', color: 'blue' },
  { id: 'police', name: 'Поліція', number: '101', description: 'Неекстрений виклик', icon: '👮', color: 'blue' },
  { id: 'medical', name: 'Медична допомога', number: '1733', description: 'Лікар на черговості', icon: '🏥', color: 'green' },
];

const APP_VERSION = 'v3.1';

export function HomePage({ onNavigate }) {
  // Get latest 2 pinned or recent news
  const latestNews = [...mockNews]
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.publishedAt - a.publishedAt;
    })
    .slice(0, 2);

  const formatDate = (date) => {
    const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Сьогодні';
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-yellow-400 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-2 left-2 opacity-20 text-6xl">🇧🇪</div>
        <div className="absolute bottom-2 right-2 opacity-20 text-6xl">🇺🇦</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇧🇪</span>
            <span className="text-lg">❤️</span>
            <span className="text-2xl">🇺🇦</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Ласкаво просимо!</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Ваш помічник для життя в Бельгії. Гайди, послуги та оголошення для українців.
          </p>
        </div>
      </div>

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle className="mb-0">Останні новини</SectionTitle>
            <button
              onClick={() => onNavigate('news')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
            >
              Всі <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {latestNews.map(news => (
              <Card
                key={news.id}
                className="p-4"
                onClick={() => onNavigate('news-detail', { newsId: news.id })}
              >
                {news.isPinned && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                    <Pin className="w-3 h-3" />
                    Закріплено
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {news.summary}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(news.publishedAt)}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Guide Categories Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="mb-0">База знань</SectionTitle>
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

      {/* Emergency Contacts */}
      <section>
        <SectionTitle>Екстрені контакти</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {emergencyContacts.map(contact => (
            <a
              key={contact.id}
              href={`tel:${contact.number.replace(/\s/g, '')}`}
              className={`p-4 rounded-2xl border transition-all hover:shadow-md active:scale-98 ${
                contact.color === 'red'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : contact.color === 'green'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{contact.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {contact.name}
                  </div>
                  <div className={`text-lg font-bold ${
                    contact.color === 'red'
                      ? 'text-red-600 dark:text-red-400'
                      : contact.color === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {contact.number}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {contact.description}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

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

      {/* Version Footer */}
      <div className="text-center pt-4 pb-2">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          UA Belgium {APP_VERSION}
        </p>
      </div>
    </div>
  );
}
