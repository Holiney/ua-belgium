import { useState } from 'react';
import { Card, SectionTitle } from './Layout';
import { Pin, Eye, Calendar, User, ChevronRight } from 'lucide-react';
import { newsCategories, mockNews } from '../data/news';

export function NewsPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNews = selectedCategory === 'all'
    ? mockNews
    : mockNews.filter(news => news.category === selectedCategory);

  // Sort: pinned first, then by date
  const sortedNews = [...filteredNews].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.publishedAt - a.publishedAt;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <SectionTitle>📰 Новини та оголошення</SectionTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Важлива інформація для українців у Бельгії
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Всі новини
        </button>
        {Object.values(newsCategories).map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="space-y-4">
        {sortedNews.map(news => (
          <NewsCard
            key={news.id}
            news={news}
            onNavigate={onNavigate}
          />
        ))}

        {sortedNews.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Новин не знайдено в цій категорії
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function NewsCard({ news, onNavigate }) {
  const category = newsCategories[news.category];

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сьогодні';
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  };

  const categoryColors = {
    red: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };

  return (
    <Card
      onClick={() => onNavigate('news-detail', { newsId: news.id })}
      className="relative overflow-hidden"
    >
      {/* Pinned indicator */}
      {news.isPinned && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-medium">
          <Pin className="w-3 h-3" />
          Закріплено
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[category.color]}`}>
            {category.icon} {category.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg leading-tight pr-8">
          {news.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {news.summary}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(news.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {news.author}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {news.views}
          </div>
          <div className="ml-auto">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NewsDetailPage({ newsId, onBack }) {
  const news = mockNews.find(n => n.id === newsId);

  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Новину не знайдено</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 dark:text-blue-400"
        >
          Повернутися назад
        </button>
      </div>
    );
  }

  const category = newsCategories[news.category];

  const categoryColors = {
    red: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${categoryColors[category.color]}`}>
          {category.icon} {category.name}
        </span>
        {news.isPinned && (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
            <Pin className="w-4 h-4" />
            Закріплено
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight">
        {news.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatFullDate(news.publishedAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          {news.author}
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          {news.views} переглядів
        </div>
      </div>

      {/* Content */}
      <Card className="p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {news.content.split('\n').map((line, i) => {
            // Parse markdown-like syntax
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4">{line.slice(2)}</li>;
            }
            if (line.match(/^\d+\. /)) {
              return <li key={i} className="ml-4 list-decimal">{line.slice(line.indexOf(' ') + 1)}</li>;
            }
            if (line.includes('**')) {
              const parts = line.split('**');
              return (
                <p key={i} className="mb-3">
                  {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                </p>
              );
            }
            if (line.trim() === '') {
              return <br key={i} />;
            }
            return <p key={i} className="mb-3">{line}</p>;
          })}
        </div>
      </Card>
    </div>
  );
}
