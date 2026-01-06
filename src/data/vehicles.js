// Vehicles mock data

export const vehicleTypes = {
  car: { id: 'car', name: 'Легковий автомобіль', icon: '🚗' },
  motorcycle: { id: 'motorcycle', name: 'Мотоцикл', icon: '🏍️' },
  van: { id: 'van', name: 'Фургон', icon: '🚐' },
  other: { id: 'other', name: 'Інше', icon: '🚙' }
};

export const fuelTypes = {
  petrol: 'Бензин',
  diesel: 'Дизель',
  electric: 'Електро',
  hybrid: 'Гібрид'
};

export const transmissionTypes = {
  manual: 'Механіка',
  automatic: 'Автомат'
};

export const vehicleConditions = {
  excellent: 'Відмінний',
  good: 'Добрий',
  fair: 'Задовільний',
  'needs-repair': 'Потребує ремонту'
};

export const popularBrands = [
  'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford',
  'Renault', 'Peugeot', 'Opel', 'Skoda', 'Volvo', 'Honda',
  'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Citroën', 'Fiat', 'Seat', 'Інше'
];

// Mock data
export const mockVehicles = [
  {
    id: '1',
    type: 'car',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2018,
    mileage: 85000,
    mileageUnit: 'km',
    fuelType: 'hybrid',
    transmission: 'automatic',
    price: 14500,
    currency: 'EUR',
    negotiable: true,
    city: 'Brussels',
    region: 'brussels',
    description: 'Повна комплектація, гібрид економний в місті. Технічний огляд до 2027. Один власник, всі сервіси вчасно.',
    condition: 'excellent',
    owners: 1,
    technicalInspection: new Date('2027-03-15'),
    contact: {
      name: 'Василь',
      phone: '+32 478 12 34 56',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '2',
    type: 'car',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2015,
    mileage: 145000,
    mileageUnit: 'km',
    fuelType: 'diesel',
    transmission: 'manual',
    price: 8900,
    currency: 'EUR',
    negotiable: true,
    city: 'Antwerp',
    region: 'flanders',
    description: 'Надійний автомобіль, регулярне ТО. Нові гальма та шини. Ціна договірна.',
    condition: 'good',
    owners: 2,
    technicalInspection: new Date('2026-08-20'),
    contact: {
      name: 'Олександр',
      phone: '+32 491 23 45 67',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-03'),
    photos: []
  },
  {
    id: '3',
    type: 'car',
    brand: 'BMW',
    model: '320d',
    year: 2019,
    mileage: 65000,
    mileageUnit: 'km',
    fuelType: 'diesel',
    transmission: 'automatic',
    price: 22500,
    currency: 'EUR',
    negotiable: true,
    city: 'Ghent',
    region: 'flanders',
    description: 'М-пакет, шкіряний салон, навігація, LED-фари. Сервісна книжка BMW. Гарантія ще рік.',
    condition: 'excellent',
    owners: 1,
    technicalInspection: new Date('2027-05-10'),
    contact: {
      name: 'Сергій',
      phone: '+32 477 33 44 55',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-05'),
    photos: []
  },
  {
    id: '4',
    type: 'car',
    brand: 'Renault',
    model: 'Clio',
    year: 2017,
    mileage: 92000,
    mileageUnit: 'km',
    fuelType: 'petrol',
    transmission: 'manual',
    price: 7200,
    currency: 'EUR',
    negotiable: true,
    city: 'Liège',
    region: 'wallonia',
    description: 'Економний міський автомобіль. Кондиціонер, Bluetooth. Ідеальний для міста.',
    condition: 'good',
    owners: 2,
    technicalInspection: new Date('2026-11-15'),
    contact: {
      name: 'Оксана',
      phone: '+32 468 22 11 00',
      preferredContact: 'viber'
    },
    status: 'active',
    createdAt: new Date('2026-01-02'),
    photos: []
  },
  {
    id: '5',
    type: 'car',
    brand: 'Mercedes-Benz',
    model: 'C200',
    year: 2016,
    mileage: 125000,
    mileageUnit: 'km',
    fuelType: 'petrol',
    transmission: 'automatic',
    price: 16800,
    currency: 'EUR',
    negotiable: true,
    city: 'Brussels',
    region: 'brussels',
    description: 'Avantgarde комплектація. Повний електропакет, панорамний дах, камера заднього виду.',
    condition: 'good',
    owners: 2,
    technicalInspection: new Date('2026-09-20'),
    contact: {
      name: 'Михайло',
      phone: '+32 479 55 66 77',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '6',
    type: 'car',
    brand: 'Skoda',
    model: 'Octavia Combi',
    year: 2020,
    mileage: 48000,
    mileageUnit: 'km',
    fuelType: 'diesel',
    transmission: 'automatic',
    price: 19500,
    currency: 'EUR',
    negotiable: false,
    city: 'Leuven',
    region: 'flanders',
    description: 'Сімейний універсал з великим багажником. DSG коробка, круїз-контроль, Android Auto.',
    condition: 'excellent',
    owners: 1,
    technicalInspection: new Date('2027-08-01'),
    contact: {
      name: 'Петро',
      phone: '+32 488 99 88 77',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-06'),
    photos: []
  },
  {
    id: '7',
    type: 'van',
    brand: 'Renault',
    model: 'Kangoo',
    year: 2018,
    mileage: 110000,
    mileageUnit: 'km',
    fuelType: 'diesel',
    transmission: 'manual',
    price: 9800,
    currency: 'EUR',
    negotiable: true,
    city: 'Antwerp',
    region: 'flanders',
    description: 'Вантажний фургон для малого бізнесу. Великий вантажний простір, економний двигун.',
    condition: 'good',
    owners: 1,
    technicalInspection: new Date('2026-07-15'),
    contact: {
      name: 'Віктор',
      phone: '+32 476 11 22 33',
      preferredContact: 'phone'
    },
    status: 'active',
    createdAt: new Date('2026-01-03'),
    photos: []
  },
  {
    id: '8',
    type: 'car',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2021,
    mileage: 32000,
    mileageUnit: 'km',
    fuelType: 'hybrid',
    transmission: 'automatic',
    price: 28500,
    currency: 'EUR',
    negotiable: true,
    city: 'Brussels',
    region: 'brussels',
    description: 'Новий кузов, гібрид. Повний привід, підігрів сидінь, Apple CarPlay. Гарантія до 2028.',
    condition: 'excellent',
    owners: 1,
    technicalInspection: new Date('2028-02-20'),
    contact: {
      name: 'Анна',
      phone: '+32 489 44 55 66',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-05'),
    photos: []
  },
  {
    id: '9',
    type: 'motorcycle',
    brand: 'Honda',
    model: 'CB500F',
    year: 2019,
    mileage: 18000,
    mileageUnit: 'km',
    fuelType: 'petrol',
    transmission: 'manual',
    price: 5200,
    currency: 'EUR',
    negotiable: true,
    city: 'Ghent',
    region: 'flanders',
    description: 'Ідеальний мотоцикл для початківців категорії A2. Економний, надійний, легкий в керуванні.',
    condition: 'excellent',
    owners: 1,
    technicalInspection: new Date('2027-04-10'),
    contact: {
      name: 'Денис',
      phone: '+32 477 88 99 00',
      preferredContact: 'telegram'
    },
    status: 'active',
    createdAt: new Date('2026-01-04'),
    photos: []
  },
  {
    id: '10',
    type: 'car',
    brand: 'Peugeot',
    model: '308 SW',
    year: 2019,
    mileage: 75000,
    mileageUnit: 'km',
    fuelType: 'diesel',
    transmission: 'automatic',
    price: 14200,
    currency: 'EUR',
    negotiable: true,
    city: 'Namur',
    region: 'wallonia',
    description: 'Універсал з великим багажником. Автомат EAT8, навігація, паркувальні сенсори.',
    condition: 'good',
    owners: 1,
    technicalInspection: new Date('2026-12-05'),
    contact: {
      name: 'Ірина',
      phone: '+32 495 33 22 11',
      preferredContact: 'viber'
    },
    status: 'active',
    createdAt: new Date('2026-01-02'),
    photos: []
  }
];
