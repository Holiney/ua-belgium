// Marketplace mock data - буде замінено на реальну базу даних

export const marketplaceCategories = {
  household: { id: 'household', name: 'Побутові товари', icon: '🏠' },
  electronics: { id: 'electronics', name: 'Електроніка', icon: '📱' },
  furniture: { id: 'furniture', name: 'Меблі', icon: '🛋️' },
  kids: { id: 'kids', name: 'Дитячі товари', icon: '👶' },
  other: { id: 'other', name: 'Інше', icon: '📦' }
};

export const belgianCities = [
  'Brussels',
  'Antwerp',
  'Ghent',
  'Charleroi',
  'Liège',
  'Bruges',
  'Namur',
  'Leuven',
  'Mons',
  'Mechelen',
  'Aalst',
  'La Louvière',
  'Kortrijk',
  'Hasselt',
  'Ostend',
  'Genk',
  'Seraing',
  'Tournai',
  'Roeselare',
  'Verviers'
];

export const belgianRegions = {
  brussels: 'Брюссель',
  flanders: 'Фландрія',
  wallonia: 'Валлонія'
};

// Mock data для демонстрації
export const mockMarketplaceItems = [
  {
    id: '1',
    category: 'kids',
    title: 'Дитяче крісло Maxi-Cosi',
    price: 45,
    currency: 'EUR',
    city: 'Brussels',
    region: 'brussels',
    description: 'В доброму стані, використовувалось 1 рік. Всі ременці та кріплення на місці.',
    condition: 'good',
    contact: {
      name: 'Олена',
      phone: '+32 471 23 45 67',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-03'),
    photos: []
  },
  {
    id: '2',
    category: 'furniture',
    title: 'Диван IKEA Ektorp',
    price: 120,
    currency: 'EUR',
    city: 'Antwerp',
    region: 'flanders',
    description: 'Тримісний диван, сірого кольору. Чохол можна прати. Самовивіз.',
    condition: 'good',
    contact: {
      name: 'Андрій',
      phone: '+32 493 12 34 56',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-02'),
    photos: []
  },
  {
    id: '3',
    category: 'electronics',
    title: 'Пральна машина Bosch 7kg',
    price: 180,
    currency: 'EUR',
    city: 'Ghent',
    region: 'flanders',
    description: 'Відмінний стан, працює ідеально. Продаю через переїзд.',
    condition: 'like-new',
    contact: {
      name: 'Марія',
      phone: '+32 465 78 90 12',
      preferredContact: 'viber'
    },
    status: 'active',
    createdAt: new Date('2026-01-01'),
    photos: []
  }
];
