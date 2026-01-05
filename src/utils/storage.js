// LocalStorage utilities
export const loadFromStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Error loading from storage:", e);
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
};

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

// Get ISO week number
export const getWeekNumber = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const getCurrentWeekKey = () => getWeekNumber();

export const getAllSavedDates = () => {
  const dates = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && /-data-(\d{4}-\d{2}-\d{2})/.test(key)) {
      const match = key.match(/-data-(\d{4}-\d{2}-\d{2})/);
      if (match) dates.add(match[1]);
    }
  }
  return Array.from(dates).sort().reverse();
};

export const getHistoryData = (date) => {
  const personnel = loadFromStorage(`task1-personnel-data-${date}`, {});
  const cars = loadFromStorage(`task1-cars-data-${date}`, 0);
  const bikes = loadFromStorage(`task2-bikes-data-${date}`, {});
  const office = {};

  // Import PRINT_ROOMS dynamically
  const PRINT_ROOMS = [
    "20", "30", "40", "50", "140", "162", "170",
    "220", "250", "340", "422", "463",
  ];

  PRINT_ROOMS.forEach((room) => {
    const roomData = loadFromStorage(`task3-data-${date}-${room}`, {});
    if (Object.keys(roomData).length > 0) {
      office[room] = roomData;
    }
  });

  return { personnel, cars, bikes, office };
};
