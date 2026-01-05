import { Card, SectionTitle } from './Layout';
import { guideCategories } from '../data/categories';
import { articles } from '../data/articles';
import { ChevronRight, FileText } from 'lucide-react';

export function GuidesPage({ onNavigate }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📚 База знань
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Покрокові гайди для життя в Бельгії
        </p>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        {guideCategories.map((category) => {
          const categoryArticles = articles.filter(a => a.category === category.id);

          return (
            <Card
              key={category.id}
              className="overflow-hidden"
              onClick={() => onNavigate('category', { categoryId: category.id })}
            >
              <div className={`bg-gradient-to-r ${category.color} p-4`}>
                <div className="flex items-center gap-3 text-white">
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-white/80 text-sm">
                      {categoryArticles.length} {categoryArticles.length === 1 ? 'стаття' : 'статей'}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/80" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryPage({ categoryId, onNavigate, onBack }) {
  const category = guideCategories.find(c => c.id === categoryId);
  const categoryArticles = articles.filter(a => a.category === categoryId);

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Категорію не знайдено</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Header */}
      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-white/80">
              {categoryArticles.length} {categoryArticles.length === 1 ? 'стаття' : 'статей'}
            </p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {categoryArticles.map((article) => (
          <Card
            key={article.id}
            className="p-4"
            onClick={() => onNavigate('article', { articleId: article.id })}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {article.summary}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>

      {categoryArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500 dark:text-gray-400">
            Статті незабаром з'являться
          </p>
        </div>
      )}
    </div>
  );
}

export function ArticlePage({ articleId, onBack }) {
  const article = articles.find(a => a.id === articleId);
  const category = article ? guideCategories.find(c => c.id === article.category) : null;

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Статтю не знайдено</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Article Header */}
      <div>
        {category && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {article.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {article.summary}
        </p>
      </div>

      {/* Steps */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> Кроки
        </h2>
        <ol className="space-y-4">
          {article.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 pt-0.5 leading-relaxed">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Tips */}
      {article.tips && article.tips.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span> Корисні поради
          </h2>
          <ul className="space-y-3">
            {article.tips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-yellow-500">✦</span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
        Інформація актуальна на момент публікації.<br />
        Перевіряйте офіційні джерела для найновіших даних.
      </div>
    </div>
  );
}
