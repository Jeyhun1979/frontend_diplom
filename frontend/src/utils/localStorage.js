export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export const saveSearchHistory = (search) => {
  const history = storage.get("searchHistory", []);
  const newHistory = [
    search,
    ...history.filter((h) => h.from !== search.from || h.to !== search.to),
  ].slice(0, 10);
  storage.set("searchHistory", newHistory);
};

export const getSearchHistory = () => {
  return storage.get("searchHistory", []);
};
