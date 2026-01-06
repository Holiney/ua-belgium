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
  },
  {
    id: '4',
    category: 'electronics',
    title: 'iPhone 13 Pro 256GB',
    price: 550,
    currency: 'EUR',
    city: 'Brussels',
    region: 'brussels',
    description: 'Телефон у відмінному стані, завжди був у чохлі. Батарея 89%. Повний комплект з коробкою.',
    condition: 'like-new',
    contact: {
      name: 'Олексій',
      phone: '+32 478 99 88 77',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-05'),
    photos: []
  },
  {
    id: '5',
    category: 'kids',
    title: 'Дитяча коляска Bugaboo Fox',
    price: 320,
    currency: 'EUR',
    city: 'Leuven',
    region: 'flanders',
    description: 'Преміум коляска в ідеальному стані. Люлька + прогулянковий блок. Дощовик у комплекті.',
    condition: 'excellent',
    contact: {
      name: 'Вікторія',
      phone: '+32 489 11 22 33',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '6',
    category: 'household',
    title: 'Кавомашина DeLonghi Magnifica',
    price: 250,
    currency: 'EUR',
    city: 'Bruges',
    region: 'flanders',
    description: 'Автоматична кавомашина з капучинатором. Працює бездоганно, регулярно чистилась.',
    condition: 'good',
    contact: {
      name: 'Ігор',
      phone: '+32 476 55 44 33',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '7',
    category: 'furniture',
    title: 'Письмовий стіл з полицями',
    price: 85,
    currency: 'EUR',
    city: 'Liège',
    region: 'wallonia',
    description: 'Зручний стіл для роботи вдома. Розміри 140x60 см. Є вбудовані полиці.',
    condition: 'good',
    contact: {
      name: 'Тетяна',
      phone: '+32 495 66 77 88',
      preferredContact: 'viber'
    },
    status: 'active',
    createdAt: new Date('2026-01-03'),
    photos: []
  },
  {
    id: '8',
    category: 'electronics',
    title: 'PlayStation 5 + 2 геймпади',
    price: 420,
    currency: 'EUR',
    city: 'Antwerp',
    region: 'flanders',
    description: 'Консоль у відмінному стані. В комплекті 2 геймпади та 3 гри (FIFA, GTA, Spider-Man).',
    condition: 'like-new',
    contact: {
      name: 'Максим',
      phone: '+32 488 12 34 56',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-05'),
    photos: []
  },
  {
    id: '9',
    category: 'household',
    title: 'Набір кухонного посуду Tefal',
    price: 75,
    currency: 'EUR',
    city: 'Brussels',
    region: 'brussels',
    description: 'Каструлі та сковорідки Tefal (5 предметів). Антипригарне покриття у хорошому стані.',
    condition: 'good',
    contact: {
      name: 'Наталія',
      phone: '+32 479 22 33 44',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-02'),
    photos: []
  },
  {
    id: '10',
    category: 'kids',
    title: 'Дитяче ліжечко IKEA Sundvik',
    price: 60,
    currency: 'EUR',
    city: 'Ghent',
    region: 'flanders',
    description: 'Дерев\'яне ліжечко з матрацом. Регулюється по висоті. Білого кольору.',
    condition: 'good',
    contact: {
      name: 'Юлія',
      phone: '+32 468 99 00 11',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-01'),
    photos: []
  },
  {
    id: '11',
    category: 'other',
    title: 'Велосипед Giant Escape 3',
    price: 280,
    currency: 'EUR',
    city: 'Mechelen',
    region: 'flanders',
    description: 'Гібридний велосипед для міста. Рама М. Нещодавно пройшов ТО у веломайстерні.',
    condition: 'good',
    contact: {
      name: 'Дмитро',
      phone: '+32 477 88 99 00',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '12',
    category: 'electronics',
    title: 'MacBook Air M1 2020',
    price: 700,
    currency: 'EUR',
    city: 'Brussels',
    region: 'brussels',
    description: 'Ноутбук Apple у відмінному стані. 8GB RAM, 256GB SSD. Батарея тримає 10+ годин.',
    condition: 'like-new',
    contact: {
      name: 'Артем',
      phone: '+32 489 55 66 77',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-06'),
    photos: []
  }
];
