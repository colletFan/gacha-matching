const STORAGE_KEY = 'gacha-matching:data';
const VERSION = 1;

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed.version !== VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load data', e);
    return null;
  }
};

export const saveData = (data) => {
  try {
    const payload = { ...data, version: VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
