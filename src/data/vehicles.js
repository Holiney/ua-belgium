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
  }
];
