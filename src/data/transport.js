// Transport UA ↔ Belgium mock data

export const transportTypes = {
  passengers: { id: 'passengers', name: 'Пасажири', icon: '👥' },
  parcels: { id: 'parcels', name: 'Посилки', icon: '📦' },
  combined: { id: 'combined', name: 'Пасажири + Посилки', icon: '🚐' }
};

export const directions = {
  'be-to-ua': { id: 'be-to-ua', name: 'Бельгія → Україна', flag: '🇧🇪 → 🇺🇦' },
  'ua-to-be': { id: 'ua-to-be', name: 'Україна → Бельгія', flag: '🇺🇦 → 🇧🇪' },
  'both': { id: 'both', name: 'В обидва боки', flag: '🔄' }
};

export const scheduleTypes = {
  'one-time': 'Разова поїздка',
  'regular': 'Регулярні поїздки'
};

export const vehicleTypesTransport = {
  car: 'Легковий автомобіль',
  van: 'Мікроавтобус',
  bus: 'Автобус',
  truck: 'Вантажівка'
};

export const belgianCities = [
  'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège',
  'Bruges', 'Namur', 'Leuven', 'Mons', 'Hasselt'
];

export const ukrainianCities = [
  'Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro',
  'Ivano-Frankivsk', 'Ternopil', 'Lutsk', 'Rivne', 'Uzhhorod',
  'Chernivtsi', 'Vinnytsia', 'Zhytomyr', 'Cherkasy', 'Poltava'
];

export const daysOfWeek = {
  1: 'Понеділок',
  2: 'Вівторок',
  3: 'Середа',
  4: 'Четвер',
  5: 'П\'ятниця',
  6: 'Субота',
  0: 'Неділя'
};

export const frequencies = {
  weekly: 'Щотижня',
  'bi-weekly': 'Раз на 2 тижні',
  monthly: 'Щомісяця'
};

// Mock data
export const mockTransportListings = [
  {
    id: '1',
    type: 'combined',
    direction: 'be-to-ua',
    route: {
      from: { country: 'belgium', city: 'Brussels' },
      to: { country: 'ukraine', city: 'Lviv' },
      stops: [
        { city: 'Cologne', country: 'germany' },
        { city: 'Prague', country: 'czech' },
        { city: 'Krakow', country: 'poland' }
      ]
    },
    scheduleType: 'regular',
    frequency: 'weekly',
    daysOfWeek: [5], // П'ятниця
    capacity: {
      passengers: 6,
      parcels: {
        maxWeight: 50,
        maxVolume: '2 м³',
        restrictions: 'Без крихких речей'
      }
    },
    pricing: {
      passengerPrice: 80,
      parcelPricePerKg: 3,
      currency: 'EUR',
      negotiable: false
    },
    driver: {
      name: 'Ігор',
      phone: '+32 476 12 34 56',
      telegram: '@igor_transport',
      viber: '+32476123456',
      experience: '5 років регулярних перевезень BE-UA',
      vehicle: {
        type: 'van',
        model: 'Mercedes Sprinter',
        photo: ''
      }
    },
    description: 'Комфортний мікроавтобус з кондиціонером. WiFi на борту. Можлива доставка до дверей у Львові.',
    amenities: ['WiFi', 'A/C', 'Зарядки USB'],
    requirements: 'Закордонний паспорт обов\'язковий',
    status: 'active',
    createdAt: new Date('2026-01-03')
  },
  {
    id: '2',
    type: 'parcels',
    direction: 'ua-to-be',
    route: {
      from: { country: 'ukraine', city: 'Kyiv' },
      to: { country: 'belgium', city: 'Brussels' },
      stops: [
        { city: 'Lviv', country: 'ukraine' },
        { city: 'Warsaw', country: 'poland' }
      ]
    },
    scheduleType: 'one-time',
    departureDate: new Date('2026-01-20'),
    arrivalDate: new Date('2026-01-23'),
    capacity: {
      passengers: 0,
      parcels: {
        maxWeight: 200,
        maxVolume: '5 м³',
        restrictions: 'Документи, невеликі меблі, особисті речі'
      }
    },
    pricing: {
      passengerPrice: 0,
      parcelPricePerKg: 2.5,
      currency: 'EUR',
      negotiable: true
    },
    driver: {
      name: 'Сергій',
      phone: '+380 67 123 4567',
      telegram: '@sergiy_cargo',
      experience: '3 роки',
      vehicle: {
        type: 'van',
        model: 'Fiat Ducato',
        photo: ''
      }
    },
    description: 'Швидка доставка посилок. Можливість забрати з дому в Києві та довезти до адреси в Брюсселі.',
    amenities: [],
    requirements: 'Опис вмісту посилки обов\'язковий',
    status: 'active',
    createdAt: new Date('2026-01-02')
  },
  {
    id: '3',
    type: 'passengers',
    direction: 'be-to-ua',
    route: {
      from: { country: 'belgium', city: 'Antwerp' },
      to: { country: 'ukraine', city: 'Odesa' },
      stops: [
        { city: 'Brussels', country: 'belgium' },
        { city: 'Munich', country: 'germany' },
        { city: 'Vienna', country: 'austria' },
        { city: 'Lviv', country: 'ukraine' }
      ]
    },
    scheduleType: 'one-time',
    departureDate: new Date('2026-01-15'),
    arrivalDate: new Date('2026-01-18'),
    capacity: {
      passengers: 2,
      parcels: {
        maxWeight: 10,
        maxVolume: 'Невеликий багаж',
        restrictions: 'Тільки ручна поклажа'
      }
    },
    pricing: {
      passengerPrice: 120,
      parcelPricePerKg: 0,
      currency: 'EUR',
      negotiable: true
    },
    driver: {
      name: 'Дмитро',
      phone: '+32 485 98 76 54',
      telegram: '@dmytro_drive',
      viber: '+32485987654',
      experience: 'Їжджу регулярно вже 2 роки',
      vehicle: {
        type: 'car',
        model: 'BMW X5',
        photo: ''
      }
    },
    description: 'Їду додому в Одесу на свята. Можу взяти 2 пасажирів. Комфортна поїздка, досвідчений водій.',
    amenities: ['A/C', 'Музика'],
    requirements: 'Без паління',
    status: 'active',
    createdAt: new Date('2025-12-28')
  }
];
